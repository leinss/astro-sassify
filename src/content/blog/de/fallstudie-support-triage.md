---
title: "Referenz-Build: KI-Support-Triage für E-Commerce"
description: "Die vollständige Architektur einer KI-Triage-Schicht, die Support-Tickets klassifiziert, routet und beantwortet: jeder Node erklärt, mit n8n-Workflow zum Herunterladen und Nachprüfen."
pubDate: 2026-07-04
heroImage: "/images/blog/case-study-support.png"
category: reference-build
tags: ["support", "triage", "n8n", "slack", "ai", "claude", "ollama", "e-commerce"]
draft: false
lang: de
alternateSlug: "case-study-support-triage"
---

> **Kurz gesagt:** Eine KI-Triage-Schicht sitzt zwischen Ihren Kunden und Ihrem Support-Team. Sie liest jede eingehende Nachricht, bewertet die Dringlichkeit, vergibt eine Kategorie, leitet in den richtigen Slack-Kanal weiter und beantwortet die Routinefälle selbst, mit Konfidenzschwellen und Sentiment-Prüfung, damit alles Zweifelhafte bei einem Menschen landet. Gebaut auf n8n und Claude, mit lokalem Ollama-Vorfilter, um die API-Rechnung klein zu halten.

> **Was das hier ist:** ein Referenz-Build. Die Architektur, die Prompts und die exakte n8n-Datei, aufgeschrieben, damit Sie die Technik beurteilen können. Es stehen keine Kundenzahlen darin. Prüfen können Sie das laufende System: **[Demos ausprobieren →](/de/projekte/)**.

## Das Problem dahinter

Support-Anfragen kommen per E-Mail, Kontaktformular und Social Media, und sie werden in der Reihenfolge ihres Eintreffens bearbeitet. Das heißt: "Wo ist meine Bestellung?" und "Meine Zahlung ist fehlgeschlagen" stehen in derselben Schlange, sortiert nach Uhrzeit. Routinefragen fressen den Tag, dringende Fälle warten dahinter, und ein Wochenende erzeugt einen Rückstau, der Tage zum Abarbeiten braucht.

Die Lösung heißt Priorisierung, und Priorisierung setzt voraus, dass jemand die Nachricht liest. Genau diese Aufgabe gibt dieser Build an ein Modell.

## Auf einen Blick

