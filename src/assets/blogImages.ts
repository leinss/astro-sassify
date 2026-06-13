import { getImage } from "astro:assets"

// Optimized blog hero images. Single source of truth shared by BlogCard.astro
// (card thumbnails) and the blog [slug].astro routes (per-post OG images).
import caseStudyCrm from "./images/blog/case-study-crm.png"
import caseStudyInvoice from "./images/blog/case-study-invoice.png"
import caseStudySupport from "./images/blog/case-study-support.png"
import caseStudyEcommerce from "./images/blog/case-study-ecommerce.png"
import invoiceAutomation from "./images/blog/invoice-automation.png"
import roiAutomation from "./images/blog/roi-automation.png"
import communicationAutomation from "./images/blog/communication-automation.png"
import meetingAutomation from "./images/blog/meeting-automation.png"
import fiveSignsAutomation from "./images/blog/5-signs-automation.png"
import cloudAutomationCosts from "./images/blog/cloud-automation-costs.png"
import dataSyncNightmares from "./images/blog/data-sync-nightmares.png"
import powerOfIntegration from "./images/blog/power-of-integration.png"
import commonAutomationMistakes from "./images/blog/common-automation-mistakes.png"
import buildingYourFirstWorkflow from "./images/blog/building-your-first-workflow.png"
import fromManualToAutomated from "./images/blog/from-manual-to-automated.png"
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
  "/images/blog/roi-automation.png": roiAutomation,
  "/images/blog/communication-automation.png": communicationAutomation,
  "/images/blog/meeting-automation.png": meetingAutomation,
  "/images/blog/5-signs-automation.png": fiveSignsAutomation,
  "/images/blog/cloud-automation-costs.png": cloudAutomationCosts,
  "/images/blog/data-sync-nightmares.png": dataSyncNightmares,
  "/images/blog/power-of-integration.png": powerOfIntegration,
  "/images/blog/common-automation-mistakes.png": commonAutomationMistakes,
  "/images/blog/building-your-first-workflow.png": buildingYourFirstWorkflow,
  "/images/blog/from-manual-to-automated.png": fromManualToAutomated,
  "/images/blog/from-spreadsheets-to-systems.png": fromSpreadsheetsToSystems,
  "/images/blog/faq-automation.png": faqAutomation,
}

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
  // PNG (not WebP) for broad social-scraper compatibility; cropped to the 1.91:1 OG ratio.
  const og = await getImage({
    src,
    width: 1200,
    height: 630,
    fit: "cover",
    position: "center",
    format: "png",
  })
  return og.src
}
