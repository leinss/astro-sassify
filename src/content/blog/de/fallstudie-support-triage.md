---
title: "Fallstudie: KI-Support-Triage für E-Commerce"
description: "Wie wir die Erstantwortzeit von 8 Stunden auf 15 Minuten reduzierten und 60% der Support-Tickets automatisch lösten – mit KI-gestützter Klassifizierung und Routing."
pubDate: 2025-01-27
heroImage: "/images/blog/case-study-support.png"
category: case-study
tags: ["support", "triage", "n8n", "slack", "ai", "claude", "ollama", "e-commerce"]
draft: false
lang: de
alternateSlug: "case-study-support-triage"
---

# KI-Support-Triage für E-Commerce

Das Support-Team eines Online-Händlers war überlastet. Kundenanfragen häuften sich, dringende Probleme gingen unter, und die Antwortzeiten dehnten sich auf Tage aus. Wir haben ein KI-Triage-System gebaut, das klassifiziert, routet und häufige Anfragen sogar automatisch beantwortet.

## Die Herausforderung

**Kunde**: E-Commerce-Händler, 50.000 monatliche Bestellungen, 5-köpfiges Support-Team

**Schmerzpunkte**:
- Support-Anfragen per E-Mail, Kontaktformular und Social Media
- Keine Priorisierung—wer zuerst schreibt, wird zuerst bearbeitet (auch wenn es "Wo ist meine Bestellung?" vs. "Zahlung fehlgeschlagen" ist)
- Repetitive Fragen verbrauchten 70% der Agent-Zeit
- Rückstau am Wochenende/Feiertagen brauchte Tage zum Abarbeiten

**Vor der Automatisierung**:
| Metrik | Wert |
|--------|------|
| Erstantwortzeit | 8 Stunden (Durchschnitt) |
| Lösungszeit | 24-48 Stunden |
| Tickets pro Agent/Tag | 40-50 |
| Repetitive Anfragen | 70% |
| Kundenzufriedenheit | 3,2/5 |

## Die Lösung

Wir haben eine KI-gestützte Triage-Schicht deployed, die zwischen Kunden und Support-Team sitzt.

### Tool-Stack

| Komponente | Tool | Warum |
|------------|------|-------|
| Nachrichteneingang | E-Mail + Kontaktformular-Webhooks | Einheitlicher Einstiegspunkt |
| Workflow-Engine | n8n | Flexible Routing-Logik |
| KI-Klassifizierung | Claude API | Nuanciertes Verständnis von Absichten |
| KI-Klassifizierung (Lokal) | Ollama + Mistral | Kosteneffizient für hohes Volumen |
| Team-Kommunikation | Slack | Echtzeit-Alerts, Channel-Routing |
| Antwort-Entwürfe | Claude API | Konsistente, markengerechte Replies |

### System-Architektur

```
Kundennachricht → n8n → KI-Klassifizierung → Route/Antwort → Slack/E-Mail
```

**Schritt 1: Nachrichteneingang**

Alle Support-Kanäle münden in n8n:
- E-Mail-Weiterleitung an dediziertes Postfach
- Kontaktformular-Webhook
- Social Media via Zapier/Make-Integration

Jede Nachricht erhält eine eindeutige Ticket-ID und Zeitstempel.

**Schritt 2: KI-Klassifizierung**

Claude analysiert jede Nachricht auf drei Dimensionen:

**Dringlichkeit** (1-5):
- 5: Zahlung fehlgeschlagen, Konto gesperrt, Sicherheitsproblem
- 4: Bestellung nicht geliefert (über erwartetem Datum)
- 3: Produktfrage, Versandanfrage
- 2: Allgemeines Feedback, Feature-Anfrage
- 1: Spam, irrelevant

**Kategorie**:
- `order-status`: Wo ist meine Bestellung?
- `returns`: Retoure/Erstattungsanfragen
- `product`: Produktfragen
- `payment`: Zahlungsprobleme
- `account`: Login, Passwort, Kontoänderungen
- `complaint`: Negatives Feedback
- `other`: Alles andere

**Automatisch lösbar** (ja/nein):
Kann dies mit Standardinformationen + Bestellabfrage beantwortet werden?

**Klassifizierungs-Prompt**:
```
Analysiere diese Kundensupport-Nachricht:

"{message}"

Kunden-E-Mail: {email}
Bestellhistorie: {recent_orders_summary}

Gib JSON zurück:
{
  "urgency": 1-5,
  "category": "order-status|returns|product|payment|account|complaint|other",
  "auto_resolvable": true/false,
  "key_issue": "ein Satz Zusammenfassung",
  "suggested_response": "Entwurf wenn auto_resolvable"
}
```

**Schritt 3: Intelligentes Routing**

Basierend auf der Klassifizierung nehmen Nachrichten verschiedene Wege:

| Dringlichkeit | Auto-Lösbar | Aktion |
|---------------|-------------|--------|
| 5 | Egal | Sofortiger Slack-Alert an #support-urgent |
| 3-4 | Nein | Route zum entsprechenden Slack-Channel |
| 1-4 | Ja | Auto-Antwort + Protokoll |
| 1 | N/A | Archivieren (Spam-Filter) |

**Slack-Channels**:
- `#support-urgent`: Zahlungsprobleme, Sicherheitsbedenken
- `#support-orders`: Versand, Lieferung, Bestelländerungen
- `#support-returns`: Retouren und Erstattungen
- `#support-general`: Alles andere

Jede Slack-Nachricht enthält:
- Kundenname und E-Mail
- Bestellhistorie-Zusammenfassung
- KI-Klassifizierung und Begründung
- Ein-Klick-Aktionen (antworten, eskalieren, schließen)

