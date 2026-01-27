---
title: "Fallstudie: Automatisierte Lead-Pflege für ein SaaS-Startup"
description: "Wie wir die Lead-Reaktionszeit von 2 Tagen auf 4 Stunden reduzierten und qualifizierte Leads um 35% steigerten – mit n8n, Notion und KI-gestütztem Lead-Scoring."
pubDate: 2025-01-27
heroImage: "/images/blog/case-study-crm.png"
category: case-study
tags: ["crm", "lead-nurturing", "n8n", "notion", "ai", "claude", "ollama"]
draft: false
lang: de
alternateSlug: "case-study-crm-lead-nurturing"
---

# Automatisierte Lead-Pflege für ein SaaS-Startup

Ein wachsendes B2B-SaaS-Unternehmen verlor Deals, weil Leads kalt wurden. Manuelle Follow-ups waren inkonsistent, und das Sales-Team verbrachte mehr Zeit mit Administration als mit Verkaufen. Wir haben ein automatisiertes Lead-Nurturing-System entwickelt, das die Pipeline transformierte.

## Die Herausforderung

**Kunde**: B2B-SaaS-Startup, 15 Mitarbeiter, €2M ARR

**Schmerzpunkte**:
- Leads von Website, LinkedIn und Events versanken in E-Mail-Postfächern
- Kein systematischer Follow-up-Prozess
- Sales-Mitarbeiter kopierten Daten manuell zwischen Tools
- Lead-Qualität variierte stark—Zeit wurde mit unqualifizierten Interessenten verschwendet

**Vor der Automatisierung**:
| Metrik | Wert |
|--------|------|
| Durchschnittliche Lead-Reaktionszeit | 2 Tage |
| Lead-Qualifizierungsrate | 12% |
| Admin-Zeit pro Vertriebsmitarbeiter | 8 Std./Woche |
| Verlorene Leads | ~40% |

## Die Lösung

Wir haben ein dreistufiges Automatisierungssystem mit **n8n** als Orchestrierungsschicht entwickelt.

### Tool-Stack

| Komponente | Tool | Warum |
|------------|------|-------|
| Lead-Datenbank | Notion | Flexibel, API-freundlich, Team nutzte es bereits |
| Workflow-Automatisierung | n8n | Self-hosted, DSGVO-konform, erweiterbar |
| KI-Scoring (Cloud) | Claude API | Hohe Genauigkeit für kontextreiches Scoring |
| KI-Scoring (Lokal) | Ollama | Privacy-first für sensible Daten |
| E-Mail-Sequenzen | n8n + SMTP | Personalisiert, durch Lead-Phase getriggert |

### Stufe 1: Lead-Erfassung & Anreicherung

```
Website-Formular / LinkedIn → Webhook → n8n → Notion-Datenbank
```

Jeder Lead landet automatisch in Notion mit:
- Kontaktdaten (Name, E-Mail, Unternehmen)
- Quellen-Attribution (welche Kampagne, Referrer)
- Angereicherten Daten (Unternehmensgröße, Branche via Clearbit/Apollo)
- Zeitstempel für Reaktionszeit-Tracking

### Stufe 2: KI-gestütztes Lead-Scoring

Das Herzstück des Systems. Jeder Lead wird von der KI gegen das Ideal Customer Profile (ICP) bewertet.

**Scoring-Kriterien**:
1. **Unternehmens-Fit** (40%): Branche, Größe, Tech-Stack-Alignment
2. **Engagement-Signale** (30%): Besuchte Seiten, heruntergeladene Inhalte
3. **Budget-Indikatoren** (20%): Firmenumsatz, Funding-Phase
4. **Timing-Signale** (10%): Dringlichkeit in der Nachricht, Entscheidungs-Timeline

**Claude API Prompt (vereinfacht)**:
```
Analysiere diesen Lead gegen unser ICP:
- Ziel: B2B SaaS, 10-200 Mitarbeiter, Series A+
- Ideale Persona: VP Engineering, CTO, Head of DevOps

Lead-Daten: {lead_json}

Gib JSON zurück mit:
- score (0-100)
- tier (hot/warm/cold)
- reasoning (2 Sätze)
- suggested_action (call/email/nurture/disqualify)
```