| | |
|---|---|
| **Stack** | n8n-Triage + Claude-Klassifizierung (Ollama-Vorfilter) + Slack-Routing + KI-Auto-Antworten |
| **Was entschieden wird** | Dringlichkeit 1-5, Kategorie, automatisch lösbar ja/nein, Sentiment, Konfidenz |
| **Sicherungen** | 90 % Konfidenzuntergrenze, Sentiment-Sperre, Eskalations-Schlüsselwörter, 5 % Stichprobenprüfung durch Menschen |
| **Nachprüfbar** | Die vollständige n8n-JSON, aus der laufenden Instanz exportiert ([Download unten](#selbst-bauen)) |

Genau diese Art von Aufbau mache ich unter [Kommunikationsautomatisierung](/de/services/kommunikationsautomatisierung/). Die [Live-Demos](/de/projekte/) zeigen funktionierende Beispiele.

## Die Lösung

Eine KI-gestützte Triage-Schicht sitzt zwischen Kunden und Support-Team.

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

Zur Kostenoptimierung läuft Mistral 7B lokal als erster Klassifizierungsdurchgang:
- Er übernimmt die klaren Fälle, bei den meisten Ticket-Mischungen also die große Mehrheit
- Claude wird nur bei Mehrdeutigkeit oder hoher Dringlichkeit aufgerufen
- Wie viel Sie sparen, hängt davon ab, wie einseitig Ihre Ticket-Mischung ist: messen Sie es im Schattenbetrieb, bevor Sie eine Zahl annehmen

## Was sich ändert, und was nicht

Hier steht keine Vorher-Nachher-Tabelle. Ich habe dieses System nicht in Ihrem Unternehmen betrieben, und für ein erfundenes Unternehmen erfundene Zahlen sagen Ihnen nichts.

Was die Architektur ändert, ist strukturell, und Sie können es direkt nachvollziehen:

- **Die Eingangsreihenfolge bestimmt nicht mehr die Priorität.** Eine fehlgeschlagene Zahlung erreicht einen Menschen vor einer Frage nach der Sendungsnummer: unabhängig davon, was zuerst eintraf.
- **Beantwortbare Fragen warten nicht mehr auf einen Agent.** Alles, was das System aus Bestelldaten und FAQ beantworten kann, wird sofort beantwortet, zu jeder Uhrzeit.
- **Agents kopieren keine Sendungsnummern mehr.** Die Warteschlange, die sie sehen, ist die Warteschlange, die einen Menschen braucht.

Was das wert ist, hängt von Ihrer Ticket-Mischung ab. Der ehrliche Weg, das herauszufinden: Lassen Sie den Klassifizierer im Schattenbetrieb über Ihre Tickets des letzten Monats laufen und zählen Sie, was er automatisch gelöst hätte, bevor Sie eine einzige Auto-Antwort scharf schalten. Das ist Woche drei im Zeitplan unten, und diesen Schritt würde ich nicht überspringen.

**Effekt fürs Team**: Agents bearbeiten die interessanten Fälle, statt den Tag mit dem Kopieren von Tracking-Nummern zu verbringen.

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

## Selbst bauen

Hier ist die Architektur für den Aufbau eines smarten Support-Triage-Systems.

### Node-für-Node Aufschlüsselung

**1. E-Mail-Trigger (IMAP)**

Support-Postfach auf eingehende Nachrichten überwachen. Der Trigger pollt alle 2 Minuten (konfigurierbar) und erfasst:
- Absender-E-Mail
- Betreffzeile
- Nachrichteninhalt (Text und HTML)
- Zeitstempel

Alternative: Webhook verwenden, wenn Ihre Support-Plattform (Zendesk, Intercom) Events pushen kann.

**2. Vorfilter mit Ollama**

Vor dem Claude-API-Aufruf eine schnelle lokale Klassifizierung mit Ollama durchführen (Mistral 7B funktioniert gut). Dies behandelt 80% der eindeutigen Fälle günstig:

```
order-status | returns | product | payment | account | complaint | spam | other
```

Warum zweistufig? Kostenoptimierung. Ollama ist kostenlos/lokal; Claude API kostet pro Token. Nur mehrdeutige oder kritische Nachrichten an Claude routen.

**3. Eskalations-Check**

Vor der Detailanalyse auf Eskalations-Keywords scannen: "Anwalt", "Klage", "Betrug", "Polizei", "rechtliche Schritte". Diese umgehen das normale Routing und gehen direkt an `#support-urgent` mit maximaler Priorität.

**4. Claude Tiefenanalyse**

Für komplexe oder mehrdeutige Tickets liefert Claude:
- **Dringlichkeitsscore (1-5)**: Zahlung fehlgeschlagen = 5, allgemeine Frage = 2
- **Kategorie**: Nuancierter als Vorfilter
- **Auto-lösbar**: Kann dies mit Bestellabfrage + FAQ beantwortet werden?
- **Sentiment**: Verärgerte Kunden zur menschlichen Bearbeitung erkennen
- **Antwortvorschlag**: Entwurf wenn auto-lösbar
- **Konfidenz-Score**: Nur auto-antworten wenn >90%

**5. Kategorie-basiertes Slack-Routing**

Tickets zu spezialisierten Channels routen:
- `#support-billing` → Zahlungsprobleme (Dringlichkeit 4-5)
- `#support-orders` → Versand-, Lieferfragen
- `#support-returns` → Retoure-/Erstattungsanfragen
- `#support-general` → Alles andere

Jede Slack-Nachricht enthält: Kunden-E-Mail, Dringlichkeit, KI-Zusammenfassung und ob Auto-Antwort gesendet wurde.

**6. Auto-Antwort-Logik (Optional)**

Für Tickets mit `auto_resolvable: true`, hoher Konfidenz und nicht-verärgtem Sentiment:
- Bestellstatus aus Shop-API abrufen
- Personalisierte Antwort mit Template + Live-Daten generieren
- Sofort senden (oder zur manuellen Prüfung queuen)
- Für Stichproben-Kontrolle loggen

### Starter-Workflow herunterladen

> **Kein Screenshot. Der echte Workflow.** Das ist importierbare n8n-JSON: jeden Node lesen, eigene Zugangsdaten eintragen, laufen lassen. Es ist der Aufbau, wie er entworfen wurde, kein Export aus einer laufenden Instanz. Nehmen Sie ihn als Startpunkt, den Sie durch Lesen prüfen können, nicht als System mit Produktionskilometern. Die Workflows hinter den [Live-Demos](/de/projekte/) sind die, die aus meinem eigenen n8n exportiert sind.
>
> [Download n8n-support-triage.json](/workflows/n8n-support-triage.json)

**Schnellstart:**
1. JSON importieren via n8n Einstellungen → Workflow importieren
2. Zugangsdaten konfigurieren (IMAP für Support-Postfach, Slack, Anthropic API)
3. Ollama lokal einrichten oder Vorfilter überspringen (Claude-only Modus)
4. Slack-Channels erstellen (#support-urgent, #support-billing, etc.)
5. Dringlichkeitsstufen und Kategorien für Ihr Business anpassen

Dieser Starter implementiert Klassifizierung und Routing. Eine vollständige Implementierung würde Auto-Antwort-Templates, Bestellstatus-API-Integration, Konfidenz-Schwellen, CSAT-Tracking und Agent-Zuweisungslogik hinzufügen: die operativen Details, die den Unterschied zwischen einer Demo und einem System ausmachen, auf das Ihr Team sich verlässt.

## Technische Details

Für eine detaillierte technische Anleitung zum Aufbau von Kundenservice-Bots mit n8n, siehe meinen persönlichen Blog: **[Building Customer Service Bots with n8n](https://leinss.xyz/blog/en/n8n-customer-service/)** (EN), der Intent-Klassifizierung, Kontext-Retrieval und Antwortgenerierung behandelt.

## Ihr nächster Schritt

Ertrinkt Ihr Support-Team in repetitiven Anfragen?

1. **Kategorisieren**: Welcher Prozentsatz der Tickets ist wirklich repetitiv?
2. **Prüfen**: Welche Anfragen könnten mit vorhandenen Daten auto-beantwortet werden?
3. **Pilotieren**: Mit einer Kategorie starten, z.B. Bestellstatus.

Für das größere Bild, wo KI in den Kundensupport passt, siehe [Kommunikation automatisieren und trotzdem menschlich bleiben](/de/blog/kommunikation-automatisieren-menschlich-bleiben/).

[Kostenloses Strategiegespräch buchen](https://cal.com/tobias-leinss/strategiegespraech). Ich analysiere Ihre Support-Muster und zeige was automatisierbar ist.
