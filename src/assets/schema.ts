// Shared JSON-LD builders for structured data (SEO + AI answer-engine extraction).
// Centralises the canonical site URL and the schema shapes so the emitted data
// never drifts from the visible content of each component.

export const SITE_URL = "https://consulting.leinss.xyz";

/**
 * Convert the lightweight markdown used in FAQ answers (blank-line paragraphs
 * and `* ` bullets) into clean HTML. Google and the AI engines accept limited
 * HTML in FAQ answer text, so this keeps rich results tidy instead of leaking
 * literal asterisks.
 */
export function faqAnswerToHtml(raw: string): string {
  const out: string[] = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }
    if (trimmed.startsWith("* ")) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${trimmed.slice(2)}</li>`);
    } else {
      closeList();
      out.push(`<p>${trimmed}</p>`);
    }
  }
  closeList();
  return out.join("");
}

/**
 * Build a FAQPage schema from an i18n faq block (keys `q_1`/`a_1`, …).
 * Pass the same object the FAQ component renders so schema == on-page content.
 */
export function faqPageSchema(faq: Record<string, string>) {
  const questionKeys = Object.keys(faq).filter((k) => k.startsWith("q_"));
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questionKeys.map((qKey) => {
      const index = qKey.slice(2); // "q_1" -> "1"
      return {
        "@type": "Question",
        name: faq[qKey],
        acceptedAnswer: {
          "@type": "Answer",
          text: faqAnswerToHtml(faq[`a_${index}`] ?? ""),
        },
      };
    }),
  };
}

export interface Crumb {
  name: string;
  url: string; // absolute URL
}

/** Build a BreadcrumbList schema from an ordered list of crumbs. */
export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
