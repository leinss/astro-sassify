import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json()
    const { email, lang = "de" } = data

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: lang === "de" ? "Bitte geben Sie eine gültige E-Mail-Adresse ein." : "Please enter a valid email address.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Get listmonk credentials from environment
    const LISTMONK_URL = import.meta.env.LISTMONK_URL || "https://listmonk.funnel.leinss.xyz"
    const LISTMONK_USER = import.meta.env.LISTMONK_API_USER
    const LISTMONK_KEY = import.meta.env.LISTMONK_API_KEY
    const LISTMONK_LIST_ID = import.meta.env.LISTMONK_LIST_ID || 1

    if (!LISTMONK_USER || !LISTMONK_KEY) {
      console.error("Listmonk credentials not configured")
      return new Response(
        JSON.stringify({
          success: false,
          message: lang === "de" ? "Newsletter-Service vorübergehend nicht verfügbar." : "Newsletter service temporarily unavailable.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Create subscriber in listmonk
    const authHeader = Buffer.from(`${LISTMONK_USER}:${LISTMONK_KEY}`).toString("base64")

    const response = await fetch(`${LISTMONK_URL}/api/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        email,
        name: "",
        status: "enabled",
        lists: [Number(LISTMONK_LIST_ID)],
        preconfirm_subscriptions: false, // Send double opt-in email
        attribs: {
          source: "website",
          language: lang,
        },
      }),
    })

    if (response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: lang === "de"
            ? "Vielen Dank! Bitte bestätigen Sie Ihre Anmeldung in der E-Mail, die wir Ihnen gesendet haben."
            : "Thank you! Please confirm your subscription in the email we sent you.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    // Handle listmonk errors
    const errorData = await response.json().catch(() => ({}))

    // Check if subscriber already exists
    if (response.status === 409 || errorData.message?.includes("already exists")) {
      return new Response(
        JSON.stringify({
          success: true,
          message: lang === "de"
            ? "Diese E-Mail-Adresse ist bereits angemeldet."
            : "This email address is already subscribed.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    console.error("Listmonk error:", errorData)
    return new Response(
      JSON.stringify({
        success: false,
        message: lang === "de" ? "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." : "An error occurred. Please try again later.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred. Please try again later.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
