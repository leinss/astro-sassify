---
title: "Excel-Hölle verlassen: Kontaktlisten automatisch bereinigen mit n8n und KI"
description: "Wie Sie mit n8n und Claude messy Kontaktlisten in Sekunden bereinigen, normalisieren und Duplikate entfernen – statt Stunden manuell zu arbeiten."
pubDate: 2025-03-12
category: automation
tags: ["tabellen", "excel", "kontakte", "datenbereinigung", "n8n", "ki"]
heroImage: "/images/blog/from-spreadsheets-to-systems.png"
draft: false
lang: de
alternateSlug: "from-spreadsheets-to-systems"
---

Jedes Unternehmen hat sie: die Kontaktliste, die über Jahre gewachsen ist. Namen mit unterschiedlicher Schreibweise, E-Mail-Adressen in Großbuchstaben, Telefonnummern in vier verschiedenen Formaten, Firmennamen die mal "GmbH" und mal "gmbh" heißen – und irgendwo stecken doppelte Einträge drin.

Das manuelle Bereinigen kostet je nach Größe Stunden bis Tage. Und kaum ist man fertig, kommen neue Einträge rein, die alles wieder durcheinanderbringen.

## Was passiert wirklich mit schmutzigen Daten?

Die sichtbaren Probleme kennt jeder. Aber die unsichtbaren sind teurer:

- **Doppelt versendete E-Mails** schaden der Reputation bei Empfänger und E-Mail-Provider
- **Fehlgeschlagene Validierungen** weil "Max Mustermann" und "max mustermann" als zwei verschiedene Personen behandelt werden
- **Verpasste Kontakte** weil die Suche nach "Müller AG" keine Ergebnisse findet, obwohl "mueller ag" und "Müller ag" im System sind
- **DSGVO-Risiko** bei inkorrekten oder veralteten Daten

Das Ergebnis: das CRM-System, das das Problem lösen sollte, wird selbst zum Problem.

## Der Excel-Retter: Automatische Datenbereinigung mit KI

Der Workflow löst genau dieses Problem. Sie laden Ihre CSV-Daten hoch (oder fügen sie direkt ein), und n8n schickt sie an Claude – der:

1. **Leerzeichen** am Anfang und Ende entfernt
2. **E-Mail-Adressen** normalisiert (Kleinbuchstaben) und auf syntaktische Gültigkeit prüft
3. **Telefonnummern** in ein einheitliches Format bringt (z. B. `+49 176 12345678`)
4. **Namen** korrekt kapitalisiert
5. **Firmennamen** konsistiert (erkennt "bäckerei schmidt gmbh" und "Bäckerei Schmidt GmbH" als identisch)
6. **Duplikate** findet und entfernt – auch Fuzzy-Matches (gleiche Person, leicht unterschiedliche Schreibweise)
7. **Ungültige Felder** markiert

Am Ende gibt es eine bereinigte CSV-Datei zum Download plus eine Zusammenfassung aller vorgenommenen Änderungen.

## Live-Demo

Testen Sie es mit Beispieldaten oder Ihren eigenen:

## Wie der Workflow aufgebaut ist

```
[CSV-Upload / Text-Input]
        ↓
[Eingabe validieren]
  - Leer? Zu groß? → Fehler
        ↓
[Claude API (Daten bereinigen)]
  - Tool-Use: strukturierte JSON-Ausgabe
  - Prompt definiert Bereinigungsregeln
        ↓
[Ergebnis formatieren]
  - Bereinigte Zeilen → CSV
  - Änderungsprotokoll aufbauen
        ↓
[JSON Response zurückgeben]
  - headers, cleaned_rows, changes, stats
```

Der Clou: Claude gibt das Ergebnis als strukturiertes JSON über Tool-Use zurück – nicht als Text. Das macht die Ausgabe zuverlässig parsebar, egal wie viele Sonderzeichen in den Daten stecken.

## Zeitersparnis in Zahlen

| Aufgabe | Manuell | Mit Workflow |
|---------|---------|--------------|
| 100 Kontakte bereinigen | 2–4 Stunden | ~20 Sekunden |
| 1.000 Kontakte | 1–2 Tage | ~3 Minuten |
| Duplikate finden | Halbstunde pro 100 | Automatisch |
| Telefonnummern normalisieren | 1 Min. pro Nummer | Im Batch |

Bei monatlich gepflegten Listen: **Jahresersparnis 10–30 Stunden** für eine Person.

## Anpassungsmöglichkeiten

Der Workflow ist ein Startpunkt. Häufige Erweiterungen:

- **Ziel-System direkt beschreiben** (z. B. "Exportiere nur Kontakte mit gültiger DE-Telefonnummer für HubSpot-Import")
- **Weitere Felder** hinzufügen: Adressen, Postleitzahlen, IBAN-Validierung
- **E-Mail-Versand** nach der Bereinigung (Ergebnis direkt in den Posteingang)
- **Scheduling** für regelmäßige Bereinigung eines Google Sheets

## DSGVO-Hinweis

Die Daten werden ausschließlich für die KI-Verarbeitung genutzt und danach nicht gespeichert. Der Workflow läuft auf einem selbst-gehosteten n8n-Server in Deutschland. Für den produktiven Einsatz sollten Sie Ihren eigenen API-Key hinterlegen und den Workflow auf Ihrer eigenen Instanz betreiben.

## Workflow herunterladen

Den vollständigen n8n-Workflow können Sie kostenlos herunterladen und auf Ihrer eigenen Instanz importieren:

[n8n-Workflow herunterladen (JSON)](/workflows/excel-retter.json)

Importieren: n8n → Workflows → Import from File → JSON hochladen → Credentials setzen (Anthropic API Key)

## Technischer Deep Dive

Wenn Sie die Implementierungsdetails interessieren — warum Kimi k2.5 statt Claude Tool-Use, wie RFC 4180-konformes CSV-Quoting in JavaScript funktioniert und welche Prompt-Engineering-Techniken für zuverlässige JSON-Ausgabe sorgen:

→ **[Excel-Retter: CSV-Bereinigung mit n8n und Kimi k2.5](https://leinss.xyz/de/blog/excel-retter-technik/)** *(leinss.xyz)*

---

*Interesse an einer maßgeschneiderten Lösung für Ihre spezifischen Datenprobleme? [Sprechen Sie mich an.](/de/#contact)*
