---
title: "Nie wieder Meeting-Protokolle schreiben: KI-Automatisierung für Besprechungen"
description: "Ein 1-stündiges Meeting produziert 20 Minuten Nacharbeit – Protokoll schreiben, verteilen, nachfassen. Mit n8n, Whisper und Claude erledigt ein Workflow das in 90 Sekunden."
pubDate: 2025-03-10
updatedDate: 2026-07-04
category: automation
tags: ["meeting", "protokoll", "transkription", "n8n", "ki", "whisper"]
heroImage: "/images/blog/meeting-automation.png"
draft: false
lang: de
alternateSlug: "meeting-minutes-automation"
---

> **Kurz gesagt:** Ein Protokoll-Workflow nimmt Ihre Audioaufnahme, transkribiert sie mit Whisper und lässt Claude daraus eine strukturierte Zusammenfassung mit Entscheidungen und Aufgaben machen. Anschließend geht sie automatisch per E-Mail an alle. Das Ganze läuft in 60–90 Sekunden und ersetzt rund 35 Minuten Handarbeit pro Meeting.

Ein 1-stündiges Meeting produziert 20–30 Minuten Nacharbeit: Protokoll schreiben, formatieren, an alle Teilnehmer schicken, Aufgaben in den Projektmanager eintragen. Wer macht das? Meistens die Person, die sowieso schon zu viel zu tun hat.

Und was passiert 48 Stunden später? Keiner hat das Protokoll gelesen. Die Aufgaben liegen unbearbeitet. Beim nächsten Meeting wiederholt sich alles.

Das Problem ist nicht das Meeting selbst — es ist die manuelle Dokumentation danach.

## Was gutes Meeting-Tracking wirklich kostet

Stellen Sie sich vor: 10 Meetings pro Woche, à 20 Minuten Nacharbeit. Das sind **200 Minuten** — über **3 Arbeitsstunden** — die wöchentlich für Protokolle verloren gehen. Hochgerechnet aufs Jahr: fast **2 Arbeitswochen** nur für Meeting-Dokumentation.

Dabei sind die Qualitätsprobleme noch nicht eingerechnet:
- Notizen sind unvollständig, weil man gleichzeitig zuhören und mitschreiben muss
- Aufgaben werden vergessen oder unklar formuliert
- Entscheidungen sind im Protokoll begraben, nicht auffindbar
- Verschiedene Teilnehmer erinnern sich unterschiedlich

## Wie funktioniert der Meeting-Protokoll-Bot?

Ich habe einen n8n-Workflow entwickelt, der eine Audioaufnahme in ein strukturiertes Meeting-Protokoll verwandelt — vollautomatisch.

### Schritt 1: Transkription mit Whisper

OpenAIs Whisper-Modell ist auf Sprache spezialisiert und erkennt zuverlässig:
- Deutschen Dialekt und Akzente (Bayrisch, Schwäbisch, Österreichisch)
- Fachterminologie und Firmennamen
- Gespräche mit mehreren Personen
- Schlechte Audioqualität (Videokonferenz-Hintergrundgeräusche)

Die Transkription einer 60-Minuten-Aufnahme dauert **20–30 Sekunden**.

### Schritt 2: Strukturierung mit Claude

Das rohe Transkript geht an Claude Sonnet, der daraus ein strukturiertes Protokoll extrahiert:

```markdown
# Meeting: Q2-Planung — 10.03.2025

**Teilnehmer:** Anna, Stefan, Maria

## Zusammenfassung
- Q2-Budget um 15% erhöht, Fokus auf Marketing
- Neue CRM-Einführung auf Juli verschoben
- Kundenservice-Team bekommt 2 neue Mitarbeiter

## Entscheidungen
1. CRM-Migration verschoben auf 01.07. (Verantwortlich: Stefan)
2. Budget-Erhöhung genehmigt (Verantwortlich: Anna)

## Aufgaben
- [ ] Stefan: RFP für CRM-Anbieter bis 20.03.
- [ ] Maria: Stellenausschreibungen veröffentlichen bis 15.03.
- [ ] Anna: Budget-Anpassung in Planung einpflegen bis 12.03.

## Offene Fragen
- Werden externe Berater für CRM-Migration benötigt?

## Nächstes Meeting
24.03.2025, 14:00 Uhr
```

Claude verwendet dabei **strukturierte Ausgabe** (Tool Use), sodass das Protokoll immer dasselbe Format hat — unabhängig davon, wie chaotisch die Diskussion war.

### Schritt 3: Verteilung

Das fertige Protokoll geht **automatisch** per E-Mail an alle Teilnehmer. Optional: Archivierung in Google Docs, Confluence oder Notion.

Gesamtdauer vom Hochladen der Aufnahme bis zur versendeten E-Mail: **60–90 Sekunden**.

## Datenschutz: Was Sie wissen müssen (DSGVO)

Meeting-Aufnahmen sind sensibel. Vor der Implementierung drei wichtige Punkte:

**1. Einwilligung ist Pflicht**

Sie dürfen Meetings nur aufnehmen, wenn alle Teilnehmer eingewilligt haben. Am einfachsten: Standard-Formulierung am Meeting-Anfang, bestätigt per Mausklick in der Einladung.

**2. Cloud vs. lokal**

Die Standard-Version sendet Audio an OpenAIs Whisper API. Für Unternehmen mit strengen Datenschutzanforderungen gibt es eine lokale Alternative:

