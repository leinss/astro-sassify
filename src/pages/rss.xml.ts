import { feed } from "../lib/feed"

// Kept at the root as the German feed, because that is the URL existing
// subscribers already have. /de/rss.xml and /en/rss.xml are the pair to use.
export const GET = feed("de")
