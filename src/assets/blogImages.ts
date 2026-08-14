import { getImage } from "astro:assets"

// Optimized blog hero images. Single source of truth shared by BlogCard.astro
// (card thumbnails) and the blog [slug].astro routes (per-post OG images).
import caseStudyCrm from "./images/blog/case-study-crm.png"
import caseStudyInvoice from "./images/blog/case-study-invoice.png"
import caseStudySupport from "./images/blog/case-study-support.png"
import caseStudyEcommerce from "./images/blog/case-study-ecommerce.png"
import invoiceAutomation from "./images/blog/invoice-automation.png"
import communicationAutomation from "./images/blog/communication-automation.png"
import meetingAutomation from "./images/blog/meeting-automation.png"
import commonAutomationMistakes from "./images/blog/common-automation-mistakes.png"
import fromSpreadsheetsToSystems from "./images/blog/from-spreadsheets-to-systems.png"
import faqAutomation from "./images/blog/faq-automation.png"

// Map the `heroImage` front-matter strings (public-style paths) to the imported,
// build-optimized assets.
export const blogImages: Record<string, ImageMetadata> = {
  "/images/blog/case-study-crm.png": caseStudyCrm,
  "/images/blog/case-study-invoice.png": caseStudyInvoice,
  "/images/blog/case-study-support.png": caseStudySupport,
  "/images/blog/case-study-ecommerce.png": caseStudyEcommerce,
  "/images/blog/invoice-automation.png": invoiceAutomation,
  "/images/blog/communication-automation.png": communicationAutomation,
  "/images/blog/meeting-automation.png": meetingAutomation,
  "/images/blog/common-automation-mistakes.png": commonAutomationMistakes,
  "/images/blog/from-spreadsheets-to-systems.png": fromSpreadsheetsToSystems,
  "/images/blog/faq-automation.png": faqAutomation,
}

// Memoize per heroImage: de/en twins (and any reused hero) resolve to the same emitted
// derivative, so getImage() runs once per distinct image instead of once per blog page.
const ogImageCache = new Map<string, string>()

/**
 * Resolve a post's `heroImage` string into an emitted, social-card-sized OG image URL.
 * Returns a root-relative `/_astro/…png` path (SEO.astro absolutizes it), or `undefined`
 * when there is no hero or no mapping — callers then fall back to the site default OG image.
 */
export async function getBlogOgImage(
  heroImage?: string,
): Promise<string | undefined> {
  if (!heroImage) return undefined
  const src = blogImages[heroImage]
  if (!src) return undefined
  let url = ogImageCache.get(heroImage)
  if (url === undefined) {
    // PNG (not WebP) for broad social-scraper compatibility; cropped to the 1.91:1 OG ratio.
    const og = await getImage({
      src,
      width: 1200,
      height: 630,
      fit: "cover",
      position: "center",
      format: "png",
    })
    url = og.src
    ogImageCache.set(heroImage, url)
  }
  return url
}