**Ollama-Alternative**: Für Kunden mit strengen Datenresidenz-Anforderungen nutzen wir lokal Mistral 7B. Etwas geringere Genauigkeit, aber keine Daten verlassen das Unternehmen.

### Stufe 3: Automatisierte Aktionen

Basierend auf dem KI-Score triggert n8n unterschiedliche Workflows:

| Lead-Tier | Score | Aktion |
|-----------|-------|--------|
| 🔥 Hot | 80-100 | Slack-Alert + Kalender-Link innerhalb 5 Min |
| 🌡️ Warm | 50-79 | 3-E-Mail-Sequenz über 7 Tage |
| ❄️ Cold | 20-49 | Monatlicher Newsletter + gelegentlicher Check-in |
| ❌ Disqualifiziert | 0-19 | Höfliche Absage-E-Mail, aus Aktivliste entfernt |

**Hot-Lead-Workflow**:
1. Slack-Benachrichtigung an Sales-Channel mit Lead-Zusammenfassung
2. Auto-Entwurf einer personalisierten E-Mail (KI-generiert, von Mensch genehmigt)
3. Notion-Status → "Hot Lead - Wartet auf Kontakt"
4. Wenn keine Aktion in 2 Stunden → Eskalation an Sales-Manager

**Warm-Lead-Nurture-Sequenz**:
- Tag 0: "Danke für Ihr Interesse" + relevante Fallstudie
- Tag 3: Bildungsinhalte basierend auf ihrer Branche
- Tag 7: Soft-Ask für ein Gespräch mit spezifischem Wertversprechen

## Ergebnisse

Nach 3 Monaten mit dem automatisierten System:

| Metrik | Vorher | Nachher | Änderung |
|--------|--------|---------|----------|
| Lead-Reaktionszeit | 2 Tage | 4 Stunden | -83% |
| Qualifizierte Leads | 12% | 35% | +192% |
| Admin-Zeit pro Mitarbeiter | 8 Std./Woche | 2 Std./Woche | -75% |
| Verlorene Leads | ~40% | <5% | -87% |
| Pipeline-Geschwindigkeit | 45 Tage | 28 Tage | -38% |

**ROI**: Implementierungskosten nach 6 Wochen durch erhöhte Conversion amortisiert.

## Implementierungsdetails

**Zeitplan**: 3 Wochen von Kickoff bis Produktion
- Woche 1: Notion-Struktur, n8n-Workflows, Integrationen
- Woche 2: KI-Prompt-Engineering, Tests mit historischen Leads
- Woche 3: E-Mail-Templates, Slack-Integration, Schulung

**Laufende Kosten**:
| Posten | Monatliche Kosten |
|--------|-------------------|
| n8n Cloud (oder self-hosted: €0) | €20 |
| Claude API (~500 Leads/Monat) | €15 |
| Notion (Team-Plan) | Bereits vorhanden |
| **Gesamt** | **€35/Monat** |

Vergleich: 1 SDR bei €4.000/Monat für die gleiche manuelle Arbeit.

## Wichtige Erkenntnisse

1. **Mit klarem ICP starten**: KI-Scoring ist nur so gut wie die Kriterien
2. **Human-in-the-Loop**: Hot Leads bekommen KI-Entwürfe, keine Auto-Sends
3. **Reaktionszeit messen**: Der #1-Faktor bei der Lead-Conversion
4. **Prompts iterieren**: Wir haben die Scoring-Prompts 8 Mal basierend auf Sales-Feedback verfeinert

## Ihr nächster Schritt

Haben Sie eine ähnliche Lead-Management-Herausforderung?

1. **Audit**: Bilden Sie Ihren aktuellen Lead-Flow ab—wo sind die Lücken?
2. **Priorisieren**: Starten Sie mit einer Quelle (z.B. Website-Formulare)
3. **Messen**: Tracken Sie die Reaktionszeit vor und nach der Änderung

[Kostenloses Strategiegespräch buchen](https://cal.com/tobias-leinss/strategymeeting) — Ich zeige Ihnen, wie das für Ihr Setup aussehen würde.
