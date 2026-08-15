#!/usr/bin/env node
/**
 * Guard against words joining across a line break in .astro templates.
 *
 * The compiler drops a newline between a text node and an adjacent inline
 * element instead of collapsing it to one space, so
 *
 *     I take that on through
 *     <a href="...">Leinss Consulting</a>
 *
 * renders as "throughLeinss Consulting". Prettier formats templates this way
 * by default, which is why the defect is invisible when reading the source.
 *
 * Write the space explicitly as {" "} and the compiler cannot drop it.
 *
 * Usage: node scripts/check-inline-spacing.mjs [dir]
 */

import { readFileSync } from "node:fs"
import { readdirSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.argv[2] ?? "src"

const INLINE =
  "a|span|strong|em|b|i|code|abbr|small|time|sub|sup|kbd|mark|q|cite|s|u|del|ins"

// A text line ending in a word character, then an inline element opening on
// the next line. The two run together.
// The `$` alternative matters: prettier breaks a tag with several attributes
// as a bare `<a` on its own line, which is exactly the case that shipped.
const TEXT_THEN_TAG = new RegExp(`^<(${INLINE})(?:[\\s>]|$)`)
const ENDS_IN_WORD = /[\p{L}\p{N},.;:!?)\]"'»]$/u

// An inline element closing on its own line, then text on the next.
const TAG_THEN_TEXT = new RegExp(`^</(${INLINE})>$`)
const STARTS_WITH_WORD = /^[\p{L}\p{N}]/u

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(path))
    else if (entry.name.endsWith(".astro")) out.push(path)
  }
  return out
}

const findings = []

for (const file of walk(ROOT)) {
  const lines = readFileSync(file, "utf8").split("\n")

  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i].trimEnd()
    const next = lines[i + 1].trimStart()

    // Skip a line that ends on a tag: the newline sits between two elements,
    // not between text and an element, so no word space is expected.
    if (current.endsWith(">")) continue

    if (ENDS_IN_WORD.test(current) && TEXT_THEN_TAG.test(next)) {
      findings.push({
        file,
        line: i + 1,
        detail: `${current.slice(-40)} ⏎ ${next.slice(0, 40)}`,
      })
    }

    if (TAG_THEN_TEXT.test(current) && STARTS_WITH_WORD.test(next)) {
      findings.push({
        file,
        line: i + 1,
        detail: `${current} ⏎ ${next.slice(0, 40)}`,
      })
    }
  }
}

if (findings.length === 0) {
  console.log("inline spacing: no joined words across line breaks")
  process.exit(0)
}

console.error(
  `inline spacing: ${findings.length} place(s) where a line break drops the space between a word and an inline element.\n` +
    `Write the space as {" "} at the end of the text line.\n`
)
for (const f of findings) {
  console.error(`  ${relative(process.cwd(), f.file)}:${f.line}: ${f.detail}`)
}
process.exit(1)
