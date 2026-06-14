#!/usr/bin/env node
/**
 * Blog translation co-pilot — drafts the opposite-language twin of a post.
 *
 * Reads a source post, sends its title/description/tags/body to the n8n
 * translation workflow (automation/n8n/blog-translation-copilot.json), and
 * writes the translated twin with parity-correct front-matter:
 *   - `lang` flipped to the target locale
 *   - `draft: true` (a fresh twin always starts unpublished, for review)
 *   - bidirectional `alternateSlug` (twin → source slug)
 *   - pubDate / heroImage / category carried over verbatim (the parity fields
 *     the blog-parity linter enforces)
 *   - title / description / body / tags replaced with the translation
 *
 * The translation (LLM) step runs through n8n; everything else is deterministic
 * and exercised by `--dry-run`, which skips the LLM and echoes the source text
 * so the front-matter / slug / path logic can be verified offline.
 *
 * Usage:   node scripts/translate-post.mjs <source-slug> [options]
 *          pnpm translate:post <source-slug> -- --dry-run
 *
 * Options:
 *   --from <de|en>   Source language (default: de)
 *   --slug <slug>    Target slug (default: source post's alternateSlug)
 *   --webhook <url>  n8n webhook URL (default: $N8N_TRANSLATE_WEBHOOK)
 *   --force          Overwrite an existing target file
 *   --dry-run        Skip the LLM call; print the assembled draft instead of writing
 *   -h, --help       Show this help
 *
 * After generating, review the draft, set `draft: false` on BOTH twins when
 * ready, then run `pnpm lint:blog-parity` to confirm parity before publishing.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = join(ROOT, "src", "content", "blog");
const DEFAULT_WEBHOOK = process.env.N8N_TRANSLATE_WEBHOOK || "";
const TIMEOUT_MS = 180000; // long-form translation can take a while

function usage(msg) {
  const out = msg ? console.error : console.log;
  if (msg) out(`Error: ${msg}\n`);
  out(`Usage: node scripts/translate-post.mjs <source-slug> [options]

Drafts the opposite-language twin of a blog post via the n8n translation
workflow, with parity-correct front-matter.

Options:
  --from <de|en>   Source language (default: de)
  --slug <slug>    Target slug (default: source post's alternateSlug)
  --webhook <url>  n8n webhook URL (default: $N8N_TRANSLATE_WEBHOOK)
  --force          Overwrite an existing target file
  --dry-run        Skip the LLM call; print the assembled draft (source text
                   echoed) instead of writing — validates front-matter/path logic
  -h, --help       Show this help`);
  process.exit(msg ? 1 : 0);
}

function requireVal(v, flag) {
  if (v === undefined || v.startsWith("--")) usage(`${flag} requires a value`);
  return v;
}

function parseArgs(argv) {
  const o = { from: "de" };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") usage();
    else if (a === "--from") o.from = requireVal(argv[++i], a);
    else if (a === "--slug") o.slug = requireVal(argv[++i], a);
    else if (a === "--webhook") o.webhook = requireVal(argv[++i], a);
    else if (a === "--force") o.force = true;
    else if (a === "--dry-run") o.dryRun = true;
    else if (a.startsWith("--")) usage(`unknown option: ${a}`);
    else positional.push(a);
  }
  if (positional.length !== 1) usage("exactly one <source-slug> is required");
  o.sourceSlug = positional[0];
  return o;
}

// Slugs become file paths under src/content/blog — reject anything that could
// escape that directory (path separators, "..", or other unexpected characters).
const SLUG_RE = /^[A-Za-z0-9._-]+$/;
function assertSafeSlug(slug, what) {
  if (!SLUG_RE.test(slug) || slug.includes("..")) {
    usage(
      `unsafe ${what} "${slug}" — only letters, digits, dot, underscore and hyphen are allowed (no path separators or "..")`,
    );
  }
}

/** Split a markdown file into raw front-matter text and the body that follows. */
function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { fmText: m[1], body: m[2] } : null;
}

/** Parse flat `key: value` front-matter lines into raw (still-quoted) string values. */
function parseFields(fmText) {
  const fields = {};
  for (const line of fmText.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m && m[2].trim() !== "") fields[m[1]] = m[2].trim();
  }
  return fields;
}