**Schritt 4: Auto-Antwort-System**

Für automatisch lösbare Anfragen entwirft die KI Antworten mit:
- Bestellstatus aus Shop-System (Shopify/WooCommerce API)
- Versanddienstleister-Tracking
- Retourenrichtlinien-Details
- FAQ-Wissensbasis

**Beispiel Auto-Antwort (Bestellstatus)**:
```
Hallo Sarah,

vielen Dank für Ihre Anfrage! Ich habe Ihre Bestellung #12345 geprüft.

📦 Aktueller Status: In Zustellung
🚚 Versanddienstleister: DHL
📍 Letztes Update: Paket hat Sortierzentrum Hamburg verlassen
📅 Erwartete Lieferung: 29. Januar 2025

Sie können Ihr Paket hier verfolgen: [Tracking-Link]

Lassen Sie mich wissen, wenn Sie noch etwas benötigen!

Beste Grüße,
[Marke] Support
```

Auto-Antworten werden sofort gesendet, aber zur Agent-Überprüfung protokolliert.

### Ollama für hohes Volumen

Zur Kostenoptimierung nutzen wir Mistral 7B lokal für die initiale Klassifizierung:
- Verarbeitet 80% der Nachrichten (klare Fälle)
- Claude API nur bei Mehrdeutigkeit oder hoher Dringlichkeit aufgerufen
- Reduziert API-Kosten um 70%

## Ergebnisse

Nach 6 Wochen in Produktion:

| Metrik | Vorher | Nachher | Änderung |
|--------|--------|---------|----------|
| Erstantwortzeit | 8 Stunden | 15 Minuten | -97% |
| Lösungszeit | 24-48 Stunden | 4 Stunden | -83% |
| Tickets pro Agent/Tag | 40-50 | 25-30 (nur komplexe) | -40% |
| Auto-gelöst | 0% | 60% | +60% |
| Kundenzufriedenheit | 3,2/5 | 4,6/5 | +44% |

**Aufschlüsselung Auto-Lösung**:
- Bestellstatus-Anfragen: 95% auto-gelöst
- Versandfragen: 85% auto-gelöst
- Retourenrichtlinien-Fragen: 80% auto-gelöst
- Kontoprobleme: 40% auto-gelöst (oft manuelle Verifizierung nötig)

**Agent-Feedback**: "Ich bearbeite jetzt interessante Probleme statt Tracking-Nummern zu kopieren."

## Implementierungsdetails

### Sicherheitsmechanismen

KI-Systeme brauchen Leitplanken:

1. **Konfidenz-Schwelle**: Auto-Antwort nur bei KI-Konfidenz >90%
2. **Sentiment-Prüfung**: Verärgerte Kunden gehen immer an Menschen
3. **Eskalations-Keywords**: "Anwalt", "Beschwerde", "Betrug" → sofortige Eskalation
4. **Tägliche Prüfung**: Agent prüft stichprobenartig 5% der Auto-Antworten

### Antwortqualität

Alle Auto-Antworten folgen Markenrichtlinien:
- Ton: Freundlich, prägnant, hilfsbereit
- Format: Emoji-Nutzung, Absatzstruktur
- Signatur: Konsistente Unterschrift

Templates sind KI-generiert, aber vor Deployment von Menschen genehmigt.

### Datenschutz

- Kundendaten bleiben in bestehenden Systemen (Shopify, E-Mail)
- KI erhält nur notwendigen Kontext (Bestellzusammenfassung, nicht vollständige Historie)
- Self-hosted n8n für Workflow-Logik
- Option zur lokalen Klassifizierung via Ollama

## Zeitplan

**Woche 1**: Eingangsintegration, Klassifizierungs-Prompt-Entwicklung

**Woche 2**: Slack-Routing, Auto-Antwort-Templates

**Woche 3**: Tests mit 2 Wochen historischer Tickets

**Woche 4**: Shadow-Modus (KI klassifiziert, Menschen verifizieren)

**Woche 5-6**: Schrittweiser Auto-Antwort-Rollout (10% → 50% → 100%)

**Laufende Kosten**:
| Posten | Monatlich |
|--------|-----------|
| Claude API (Klassifizierung + Entwürfe) | €120 |
| Ollama (self-hosted, Vorfilter) | €0 |
| n8n (self-hosted) | €0 |
| Slack (vorhanden) | €0 |
| **Gesamt** | **€120/Monat** |

vs. Einstellung eines zusätzlichen Support-Agents bei €3.500/Monat.

## Wichtige Erkenntnisse

1. **Klassifizierungsgenauigkeit ist alles**: 80% der Zeit ins Prompt-Engineering investieren
2. **Mit risikoarmen Auto-Antworten starten**: Bestellstatus ist sicher; Beschwerden nicht
3. **Menschliches Override ist einfach**: Ein Klick um Auto-Antwort für bestimmten Kunden zu stoppen
4. **Messen was zählt**: CSAT verbesserte sich mehr als bearbeitetes Volumen

## Ihr nächster Schritt

Ertrinkt Ihr Support-Team in repetitiven Anfragen?

1. **Kategorisieren**: Welcher Prozentsatz der Tickets ist wirklich repetitiv?
2. **Prüfen**: Welche Anfragen könnten mit vorhandenen Daten auto-beantwortet werden?
3. **Pilotieren**: Mit einer Kategorie starten (z.B. Bestellstatus)

[Kostenloses Strategiegespräch buchen](https://cal.com/tobias-leinss/strategymeeting) — Ich analysiere Ihre Support-Muster und zeige was automatisierbar ist.
