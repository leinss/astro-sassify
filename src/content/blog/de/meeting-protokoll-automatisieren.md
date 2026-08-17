---
title: "Nie wieder Meeting-Protokolle schreiben: KI-Automatisierung für Besprechungen"
description: "Ein 1-stündiges Meeting produziert 20 Minuten Nacharbeit: Protokoll schreiben, verteilen, nachfassen. Mit n8n, Whisper und Claude erledigt ein Workflow das, solange das Meeting noch frisch ist."
pubDate: 2026-05-06
category: automation
tags: ["meeting", "protokoll", "transkription", "n8n", "ki", "whisper"]
heroImage: "/images/blog/meeting-automation.png"
draft: false
lang: de
alternateSlug: "meeting-minutes-automation"
---

> **Kurz gesagt:** Ein Protokoll-Workflow nimmt Ihre Audioaufnahme, transkribiert sie mit Whisper und lässt Claude daraus eine strukturierte Zusammenfassung mit Entscheidungen und Aufgaben machen. Anschließend geht sie automatisch per E-Mail an alle. Er ersetzt das Schreiben, Formatieren und Verteilen nach dem Meeting, und genau dort geht die Zeit hin.

> **Was das hier ist:** der Workflow, so aufgeschrieben, dass Sie die Technik beurteilen können, mit der n8n-JSON zum Herunterladen und Importieren. Das Widget auf der [Demo-Seite](/de/projekte/) transkribiert derzeit **nicht**: Es braucht einen Transkriptionsdienst, der auf der Maschine mit den Demos nicht läuft, und gibt stattdessen eine Beispiel-Zusammenfassung zurück. Die übrigen Demos laufen. Das sage ich Ihnen lieber, als dass Sie es beim Hochladen einer Datei merken.

Ein 1-stündiges Meeting produziert 20-30 Minuten Nacharbeit: Protokoll schreiben, formatieren, an alle Teilnehmer schicken, Aufgaben in den Projektmanager eintragen. Wer macht das? Meistens die Person, die sowieso schon zu viel zu tun hat.

Und was passiert 48 Stunden später? Keiner hat das Protokoll gelesen. Die Aufgaben liegen unbearbeitet. Beim nächsten Meeting wiederholt sich alles.

Das Problem ist nicht das Meeting selbst. Es ist die manuelle Dokumentation danach.

## Was gutes Meeting-Tracking wirklich kostet

Stellen Sie sich vor: 10 Meetings pro Woche, à 20 Minuten Nacharbeit. Das sind **200 Minuten**, über **3 Arbeitsstunden**, die wöchentlich für Protokolle verloren gehen. Aufs Jahr gerechnet rund **170 Stunden**, also etwa vier Arbeitswochen nur für Meeting-Dokumentation.

Dabei sind die Qualitätsprobleme noch nicht eingerechnet:
- Notizen sind unvollständig, weil man gleichzeitig zuhören und mitschreiben muss
- Aufgaben werden vergessen oder unklar formuliert
- Entscheidungen sind im Protokoll begraben, nicht auffindbar
- Verschiedene Teilnehmer erinnern sich unterschiedlich

## Wie funktioniert der Meeting-Protokoll-Bot?

Ich habe einen n8n-Workflow entwickelt, der eine Audioaufnahme in ein strukturiertes Meeting-Protokoll verwandelt, vollautomatisch.

### Schritt 1: Transkription mit Whisper

OpenAIs Whisper-Modell ist auf Sprache spezialisiert und kommt mit dem zurecht, woran einfache Spracherkennung scheitert:
- Deutschen Dialekt und Akzente (Bayrisch, Schwäbisch, Österreichisch)
- Fachterminologie und Firmennamen
- Gespräche mit mehreren Personen
- Schlechte Audioqualität (Videokonferenz-Hintergrundgeräusche)

Wie lange eine Transkription dauert, hängt von der Länge der Aufnahme ab und davon, ob Sie eine gehostete API rufen oder das Modell selbst betreiben. Messen Sie es an Ihrem eigenen Audio, statt einer Zahl aus fremden Setups zu vertrauen. Die lokalen Optionen unten sind spürbar langsamer als die gehostete, und das ist der Preis dafür, dass das Audio im Haus bleibt.