| Option | Latenz | Datenschutz | Kosten |
|--------|--------|-------------|--------|
| OpenAI Whisper API | ~30 Sek. | Daten verlassen Infrastruktur | ~€0,10/Stunde |
| whisper.cpp (lokal) | ~2–5 Min. | On-Premise | Serverkosten |
| faster-whisper (lokal) | ~45 Sek. | On-Premise | Serverkosten |

**3. Automatisches Löschen**

Der Workflow löscht die Audiodatei nach erfolgreicher Transkription. Nur das Textprotokoll bleibt erhalten — und das enthält keine personenbezogenen Audiodaten.

## ROI: Was Sie konkret sparen

| Szenario | Ohne Automatisierung | Mit Bot |
|----------|---------------------|---------|
| Protokoll schreiben | 20 Min./Meeting | 0 Min. |
| Aufgaben eintragen | 10 Min./Meeting | 0 Min. |
| E-Mail an Teilnehmer | 5 Min./Meeting | 0 Min. |
| **Gesamt** | **35 Min./Meeting** | **2 Min. (Upload)** |

Bei 10 Meetings/Woche, €50/Stunde: **~€2.900/Monat** gespartes Arbeitszeit-Äquivalent.

Das System zahlt sich bei realistischen Zahlen in der ersten Woche aus.

## Einsatzszenarien

Der Bot funktioniert besonders gut für:

**Wöchentliche Team-Standup-Meetings**
Kurze, action-fokussierte Protokolle. Die wichtigsten 3 Aufgaben aus dem 15-Minuten-Meeting landen automatisch bei den Verantwortlichen.

**Kunden-Calls**
Formellere Zusammenfassung mit klaren Next Steps. Der Kunde bekommt das Protokoll noch während des Auflegen-Klickens.

**Strategie- und Planungs-Sessions**
Lange Meetings mit vielen Entscheidungen. Claude strukturiert auch komplexe Diskussionen klar.

**1:1-Meetings**
Entwicklungsgespräche, Feedback-Sessions. Protokolle werden privat gespeichert, nicht an alle verteilt.

## Was Sie NICHT automatisieren sollten

**Sensible HR-Gespräche**: Abmahnungen, Kündigungsgespräche, Gehaltsverhandlungen. Hier ist menschliches Urteilsvermögen und Diskretion wichtiger als Effizienz.

**Vertrauliche Vertragsverhandlungen**: Wenn externe Parteien beteiligt sind und keine Aufnahmeeinwilligung vorliegt.

Das System erkennt keine automatisch "verbotenen" Themen — Verantwortung liegt beim Menschen.

## Technischer Stack: n8n + Whisper + Claude

Der Workflow läuft auf **n8n** (self-hosted oder Cloud) und nutzt:
- **OpenAI Whisper API** für Transkription
- **Claude Sonnet (Anthropic)** für strukturierte Extraktion
- **SMTP** für E-Mail-Versand
- Optional: **Google Docs API** für Archivierung

Monatliche Kosten bei 10h Meeting-Audio/Woche:

| Posten | Monatlich |
|--------|-----------|
| Whisper API (~40h Audio) | ~€4 |
| Claude API (~160 Zusammenfassungen) | ~€8 |
| n8n (self-hosted) | €0 |
| **Gesamt** | **~€12/Monat** |

vs. hunderte Euro Zeitkosten.

## Laden Sie den Workflow herunter

> **📥 Kein Screenshot — der echte Workflow.** Das ist die exakte n8n-JSON, aus einer laufenden Instanz exportiert. Importieren Sie sie und prüfen Sie jeden Node selbst.
>
> [→ Meeting-Protokoll Bot Workflow (JSON)](/workflows/meeting-protokoll.json)

**Voraussetzungen:**
- n8n (Self-hosted oder Cloud)
- OpenAI API-Key (für Whisper-Transkription)
- Anthropic Claude API-Key
- SMTP-Konfiguration für E-Mail-Versand

**Setup in 3 Schritten:**
1. JSON importieren via n8n → Einstellungen → Workflow importieren
2. API-Keys in den Zugangsdaten hinterlegen
3. Webhook-URL notieren und in Ihr Meeting-Upload-Tool eintragen

## Technischer Deep Dive

Wenn Sie die Details hinter dem Workflow interessieren — wie Whisper mit deutschen Akzenten umgeht, warum Claude Tool Use statt Text-Ausgabe verwendet wird, und wie Sie das System für >25MB-Dateien erweitern:

→ **[KI-Meeting-Assistent bauen mit Whisper, Claude und n8n](https://leinss.xyz/de/blog/meeting-protokoll-bot/)** *(leinss.xyz)*

## Ihr nächster Schritt

Wie viele Meetings haben Sie pro Woche? Multiplizieren Sie mit 35 Minuten — das ist Ihre monatliche Zeitverschwendung für Protokolle.

Wenn die Zahl größer als 2 Stunden ist, lohnt sich die Automatisierung deutlich.

Das ergänzt meine übrige Arbeit rund um [Kommunikationsautomatisierung](/de/services/kommunikationsautomatisierung/), und verwandte Workflows sehen Sie auf der [Demo-Seite](/de/projekte/). Einen Überblick, was zuerst automatisiert gehört, gibt [5 Zeichen, dass Ihr Unternehmen Automatisierung braucht](/de/blog/5-zeichen-dass-ihr-unternehmen-automatisierung-braucht/).

---

*Möchten Sie den Bot für Ihr Team einrichten oder an Ihre spezifischen Tools (Confluence, Notion, Teams) anpassen? [Buchen Sie ein kostenloses Erstgespräch.](https://cal.com/tobias-leinss/strategiegespraech)*