const unquote = (v = "") =>
  (v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))
    ? v.slice(1, -1)
    : v;

const quote = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

function parseTags(raw) {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const formatTags = (tags) => `[${tags.map((t) => quote(t)).join(", ")}]`;
const rel = (p) => relative(ROOT, p);

/** Rebuild target front-matter in the collection's canonical field order. */
function assemble(srcFields, tr, target, sourceSlug) {
  const lines = [
    `title: ${quote(tr.title)}`,
    `description: ${quote(tr.description)}`,
    `pubDate: ${srcFields.pubDate}`,
  ];
  if (srcFields.updatedDate) lines.push(`updatedDate: ${srcFields.updatedDate}`);
  if (srcFields.heroImage) lines.push(`heroImage: ${quote(unquote(srcFields.heroImage))}`);
  lines.push(`category: ${srcFields.category}`);
  lines.push(`tags: ${formatTags(tr.tags)}`);
  lines.push(`draft: true`);
  if (srcFields.author) lines.push(`author: ${quote(unquote(srcFields.author))}`);
  lines.push(`lang: ${target}`);
  lines.push(`alternateSlug: ${quote(sourceSlug)}`);
  return `---\n${lines.join("\n")}\n---\n\n${tr.body.trim()}\n`;
}

async function callWebhook(url, payload) {
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw new Error(`could not reach n8n webhook (${url}): ${err.message}`);
  }
  if (!res.ok) throw new Error(`n8n webhook returned ${res.status} ${res.statusText}`);
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("n8n webhook did not return JSON");
  }
  if (!data || typeof data.title !== "string" || typeof data.body !== "string") {
    throw new Error(`unexpected response shape: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return {
    title: data.title,
    description: typeof data.description === "string" ? data.description : payload.description,
    tags: Array.isArray(data.tags) ? data.tags : payload.tags,
    body: data.body,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.from !== "de" && opts.from !== "en") usage("--from must be 'de' or 'en'");
  assertSafeSlug(opts.sourceSlug, "source slug");
  const target = opts.from === "de" ? "en" : "de";

  const srcPath = join(BLOG_DIR, opts.from, `${opts.sourceSlug}.md`);
  if (!existsSync(srcPath)) usage(`source post not found: ${rel(srcPath)}`);

  const split = splitFrontmatter(readFileSync(srcPath, "utf8"));
  if (!split) usage(`malformed front-matter in ${rel(srcPath)}`);
  const f = parseFields(split.fmText);

  const targetSlug = opts.slug || unquote(f.alternateSlug || "");
  if (!targetSlug) {
    usage(
      `source post has no alternateSlug — set one on ${rel(srcPath)} or pass --slug <target-slug>`,
    );
  }
  assertSafeSlug(targetSlug, "target slug");

  const targetPath = join(BLOG_DIR, target, `${targetSlug}.md`);
  if (!opts.dryRun && existsSync(targetPath) && !opts.force) {
    usage(`target already exists: ${rel(targetPath)} (use --force to overwrite)`);
  }

  const payload = {
    sourceLang: opts.from,
    targetLang: target,
    title: unquote(f.title || ""),
    description: unquote(f.description || ""),
    tags: parseTags(f.tags),
    body: split.body.replace(/\s+$/, ""),
  };

  let translated;
  if (opts.dryRun) {
    // No LLM: echo the source text so the deterministic assembly is verifiable.
    translated = { ...payload };
  } else {
    const webhook = opts.webhook || DEFAULT_WEBHOOK;
    if (!webhook) {
      usage("no webhook configured — set $N8N_TRANSLATE_WEBHOOK / --webhook, or use --dry-run");
    }
    translated = await callWebhook(webhook, payload);
  }

  const out = assemble(f, translated, target, opts.sourceSlug);

  if (opts.dryRun) {
    process.stdout.write(out);
    console.error(`\n[dry-run] would write → ${rel(targetPath)} (LLM skipped; source text echoed)`);
  } else {
    writeFileSync(targetPath, out, "utf8");
    console.error(
      `✓ wrote ${rel(targetPath)} (draft)\n` +
        `  Next: review the translation, set draft:false on both twins when ready,\n` +
        `  then run \`pnpm lint:blog-parity\` to confirm parity.`,
    );
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
