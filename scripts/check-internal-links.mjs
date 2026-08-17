/**
 * Fails the build when an internal link points at a page that is not there.
 *
 * Written after a hand-rolled version of this check reported 80 broken links
 * that were not broken: the shell pipeline behind it parsed the wrong field.
 * A check that cries wolf is worse than no check, so this one is tested against
 * a link it must catch, and it prints what it looked at rather than only what
 * it rejected.
 *
 * Anchors, mailto:, tel: and absolute URLs are out of scope. So is anything
 * under public/, which is copied verbatim and checked by its own presence.
 */

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, resolve } from "node:path"

const DIST = resolve("dist")

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })

let pages
try {
  pages = walk(DIST).filter((f) => f.endsWith(".html"))
} catch {
  console.error("no dist/ to check — run the build first")
  process.exit(1)
}

// A link resolves if dist holds the file itself, or the directory-style page
// Astro writes for it.
const resolves = (path) => {
  const clean = path.replace(/[?#].*$/, "")
  const candidates = [
    join(DIST, clean),
    join(DIST, clean, "index.html"),
    join(DIST, `${clean.replace(/\/$/, "")}.html`),
  ]
  return candidates.some((c) => {
    try {
      return statSync(c).isFile() || statSync(c).isDirectory()
    } catch {
      return false
    }
  })
}

const broken = []
let checked = 0

for (const page of pages) {
  const html = readFileSync(page, "utf8")
  for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const target = match[1]
    if (target.startsWith("//")) continue
    checked += 1
    if (!resolves(target)) {
      broken.push({ page: page.slice(DIST.length + 1), target })
    }
  }
}

if (broken.length > 0) {
  for (const { page, target } of broken) console.error(`${page} -> ${target}`)
  console.error(`\ninternal links: ${broken.length} broken of ${checked} checked`)
  process.exit(1)
}

console.log(`internal links: ${checked} checked across ${pages.length} pages, none broken`)
