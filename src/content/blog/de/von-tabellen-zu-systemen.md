---
title: "Excel-Hölle verlassen: Kontaktlisten automatisch bereinigen mit n8n und KI"
description: "Wie Sie mit n8n und einem Sprachmodell unordentliche Kontaktlisten in Sekunden bereinigen, normalisieren und Duplikate entfernen, statt Stunden manuell zu arbeiten."
pubDate: 2026-01-22
category: automation
tags: ["tabellen", "excel", "kontakte", "datenbereinigung", "n8n", "ki"]
heroImage: "/images/blog/from-spreadsheets-to-systems.png"
draft: false
lang: de
alternateSlug: "from-spreadsheets-to-systems"
---

> **Kurz gesagt:** Um eine unordentliche Kontaktliste automatisch zu bereinigen, geben Sie die CSV an einen Workflow, der sie unter einem strengen Prompt an ein Sprachmodell schickt und strukturiertes JSON zurückliefert: bereinigte Leerzeichen, klein geschriebene E-Mails, Telefonnummern in einem Format, korrekt kapitalisierte Namen, zusammengeführte Firmennamen und entfernte Duplikate, auch Fuzzy-Matches. Aus einem Nachmittag Arbeit wird ungefähr die Zeit, die Sie brauchen, um das Änderungsprotokoll zu lesen.

Jedes Unternehmen hat sie: die Kontaktliste, die über Jahre gewachsen ist. Namen mit unterschiedlicher Schreibweise, E-Mail-Adressen in Großbuchstaben, Telefonnummern in vier verschiedenen Formaten, Firmennamen die mal "GmbH" und mal "gmbh" heißen, und irgendwo stecken doppelte Einträge drin.

Das manuelle Bereinigen kostet je nach Größe Stunden bis Tage. Und kaum ist man fertig, kommen neue Einträge rein, die alles wieder durcheinanderbringen.

## Was kostet Sie schmutzige Daten wirklich?

Die sichtbaren Probleme kennt jeder. Aber die unsichtbaren sind teurer:

- **Doppelt versendete E-Mails** schaden der Reputation bei Empfänger und E-Mail-Provider
- **Fehlgeschlagene Validierungen** weil "Max Mustermann" und "max mustermann" als zwei verschiedene Personen behandelt werden
- **Verpasste Kontakte** weil die Suche nach "Müller AG" keine Ergebnisse findet, obwohl "mueller ag" und "Müller ag" im System sind
- **DSGVO-Risiko** bei inkorrekten oder veralteten Daten

Das Ergebnis: das CRM-System, das das Problem lösen sollte, wird selbst zum Problem.

## Der Excel-Retter: Automatische Datenbereinigung mit KI

Der Workflow löst genau dieses Problem. Sie laden Ihre CSV-Daten hoch (oder fügen sie direkt ein), und n8n schickt sie an ein Sprachmodell, das:

1. **Leerzeichen** am Anfang und Ende entfernt
2. **E-Mail-Adressen** normalisiert (Kleinbuchstaben) und auf syntaktische Gültigkeit prüft
3. **Telefonnummern** in ein einheitliches Format bringt (z. B. `+49 176 12345678`)
4. **Namen** korrekt kapitalisiert
5. **Firmennamen** konsistiert (erkennt "bäckerei schmidt gmbh" und "Bäckerei Schmidt GmbH" als identisch)
6. **Duplikate** findet und entfernt: auch Fuzzy-Matches (gleiche Person, leicht unterschiedliche Schreibweise)
7. **Ungültige Felder** markiert

Am Ende gibt es eine bereinigte CSV-Datei zum Download plus eine Zusammenfassung aller vorgenommenen Änderungen.

## Live-Demo

Testen Sie es mit Beispieldaten oder Ihren eigenen. Das ist einer von mehreren [Dokumenten- & Daten-Workflows](/de/services/dokumenten-workflows/), die ich baue; weitere laufen auf der [Demo-Seite](/de/projekte/).

## Wie der Workflow aufgebaut ist

```
[CSV-Upload / Text-Input]
        ↓
[Eingabe validieren]
  - Leer? Zu groß? → Fehler
        ↓
[LLM-API (Daten bereinigen)]
  - Strenger Prompt: nur JSON-Ausgabe
  - Prompt definiert Bereinigungsregeln
        ↓
[Ergebnis formatieren]
  - Bereinigte Zeilen → CSV
  - Änderungsprotokoll aufbauen
        ↓
[JSON Response zurückgeben]
  - headers, cleaned_rows, changes, stats
```

