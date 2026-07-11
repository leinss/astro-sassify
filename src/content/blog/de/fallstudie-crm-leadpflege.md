---
title: "Fallstudie: Automatisierte Lead-Pflege für ein SaaS-Startup"
description: "Beispiel-Implementierung: Wie sich Lead-Reaktionszeit von Tagen auf Stunden bringen und der Anteil qualifizierter Leads deutlich steigern lässt – mit n8n, Notion und KI-gestütztem Lead-Scoring."
pubDate: 2026-06-18
heroImage: "/images/blog/case-study-crm.png"
category: case-study
tags: ["crm", "lead-nurturing", "n8n", "notion", "ai", "claude", "ollama"]
draft: false
lang: de
alternateSlug: "case-study-crm-lead-nurturing"
---

> **Kurz gesagt:** Ein B2B-SaaS-Startup kann seine Lead-Bearbeitung mit n8n, Notion und KI-Scoring automatisieren, um die Reaktionszeit von Tagen auf wenige Stunden zu senken, den Anteil qualifizierter Leads deutlich zu heben und jedem Vertriebsmitarbeiter mehrere Stunden pro Woche zurückzugeben.

> **Hinweis:** Dies ist eine Beispiel-Implementierung, die zeigt, wie diese Art von Automatisierung aufgebaut ist und was sie leisten kann. Unternehmensprofil und Zahlen sind illustrative Zielwerte auf Basis gängiger Branchenmuster – keine gemessenen Ergebnisse eines bestimmten Kunden. Der eigentliche Beweis sind die funktionierenden Demos: **[Selbst ausprobieren →](/de/projekte/)**

Ein B2B-SaaS-Unternehmen verlor Deals, weil Leads kalt wurden. Follow-ups waren inkonsistent, und das Sales-Team verbrachte mehr Zeit damit, Daten zwischen Tools zu kopieren, als zu verkaufen. Hier ist das System, mit dem ich das löse – und die Zahlen, die es bewegen kann.

## Auf einen Blick

| | |
|---|---|
| **Kunde / Branche** | B2B-SaaS-Startup, 15 Mitarbeiter, €2M ARR |
| **Problem** | Leads versanken in Postfächern, kein systematisches Follow-up, Vertrieb in Admin-Arbeit vergraben |
| **Lösung** | n8n-Orchestrierung + Notion-CRM + KI-Lead-Scoring (Claude / Ollama) |
| **Ergebnis** | Reaktionszeit 2 Tage → 4 Stunden, qualifizierte Leads 12% → 35%, Admin 8 → 2 Std./Woche/Mitarbeiter, Amortisation in 6 Wochen |

Genau diese Art von Aufbau mache ich unter [CRM- & Vertriebsautomatisierung](/de/services/crm-vertriebsautomatisierung/). Die [Lead-Response-Demo](/de/projekte/) läuft live zum Ausprobieren.

## Die Herausforderung

**Beispielunternehmen**: B2B-SaaS-Startup, 15 Mitarbeiter, €2M ARR

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

## Erreichbare Ergebnisse

Was ein solches System für ein Profil dieser Größe typischerweise erreichen kann (illustrative Zielwerte, keine gemessenen Kundenzahlen):

| Metrik | Vorher | Nachher | Änderung |
|--------|--------|---------|----------|
| Lead-Reaktionszeit | 2 Tage | 4 Stunden | -83% |
| Qualifizierte Leads | 12% | 35% | +192% |
| Admin-Zeit pro Mitarbeiter | 8 Std./Woche | 2 Std./Woche | -75% |
| Verlorene Leads | ~40% | <5% | -87% |
| Pipeline-Geschwindigkeit | 45 Tage | 28 Tage | -38% |

**ROI**: Durch die höhere Conversion kann sich der Aufbau in der Größenordnung weniger Wochen amortisieren – der konkrete Wert hängt von Ihrem Lead-Volumen und Deal-Größen ab.

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

## Selbst bauen

So verkabeln Sie die Lead-Nurturing-Pipeline von Grund auf.

### Node-für-Node Aufschlüsselung

**1. Lead-Intake-Webhook**

Ein Webhook empfängt Formular-Submissions von Ihrer Website, Landing Pages oder Integrationen wie Zapier. Der Trigger normalisiert eingehende Daten in ein konsistentes Format, unabhängig von der Quelle.

```
POST /lead-intake → { name, email, company, message, source }
```

**2. Datenanreicherung (Set Node)**

