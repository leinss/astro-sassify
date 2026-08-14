---
title: "Referenz-Build: Automatisiertes Lead-Scoring und Nurturing"
description: "Die vollständige Architektur für Erfassung, Bewertung und Pflege von Leads auf n8n, Notion und einem KI-Scorer: der Scoring-Prompt, die Sequenzlogik und der Workflow zum Herunterladen und Nachprüfen."
pubDate: 2026-06-18
heroImage: "/images/blog/case-study-crm.png"
category: reference-build
tags: ["crm", "lead-nurturing", "n8n", "notion", "ai", "claude", "ollama"]
draft: false
lang: de
alternateSlug: "case-study-crm-lead-nurturing"
---

> **Kurz gesagt:** Jeder eingehende Lead (Website-Formular, LinkedIn, Eventliste) landet an einer Stelle, wird von einem Modell, das Freitext lesen kann, gegen Ihre echten Qualifizierungskriterien bewertet und löst eine zum Score passende Follow-up-Sequenz aus. Der Vertrieb sieht eine sortierte Warteschlange samt Begründung statt eines Postfachs. Gebaut auf n8n mit Notion als CRM, das Scoring übernimmt Claude oder ein lokales Ollama-Modell.

> **Was das hier ist:** ein Referenz-Build: die Architektur, der Scoring-Prompt und die Sequenzlogik, aufgeschrieben, damit Sie die Technik beurteilen können. Es stehen keine Kundenzahlen darin. Prüfen können Sie das laufende System: **[Lead-Response-Demo ansehen →](/de/projekte/)**.

## Das Problem dahinter

Leads kommen durch mehrere Türen und landen in einem Postfach, und ein Postfach ist keine Warteschlange. Niemand erkennt auf einen Blick, welche von vierzig ungelesenen Nachrichten zuerst eine Antwort verdient, also wird nach Eingang beantwortet, oder gar nicht. Nebenher tippt der Vertrieb dieselben Kontaktdaten in drei Tools.

Darin stecken zwei verschiedene Probleme. Sortieren braucht Urteilsvermögen über Text, den eine Regel nicht parst: eine Position, eine Firmenbeschreibung, das, was die Person tatsächlich gefragt hat. Sequenzieren braucht kein Urteilsvermögen, sondern Verlässlichkeit: die richtige Nachricht, im richtigen Abstand, jedes Mal, ohne dass sich jemand erinnern muss. Dieser Build gibt das Erste an ein Modell und das Zweite an schlichte Workflow-Logik.

## Auf einen Blick

| | |
|---|---|
| **Stack** | n8n-Orchestrierung + Notion-CRM + KI-Lead-Scoring (Claude / Ollama) |
| **Was entschieden wird** | Fit-Score, Kaufabsicht, Segment, nächste beste Aktion, jeweils mit Begründung |
| **Sicherungen** | Scores sind beratend und für den Vertrieb sichtbar, Sequenzen stoppen bei jeder menschlichen Antwort, Versand nur zu Geschäftszeiten |
| **Nachprüfbar** | Die vollständige n8n-JSON, aus der laufenden Instanz exportiert |

Genau diese Art von Aufbau mache ich unter [CRM- & Vertriebsautomatisierung](/de/services/crm-vertriebsautomatisierung/). Die [Lead-Response-Demo](/de/projekte/) läuft live zum Ausprobieren.

## Die Lösung

Ein dreistufiges Automatisierungssystem mit **n8n** als Orchestrierungsschicht.

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

## Was sich ändert, und was nicht

Hier steht keine Vorher-Nachher-Tabelle. Ich habe dieses System nicht auf Ihrer Pipeline betrieben, und für ein erfundenes Unternehmen erfundene Zahlen sagen Ihnen nichts.

Was die Architektur ändert, ist strukturell:

- **Die Warteschlange ist sortiert, nicht chronologisch.** Wer das CRM öffnet, sieht zuerst den Lead mit der besten Passung: samt Begründung, warum er so bewertet wurde, statt nur den zuletzt eingegangenen.
- **Follow-up hängt nicht mehr am Gedächtnis.** Sequenzen laufen nach Plan und stoppen in dem Moment, in dem ein Mensch antwortet. Nichts fällt hinten runter, nichts geht doppelt raus.
- **Niemand tippt einen Kontakt zweimal.** Erfasst wird einmal, alle nachgelagerten Tools lesen aus diesem Datensatz.

Was sich nicht ändert, ist Ihre Abschlussquote bei einem guten Lead. Das Modell sortiert und entwirft; verkaufen tut es nicht. Wenn Ihr eigentliches Problem darin besteht, dass qualifizierte Interessenten mit Ihnen sprechen und dann nicht kaufen, macht dieser Build das schneller sichtbar, lösen wird er es nicht.

Die erste Zahl, die es zu messen lohnt, ist die Übereinstimmungsrate des Scorings: Lassen Sie den Scorer über die gewonnenen und verlorenen Leads des letzten Quartals laufen und prüfen Sie, ob seine Rangfolge zum tatsächlichen Ausgang passt. Wenn nicht, gehören Ihre Kriterien in den Prompt, nicht mehr Automatisierung drumherum.

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
4. **Prompts iterieren**: Rechnen Sie damit, den Scoring-Prompt mehrfach gegen echte abgeschlossene Deals umzuschreiben. Die erste Fassung ist nie die, die bleibt

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

Wichtige Erkenntnis: Ein `personalization_hook`-Feld einbauen: es gibt Ihrem Sales-Team ein spezifisches Detail zum Referenzieren in der Ansprache, sodass Antworten persönlich wirken, auch bei Skalierung.

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

> **Kein Screenshot. Der echte Workflow.** Das ist die exakte n8n-JSON, aus einer laufenden Instanz exportiert. Importieren Sie sie und prüfen Sie jeden Node selbst.
>
> [Download n8n-crm-lead.json](/workflows/n8n-crm-lead.json)

**Schnellstart:**
1. JSON importieren via n8n Einstellungen → Workflow importieren
2. Zugangsdaten konfigurieren (Anthropic API, Slack, Notion, E-Mail/SMTP)
3. ICP-Kriterien im Claude-Prompt auf Ihren Zielkunden anpassen
4. Passende Slack-Channels erstellen (#sales-hot-leads)
5. Mit Beispiel-Formular-Submissions testen

Dieser Starter implementiert die Kern-Scoring- und Routing-Logik. Eine Produktionsimplementierung würde Lead-Anreicherung via Clearbit/Apollo, CRM-Sync (HubSpot, Pipedrive), mehrstufige E-Mail-Sequenzen mit Delay-Nodes und Eskalationslogik für nicht kontaktierte Hot-Leads hinzufügen: Verfeinerungen, die aus dem Verständnis Ihres spezifischen Sales-Prozesses entstehen.

## Ihr nächster Schritt

Haben Sie eine ähnliche Lead-Management-Herausforderung?

1. **Audit**: Bilden Sie Ihren aktuellen Lead-Flow ab, wo sind die Lücken?
2. **Priorisieren**: Starten Sie mit einer Quelle, z.B. Website-Formulare.
3. **Messen**: Tracken Sie die Reaktionszeit vor und nach der Änderung.

Wenn langsame Follow-ups der eigentliche Übeltäter sind, zeigt die [Lead-Response-Demo](/de/projekte/), wie eine Antwort in Minuten statt Stunden aussieht.

[Kostenloses Strategiegespräch buchen](https://cal.com/tobias-leinss/strategiegespraech): Ich zeige Ihnen, wie das für Ihr Setup aussehen würde.