Der Clou: Das Modell ist per System-Prompt darauf festgelegt, ein JSON-Objekt und sonst nichts zurückzugeben, und ein Code-Node parst das und scheitert laut, wenn die Form nicht stimmt. Das macht die Ausgabe brauchbar, egal wie viele Sonderzeichen in den Daten stecken. Die Demo-Instanz nutzt Kimi k2.5 im JSON-Modus; derselbe Workflow läuft gegen Claude mit Tool-Use, das die Form an der API erzwingt statt im Prompt.

## Wohin die Zeit geht

| Aufgabe | Manuell | Mit Workflow |
|---------|---------|--------------|
| Ein paar hundert Kontakte bereinigen | Ein Nachmittag Suchen und Ersetzen | Ein Lauf plus das Änderungsprotokoll lesen |
| Duplikate finden | Sortieren, schauen, wiederholen | Automatisch, auch Fast-Treffer |
| Telefonnummern normalisieren | Eine nach der anderen | Im Batch |
| Nächsten Monat wieder | Derselbe Nachmittag | Derselbe eine Lauf |

Statt Ihnen eine Stoppuhr-Zahl von meiner Maschine zu nennen: Lassen Sie die Demo über eine Stichprobe Ihrer eigenen Liste laufen. Das zeigt Ihnen das Tempo und, nützlicher, ob die angewandten Regeln die sind, die Sie wollen.

Die ehrliche Einschränkung: Fuzzy-Duplikate sind eine Ermessensfrage, und ein Modell führt gelegentlich zwei Personen mit gleichem Namen zusammen oder behält zwei Datensätze derselben Person. Lesen Sie das Änderungsprotokoll, bevor Sie das Ergebnis importieren. Diesen Schritt hat keine Zeittabelle drin.

## Anpassungsmöglichkeiten

Der Workflow ist ein Startpunkt. Häufige Erweiterungen:

- **Ziel-System direkt beschreiben** (z. B. "Exportiere nur Kontakte mit gültiger DE-Telefonnummer für HubSpot-Import")
- **Weitere Felder** hinzufügen: Adressen, Postleitzahlen, IBAN-Validierung
- **E-Mail-Versand** nach der Bereinigung (Ergebnis direkt in den Posteingang)
- **Scheduling** für regelmäßige Bereinigung eines Google Sheets

## DSGVO-Hinweis

Die Demo läuft auf meinem selbst gehosteten n8n in Deutschland, und die Zeilen, die Sie einfügen, gehen an den Modellanbieter, den sie aufruft. Daraus folgt zweierlei. Fügen Sie keine echte Kundenliste in eine öffentliche Demo ein, weder in meine noch in eine andere: nehmen Sie eine Stichprobe. Und im produktiven Aufbau hält n8n Ausführungsdaten vor, bis Sie das Pruning konfigurieren. Setzen Sie diese Regel bewusst, wenn die Daten personenbezogen sind.

## Workflow herunterladen

> **Kein Screenshot. Der echte Workflow.** Das ist die n8n-JSON: Importieren Sie sie in Ihr eigenes n8n und prüfen Sie jeden Node selbst.
>
> [n8n-Workflow herunterladen (JSON)](/workflows/excel-retter.json)

Importieren: n8n → Workflows → Import from File → JSON hochladen → Credentials setzen (API-Key des Anbieters, auf den Sie den Workflow zeigen lassen)

## Technische Details

Wenn Sie die Implementierungsdetails interessieren: welche Regeln in einen Prompt gehören und welche in Code, wie die Anfrage aufgebaut wird, und warum die Zuverlässigkeit im Parse-Schritt steckt:

→ **[Wie ich unordentliche Tabellen mit einem LLM und n8n bereinige](https://leinss.xyz/blog/de/spreadsheet-cleaning-technical/)** *(leinss.xyz)*

Zum Weiterlesen: der [Referenz-Build zum Multi-Plattform-Bestandsabgleich](/de/blog/fallstudie-ecommerce-sync/), dasselbe Problem im Maßstab von vier Systemen.

---

*Interesse an einer maßgeschneiderten Lösung für Ihre spezifischen Datenprobleme? [Sprechen Sie mich an.](https://cal.com/tobias-leinss/strategiegespraech)*