Vor dem KI-Scoring strukturieren Sie die Lead-Daten explizit. Das macht den Claude-Prompt zuverlässiger und einfacher zu debuggen. Enthalten:
- Kontaktinfo (Name, E-Mail, Unternehmen)
- Kontextfelder (Quelle, Unternehmensgröße, Branche)
- Nachrichteninhalt für Sentiment-Analyse

**3. Claude Lead-Scoring**

Die KI bewertet jeden Lead gegen Ihr Ideal Customer Profile. Der Prompt enthält:
- Gewichtete Scoring-Kriterien (Unternehmensgröße, Branche, Pain-Indikatoren, Budget-Signale)
- Klare Tier-Definitionen (hot/warm/cold/disqualified)
- Ausgabeformat mit Score, Tier, Begründung und Personalisierungs-Hook

Wichtige Erkenntnis: Ein `personalization_hook`-Feld einbauen – es gibt Ihrem Sales-Team ein spezifisches Detail zum Referenzieren in der Ansprache, sodass Antworten persönlich wirken, auch bei Skalierung.

**4. Score-Parsing**

Claude's JSON-Antwort parsen und mit Original-Lead-Daten zusammenführen. Edge Cases behandeln:
- Markdown-Codeblöcke in der Antwort
- Fehlende Felder (Standard auf "warm"-Tier)
- Parse-Fehler (loggen und zur manuellen Prüfung routen)

**5. Tier-basiertes Routing (Switch Node)**

Leads auf verschiedene Pfade basierend auf ihrem Tier routen:
- **Hot (80-100)**: Sofortiger Slack-Alert + Notion-Eintrag + Kalenderlink
- **Warm (50-79)**: E-Mail-Nurture-Sequenz (3 E-Mails über 7 Tage)
- **Cold (20-49)**: Zum Newsletter für langfristige Pflege hinzufügen
- **Disqualifiziert (0-19)**: Loggen und überspringen (keine Ansprache)

**6. Kanal-Integrationen**

Jedes Tier triggert entsprechende Aktionen:
- Slack für Hot-Lead-Alerts (mit Ein-Klick-Aktionen)
- E-Mail via SMTP oder SendGrid für Nurture-Sequenzen
- Mailchimp/ConvertKit für Newsletter-Adds
- Notion für zentrales Lead-Tracking

### Starter-Workflow herunterladen

> **📥 Kein Screenshot — der echte Workflow.** Das ist die exakte n8n-JSON, aus einer laufenden Instanz exportiert. Importieren Sie sie und prüfen Sie jeden Node selbst.
>
> [Download n8n-crm-lead.json](/workflows/n8n-crm-lead.json)

**Schnellstart:**
1. JSON importieren via n8n Einstellungen → Workflow importieren
2. Zugangsdaten konfigurieren (Anthropic API, Slack, Notion, E-Mail/SMTP)
3. ICP-Kriterien im Claude-Prompt auf Ihren Zielkunden anpassen
4. Passende Slack-Channels erstellen (#sales-hot-leads)
5. Mit Beispiel-Formular-Submissions testen

Dieser Starter implementiert die Kern-Scoring- und Routing-Logik. Eine Produktionsimplementierung würde Lead-Anreicherung via Clearbit/Apollo, CRM-Sync (HubSpot, Pipedrive), mehrstufige E-Mail-Sequenzen mit Delay-Nodes und Eskalationslogik für nicht kontaktierte Hot-Leads hinzufügen – Verfeinerungen, die aus dem Verständnis Ihres spezifischen Sales-Prozesses entstehen.

## Ihr nächster Schritt

Haben Sie eine ähnliche Lead-Management-Herausforderung?

1. **Audit**: Bilden Sie Ihren aktuellen Lead-Flow ab — wo sind die Lücken?
2. **Priorisieren**: Starten Sie mit einer Quelle, z.B. Website-Formulare.
3. **Messen**: Tracken Sie die Reaktionszeit vor und nach der Änderung.

Wenn langsame Follow-ups der eigentliche Übeltäter sind, ist [5 Zeichen, dass Ihr Unternehmen Automatisierung braucht](/de/blog/5-zeichen-dass-ihr-unternehmen-automatisierung-braucht/) ein schneller Selbsttest, wo der ROI liegt.

[Kostenloses Strategiegespräch buchen](https://cal.com/tobias-leinss/strategiegespraech) — Ich zeige Ihnen, wie das für Ihr Setup aussehen würde.
