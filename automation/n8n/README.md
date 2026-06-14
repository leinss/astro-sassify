# Blog Translation Co-Pilot

An authoring helper that drafts the opposite-language twin of a blog post, so
every German post gets an English twin (and vice versa) with parity-correct
front-matter — the structure the site's hreflang and `blog-parity-lint` depend
on.

It has two parts:

1. **`blog-translation-copilot.json`** — an importable n8n workflow that wraps an
   LLM translation behind a webhook.
2. **`../../scripts/translate-post.mjs`** — a local CLI that reads a source post,
   calls the workflow, and writes the translated twin with correct front-matter.

This is a **dev-time authoring tool**, not part of the deployed site. Nothing
here ships to GitHub Pages.

## What the co-pilot guarantees

Given a source post, the generated twin always has:

- `lang` flipped to the target locale
- `draft: true` (a fresh twin starts unpublished, for human review)
- bidirectional `alternateSlug` (twin → source slug)
- `pubDate`, `heroImage`, `category` carried over verbatim — the exact fields
  `scripts/blog-parity-lint.mjs` enforces between twins
- `title`, `description`, `body`, and `tags` translated (tags become idiomatic
  target-language slugs; universal terms like `n8n`/`roi`/`ai` are kept)

The translation (LLM) runs through n8n; everything else is deterministic and is
exercised offline by `--dry-run`.

## Setup (one-time)

1. **Import the workflow** into n8n: *Workflows → Import from File →*
   `blog-translation-copilot.json`.
2. **Provide an LLM key.** The HTTP node calls the Anthropic Messages API and
   reads `x-api-key` from `{{ $env.ANTHROPIC_API_KEY }}`. Either set
   `ANTHROPIC_API_KEY` in the n8n environment, or replace the header with an
   *HTTP Header Auth* credential. To use a different provider (OpenRouter,
   OpenAI), point the **Translate** node's URL/body at that API and adjust the
   **Parse Response** node to read its response shape.
3. **Activate** the workflow and copy its production webhook URL (path
   `blog-translate`).
4. Export it for the driver:

   ```bash
   export N8N_TRANSLATE_WEBHOOK="https://<your-n8n-host>/webhook/blog-translate"
   ```

## Usage

From the repo root:

```bash
# Validate the pipeline offline (no LLM call): prints the assembled draft with
# the source text echoed, so you can confirm front-matter / slug / path are right.
pnpm translate:post rechnungsverarbeitung-automatisieren -- --dry-run

# Real run: German → English twin (default --from de)
pnpm translate:post rechnungsverarbeitung-automatisieren

# English → German twin
pnpm translate:post automating-invoice-processing -- --from en

# Override the target slug (default: the source post's alternateSlug)
pnpm translate:post my-new-post -- --slug my-new-post-en
```

The source post must declare an `alternateSlug` (the intended twin slug), or you
must pass `--slug`. The driver refuses to overwrite an existing twin unless you
pass `--force`.

### Options

| Flag             | Default                   | Purpose                                   |
| ---------------- | ------------------------- | ----------------------------------------- |
| `--from <de\|en>`| `de`                      | Source language                           |
| `--slug <slug>`  | source's `alternateSlug`  | Target file slug                          |
| `--webhook <url>`| `$N8N_TRANSLATE_WEBHOOK`  | n8n webhook URL                           |
| `--force`        | off                       | Overwrite an existing target file         |
| `--dry-run`      | off                       | Skip the LLM; print instead of write      |

## After generating

The twin is written as a **draft**. Then:

1. Review and tidy the translation.
2. When both twins are ready, set `draft: false` on **both** files.
3. Run the parity linter to confirm hreflang integrity before publishing:

   ```bash
   pnpm lint:blog-parity
   ```

A published post that points to a still-draft twin is intentionally flagged by
the linter — publish the pair together.