### Schritt 2: Strukturierung mit Claude

Das rohe Transkript geht an Claude Sonnet, der daraus ein strukturiertes Protokoll extrahiert:

```markdown
# Meeting: Q2-Planung, 10.03.2025

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

Claude verwendet dabei **strukturierte Ausgabe** (Tool Use), sodass das Protokoll immer dasselbe Format hat: unabhängig davon, wie chaotisch die Diskussion war.

### Schritt 3: Verteilung

Das fertige Protokoll geht **automatisch** per E-Mail an alle Teilnehmer. Optional: Archivierung in Google Docs, Confluence oder Notion.

Über den ganzen Lauf dominiert der Transkriptionsschritt. Alles danach ist ein Modellaufruf und eine E-Mail.

## Datenschutz: Was Sie wissen müssen (DSGVO)

Meeting-Aufnahmen sind sensibel. Vor der Implementierung drei wichtige Punkte:

**1. Einwilligung ist Pflicht**

Sie dürfen Meetings nur aufnehmen, wenn alle Teilnehmer eingewilligt haben. Am einfachsten: Standard-Formulierung am Meeting-Anfang, bestätigt per Mausklick in der Einladung.

**2. Cloud vs. lokal**

Der Workflow, so wie Sie ihn herunterladen, sendet Audio an OpenAIs Whisper API. Für Unternehmen mit strengen Datenschutzanforderungen zeigt derselbe Node stattdessen auf ein lokales Modell:

| Option | Wohin das Audio geht | Tempo | Kosten |
|--------|----------------------|-------|--------|
| OpenAI Whisper API | Verlässt Ihre Infrastruktur | Am schnellsten | Pro Audiominute, nach Anbieterpreis |
| whisper.cpp (lokal) | Bleibt On-Premise | Am langsamsten, CPU-gebunden | Nur Serverkosten |
| faster-whisper (lokal) | Bleibt On-Premise | Dazwischen, mit GPU schneller | Nur Serverkosten |

Prüfen Sie den aktuellen Minutenpreis beim Anbieter statt einer Zahl in einem Blogartikel, und messen Sie die lokalen Optionen auf Ihrer eigenen Hardware. Beides ändert sich.

**3. Aufbewahrung ist eine Einstellung, kein Automatismus**

Der Workflow schreibt das Audio nicht auf die Platte, aber das ist nicht dasselbe wie löschen. n8n hält Ausführungsdaten samt Binärdaten nach seinen eigenen Pruning-Einstellungen vor, eine Audiodatei kann also lange nach dem Versand des Protokolls in der Ausführungshistorie liegen. Setzen Sie die Aufbewahrung auf Ihrer n8n-Instanz bewusst, und nehmen Sie „der Workflow speichert es nicht" nicht als Eintrag im Verarbeitungsverzeichnis.

## ROI: Rechnen Sie mit Ihren eigenen Zahlen

Die Ersparnis ist genau das, was Ihre Nacharbeit kostet. Nützlich ist diese Tabelle also erst, wenn Sie sie selbst ausfüllen:

| Szenario | Ohne Automatisierung | Mit Bot |
|----------|---------------------|---------|
| Protokoll schreiben | ~20 Min./Meeting | 0 Min. |
| Aufgaben eintragen | ~10 Min./Meeting | 0 Min. |
| E-Mail an Teilnehmer | ~5 Min./Meeting | 0 Min. |
| **Gesamt** | **~35 Min./Meeting** | **~2 Min. (Upload)** |

Durchgerechnet: 10 Meetings pro Woche mit je 33 gesparten Minuten sind rund 5,5 Stunden die Woche, knapp 24 Stunden im Monat. Bei 50 € pro Stunde sind das etwa 1.200 € Zeitwert im Monat, gegen eine Rechnung im niedrigen zweistelligen Bereich für die API-Aufrufe.

Zwei ehrliche Einschränkungen. Die Protokolle müssen weiterhin gelesen werden, und jemand muss den Aufgaben hinterher sein: verschobene Zeit also, nicht verschwundene. Und wenn bei Ihnen bisher gar keine Protokolle entstehen, sparen Sie keine 35 Minuten, sondern bekommen eine Dokumentation, die es vorher nicht gab. Das kann mehr wert sein, ist aber eine andere Behauptung.

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

Das System erkennt keine automatisch "verbotenen" Themen, Verantwortung liegt beim Menschen.

## Technischer Stack: n8n + Whisper + Claude

Der Workflow läuft auf **n8n** (self-hosted oder Cloud) und nutzt:
- **OpenAI Whisper API** für Transkription
- **Claude Sonnet (Anthropic)** für strukturierte Extraktion
- **SMTP** für E-Mail-Versand
- Optional: **Google Docs API** für Archivierung

Bei 10 Stunden Meeting-Audio pro Woche sind es zwei Posten plus ein Server, den Sie vermutlich ohnehin zahlen:

| Posten | Wie abgerechnet wird |
|--------|----------------------|
| Whisper API | Pro Audiominute: 40 Stunden im Monat sind 2.400 Minuten, mal dem aktuellen Preis des Anbieters |
| Claude API | Pro Zusammenfassung, abhängig von der Transkriptlänge: ein 60-Minuten-Meeting sind einige tausend Token hinein, einige hundert hinaus |
| n8n (self-hosted) | 0 € über den Server hinaus |

Euro-Beträge stehen dort bewusst nicht. Beide Anbieter haben ihre Preise seit dem Bau dieses Workflows mehr als einmal geändert, und eine veraltete Zahl, die den Fall schönt, ist schlechter als keine.

## Laden Sie den Workflow herunter

> **Kein Screenshot. Der echte Workflow.** Das ist die n8n-JSON: Importieren Sie sie und prüfen Sie jeden Node selbst.
>
> [→ Meeting-Protokoll Bot Workflow (JSON)](/workflows/meeting-protokoll.json)
>
> Es ist die portable Fassung, verdrahtet mit OpenAI Whisper und Claude, damit sie auf Ihrer Instanz mit Ihren Schlüsseln läuft. Meine eigene Instanz betreibt eine Variante davon mit anderen Anbietern. Worin sie sich unterscheiden, steht im [technischen Teardown](https://leinss.xyz/blog/de/meeting-assistant-technical/).

**Voraussetzungen:**
- n8n (Self-hosted oder Cloud)
- OpenAI API-Key (für Whisper-Transkription)
- Anthropic Claude API-Key
- SMTP-Konfiguration für E-Mail-Versand

**Setup in 3 Schritten:**
1. JSON importieren via n8n → Einstellungen → Workflow importieren
2. API-Keys in den Zugangsdaten hinterlegen
3. Webhook-URL notieren und in Ihr Meeting-Upload-Tool eintragen

## Technische Details

Wenn Sie die Details hinter dem Workflow interessieren: warum ein erzwungenes Schema besser ist als eine Bitte um Prosa, der Unterschied zwischen Tool-Use und JSON-Modus, und welcher Node das Formen übernimmt:

→ **[KI-Meeting-Assistent bauen mit Whisper, Claude und n8n](https://leinss.xyz/blog/de/meeting-assistant-technical/)** *(leinss.xyz)*

## Ihr nächster Schritt

Wie viele Meetings haben Sie pro Woche, und wie lange dauert die Nacharbeit wirklich? Multiplizieren Sie beides. Darüber entscheiden Sie.

Wenn dabei mehr als ein paar Stunden im Monat herauskommen, lohnt sich der Bau.

Das ergänzt meine übrige Arbeit rund um [Kommunikationsautomatisierung](/de/services/kommunikationsautomatisierung/), und verwandte Workflows sehen Sie auf der [Demo-Seite](/de/projekte/).

---

*Möchten Sie den Bot für Ihr Team einrichten oder an Ihre spezifischen Tools (Confluence, Notion, Teams) anpassen? [Buchen Sie ein kostenloses Erstgespräch.](https://cal.com/tobias-leinss/strategiegespraech)*
