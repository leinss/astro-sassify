#!/usr/bin/env node
/**
 * Blog language-pair parity linter.
 *
 * Diffs front-matter between de/en blog twins to protect the bilingual
 * structure the site relies on (notably hreflang integrity, which is built
 * from `alternateSlug`). Runs standalone with zero dependencies.
 *
 * Checks per published, non-draft post that declares `alternateSlug`:
 *   1. the named twin file exists in the opposite-language folder;
 *   2. the twin points back (bidirectional `alternateSlug`);
 *   3. the twin's `lang` is the opposite locale;
 *   4. parity fields match across the pair: pubDate, category, heroImage, draft.
 * Also flags posts missing `alternateSlug` (orphans with no translated twin)
 * as warnings — they get a self-only hreflang and that is allowed, but the
 * site's standout strength is full parity, so surface them.
 *
 * Usage:  node scripts/blog-parity-lint.mjs
 * Exit:   0 = clean, 1 = parity error(s) found.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = join(ROOT, "src", "content", "blog");
const LANGS = ["de", "en"];
// Front-matter fields that must be identical between a post and its twin.
const PARITY_FIELDS = ["pubDate", "category", "heroImage", "draft"];

/** Minimal YAML front-matter parser — handles the flat scalar/array keys this
 *  collection uses (string, number, date, boolean, simple inline arrays). */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val === "") continue;
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    } else if (val === "true" || val === "false") {
      val = val === "true";
    } else if (val.startsWith("[")) {
      // leave arrays as the raw string — not a parity field, not needed
    }
    data[key] = val;
  }
  return data;
}

function loadPosts() {
  const posts = new Map(); // `${lang}/${slug}` -> { lang, slug, file, data }
  for (const lang of LANGS) {
    const dir = join(BLOG_DIR, lang);
    for (const file of readdirSync(dir)) {
      if (!/\.(md|mdx)$/.test(file)) continue;
      const slug = file.replace(/\.(md|mdx)$/, "");
      const data = parseFrontmatter(readFileSync(join(dir, file), "utf8"));
      if (!data) {
        console.error(`ERROR  ${lang}/${file}: missing or malformed front-matter`);
        process.exitCode = 1;
        continue;
      }
      posts.set(`${lang}/${slug}`, { lang, slug, file: `${lang}/${file}`, data });
    }
  }
  return posts;
}

function main() {
  const posts = loadPosts();
  const errors = [];
  const warnings = [];

  for (const post of posts.values()) {
    // Drafts are excluded from publication/hreflang, so don't enforce parity.
    if (post.data.draft === true) continue;

    const alt = post.data.alternateSlug;
    if (!alt) {
      warnings.push(`${post.file}: no alternateSlug (no translated twin → self-only hreflang)`);
      continue;
    }

    const otherLang = post.lang === "de" ? "en" : "de";
    const twin = posts.get(`${otherLang}/${alt}`);

    if (!twin) {
      errors.push(`${post.file}: alternateSlug "${alt}" has no file at ${otherLang}/${alt}.md (broken hreflang target)`);
      continue;
    }
    if (twin.data.lang !== otherLang) {
      errors.push(`${post.file}: twin ${twin.file} declares lang="${twin.data.lang}", expected "${otherLang}"`);
    }
    if (twin.data.alternateSlug !== post.slug) {
      errors.push(`${post.file}: twin ${twin.file} alternateSlug="${twin.data.alternateSlug ?? "(none)"}" does not point back to "${post.slug}"`);
    }
    for (const field of PARITY_FIELDS) {
      const a = post.data[field];
      const b = twin.data[field];
      if (String(a ?? "") !== String(b ?? "")) {
        errors.push(`${post.file} vs ${twin.file}: ${field} mismatch ("${a ?? "(unset)"}" vs "${b ?? "(unset)"}")`);
      }
    }
  }

  for (const w of warnings) console.warn(`WARN   ${w}`);
  for (const e of errors) console.error(`ERROR  ${e}`);

  const published = [...posts.values()].filter((p) => p.data.draft !== true).length;
  if (errors.length) {
    console.error(`\nblog-parity: ${errors.length} error(s), ${warnings.length} warning(s) across ${published} published post(s).`);
    process.exitCode = 1;
  } else {
    console.log(`blog-parity: OK — ${published} published post(s), ${warnings.length} warning(s).`);
  }
}

main();
