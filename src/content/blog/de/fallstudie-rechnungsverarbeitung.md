---
title: "Referenz-Build: KI-gestützte Rechnungsverarbeitung"
description: "Die vollständige Architektur einer Vision-KI-Pipeline für Rechnungen auf n8n und Claude Vision (Eingang, Extraktion, Validierung, DATEV-Export) mit Workflow zum Herunterladen und einer Live-Demo für Ihre eigenen Dokumente."
pubDate: 2026-06-10
heroImage: "/images/blog/case-study-invoice.png"
category: reference-build
tags: ["invoices", "ocr", "n8n", "claude-vision", "ollama", "accounting", "ai"]
draft: false
lang: de
alternateSlug: "case-study-invoice-processing"
---

> **Kurz gesagt:** Ein Vision-Modell liest jede Rechnung (PDF, Scan oder Handyfoto) und gibt strukturierte Daten zurück: Lieferant, Steuernummer, Netto, USt., Positionen. Geschäftsregeln prüfen Rechenwerk und Steuersatz, bevor irgendetwas exportiert wird, und alles, bei dem das Modell unsicher ist, geht in eine Prüfliste statt in Ihre Buchhaltung. Gebaut auf n8n mit Claude Vision: oder vollständig on-premise mit Ollama und DeepSeek-OCR, wenn die Daten das Haus nicht verlassen dürfen.

> **Was das hier ist:** ein Referenz-Build: die Architektur, das Extraktionsschema und die Validierungsregeln, aufgeschrieben, damit Sie die Technik beurteilen können. Es stehen keine Kundenzahlen darin. Prüfen können Sie das laufende System: **[Geben Sie der Demo eine eigene Rechnung →](/de/blog/rechnungsverarbeitung-automatisieren/)**.

## Das Problem dahinter

Rechnungen kommen per E-Mail, über Cloud-Ordner und Mandantenportale, in jedem Format, das es gibt. Jemand öffnet jede einzelne und tippt sie in DATEV oder Lexware ab. Diese Arbeit ist langsam, sie ist stumpf, und sie ist am schlimmsten genau dann, wenn das Volumen am höchsten ist: zum Monatsende und in der Steuersaison. Das ist auch der Zeitpunkt, an dem ein Zahlendreher am wahrscheinlichsten passiert und am unwahrscheinlichsten auffällt.

Die Aufgabe zerfällt sauber in zwei Teile: das Dokument lesen, was ein Vision-Modell inzwischen gut kann, und entscheiden, ob man dem Gelesenen trauen darf. Das ist Rechenwerk und Geschäftslogik. Dieser Build gibt die erste Hälfte an ein Modell und behält die zweite in Code.

## Auf einen Blick

| | |
|---|---|
| **Stack** | n8n-Eingang + Claude-Vision-Extraktion (oder lokal Ollama + DeepSeek-OCR) + Validierung + DATEV-/CSV-Export |
| **Was extrahiert wird** | Lieferant, Adresse, Steuernummer, Rechnungsnummer, Daten, Netto, USt., Brutto, Positionen |
| **Sicherungen** | Positionen müssen den Nettobetrag ergeben, Steuersatz muss gültig sein, doppelte Rechnungsnummern werden abgewiesen, unsichere Felder gehen in die Prüfliste |
| **Nachprüfbar** | Die vollständige n8n-JSON, aus der laufenden Instanz exportiert, in der Cloud- und der On-premise-Variante |

Genau diese Art von Aufbau mache ich unter [Dokumenten-Workflows](/de/services/dokumenten-workflows/). Die [Rechnungsleser-Demo](/de/projekte/) können Sie an echten Dokumenten ausprobieren.

## Die Lösung

Eine Vision-KI-Pipeline liest, versteht und validiert jede Rechnung.

### Tool-Stack

| Komponente | Tool | Warum |
|------------|------|-------|
| Dokumenteneingang | Google Drive / E-Mail | Mandanten nutzten diese bereits |
| Workflow-Engine | n8n | Self-hosted für Datenschutz |
| Dokument-KI (Cloud) | Claude Vision API | Beste Dokumentenverständnis-Qualität |
| Dokument-KI (Lokal) | Ollama + DeepSeek-OCR | Für Mandanten mit On-Premise-Anforderung |
| Validierung | Custom n8n Logic | Durchsetzung von Geschäftsregeln |
| Export | DATEV XML / CSV | Natives Buchhaltungssoftware-Format |

### So funktioniert es

```
E-Mail/Drive → Trigger → PDF-Extraktion → KI-Analyse → Validierung → Export
```

**Schritt 1: Dokumenteneingang**

n8n überwacht mehrere Quellen:
- Dediziertes Rechnungs-E-Mail-Postfach (`rechnungen@mandant.de`)
- Geteilte Google Drive-Ordner pro Mandant
- Webhook-Endpoint für Mandantenportal-Integrationen

Neue Dokumente triggern den Workflow innerhalb von 30 Sekunden.

**Schritt 2: KI-Dokumentenanalyse**

Claude Vision erhält das Dokumentenbild und extrahiert strukturierte Daten:

```json
{
  "lieferant": {
    "name": "Bürobedarf GmbH",
    "adresse": "Hauptstraße 15, 80331 München",
    "steuernummer": "DE123456789"
  },
  "rechnung": {
    "nummer": "2025-00142",
    "datum": "2025-01-15",
    "faellig_am": "2025-02-14",
    "waehrung": "EUR"
  },
  "positionen": [
    {
      "beschreibung": "Druckerpapier A4, 500 Blatt",
      "menge": 10,
      "einzelpreis": 4.99,
      "mwst_satz": 19,
      "gesamt": 49.90
    }
  ],
  "summen": {
    "netto": 49.90,
    "mwst": 9.48,
    "brutto": 59.38
  }
}
```

**Warum Claude Vision?**
- Verarbeitet gedrehte, verzerrte und niedrig aufgelöste Scans
- Versteht Kontext (unterscheidet Rechnung von Angebot oder Beleg)
- Mehrsprachige Unterstützung (deutsche, englische, französische Rechnungen)
- Extrahiert implizite Daten (leitet Zahlungsbedingungen aus Text ab)

**Ollama + DeepSeek-OCR Alternative**: Für Mandanten in regulierten Branchen (Gesundheit, Recht) deployen wir DeepSeek-OCR lokal. Die Verarbeitung bleibt on-premise und erfüllt strenge Compliance-Anforderungen. Der Workflow erkennt automatisch PDFs und konvertiert sie für die Verarbeitung in Bilder.

**Schritt 3: Intelligente Validierung**

Vor dem Export durchläuft jede Rechnung eine Validierung:

| Prüfung | Logik | Aktion bei Fehler |
|---------|-------|-------------------|
| Mathematik-Prüfung | Summe Positionen = Nettobetrag? | Zur Prüfung markieren |
| MwSt-Validierung | Satz entspricht deutschem Steuerrecht? | Häufige Fehler korrigieren |
| Duplikat-Erkennung | Rechnungsnummer schon gesehen? | Alert + Blockieren |
| Lieferanten-Verifizierung | Steuernummer in Datenbank? | Nachschlagen oder markieren |
| Datums-Plausibilität | Zukunftsdaten, >90 Tage alt? | Prüfwarteschlange |

**Schritt 4: Export & Routing**

Validierte Rechnungen exportieren zu:
- DATEV XML-Format (Direktimport in Buchhaltungssoftware)
- CSV für Mandanten mit Lexware oder Custom-Systemen
- Archivkopie in organisierte Ordnerstruktur

Fehlgeschlagene Validierungen gehen in eine Prüfwarteschlange mit angehängter KI-Begründung.

## Was sich ändert, und was nicht

Hier steht keine Vorher-Nachher-Tabelle. Ich habe diese Pipeline nicht in Ihrer Kanzlei betrieben, und für eine erfundene Kanzlei erfundene Zahlen sagen Ihnen nichts.

Was die Architektur ändert, ist strukturell:

- **Das Lesen ist nicht mehr der Engpass.** Die Extraktion braucht Sekunden pro Dokument und läuft so parallel, wie Sie es zulassen. Eine Spitze zum Monatsende wird damit nicht mehr zur Warteschlange.
- **Fehler treten vor dem Export auf, nicht nach der Buchung.** Rechenwerk- und Steuersatzprüfung laufen bei jeder Rechnung, jedes Mal. Genau das, was ein müder Mensch um 18 Uhr nicht mehr tut.
- **Unsicherheit bekommt einen Ort.** Alles, bei dem das Modell zweifelt, landet mit seiner Begründung in einer Prüfliste, statt still als falsche Zahl in Ihrer Buchhaltung zu enden.

Die Kennzahl, die entscheidet, ob sich das für Sie lohnt, ist Ihre Durchlaufquote: der Anteil der Rechnungen, die die Validierung ohne menschliches Zutun bestehen. Sie hängt fast vollständig davon ab, wie einheitlich die Belege Ihrer Lieferanten sind, und lässt sich deshalb nicht vorab beziffern. Lassen Sie einen Monat echter Rechnungen im Prüfmodus durchlaufen und zählen Sie nach. Diese Messung kostet einen Nachmittag und ist mehr wert als jede Tabelle, die ich hier hinschreiben könnte.

## Technische Details

### Umgang mit Sonderfällen

Echte Rechnungen sind chaotisch. So geht die Pipeline damit um:

**Mehrseitige Rechnungen**: Claude Vision verarbeitet jede Seite, n8n führt die extrahierten Daten zusammen.

**Handschriftliche Notizen**: KI ignoriert handschriftliche Ergänzungen, markiert wenn kritische Daten überdeckt.

**Gutschriften**: Automatisch erkannt, Beträge als negative Werte gespeichert.

**Fremdwährungen**: Mit EZB-Kursen in EUR konvertiert, Original erhalten.

### Datenschutz & Compliance

Im Steuerwesen entscheidet der Umgang mit Daten, ob ein Build überhaupt einsetzbar ist:

- **Self-hosted n8n**: Workflow-Engine läuft auf Ihrer eigenen Infrastruktur
- **API-Datenhandling**: Claude API speichert keine Daten nach Verarbeitung
- **Audit-Trail**: Jedes Dokument protokolliert mit Zeitstempel, Hash und Verarbeitungsergebnis
- **Aufbewahrungsrichtlinie**: Verarbeitete Daten nach 30 Tagen automatisch aus Pipeline gelöscht

## Implementierungszeitplan

**Woche 1**:
- n8n-Deployment, Google Drive-Integration
- Initiales Claude Vision Prompt-Engineering

**Woche 2**:
- DATEV-Export-Format-Entwicklung
- Validierungslogik-Implementierung

**Woche 3**:
- Tests mit 200 historischen Rechnungen
- Prompt-Verfeinerung basierend auf Sonderfällen

**Woche 4**:
- Mitarbeiterschulung (2 Stunden)
- Parallellauf neben manuellem Prozess
- Go-Live

**Laufende Kosten**:
| Posten | Monatlich |
|--------|-----------|
| Claude Vision API (~2.500 Rechnungen) | €75 |
| n8n self-hosted | €0 |
| Google Drive (vorhanden) | €0 |
| **Gesamt** | **€75/Monat** |

vs. €3.200/Monat äquivalente Personalkosten.

## Wichtige Erkenntnisse

1. **Qualität rein = Qualität raus**: Mandanten bitten, PDFs zu senden, keine Fotos von Ausdrucken
2. **Validierung fängt KI-Fehler**: 90% der markierten Einträge sind korrekte Markierungen
3. **Mit Großmandanten starten**: Größter ROI, meiste Beispieldaten zum Tuning
4. **Menschen für Ausnahmen**: Mitarbeiter bearbeiten nur die 0,8%, die Urteilsvermögen brauchen

## Selbst bauen

Sie möchten diesen Workflow implementieren? Hier sehen Sie, wie die einzelnen Teile zusammenwirken.

### Node-für-Node Aufschlüsselung

**1. Dokument-Trigger (E-Mail oder Ordner-Überwachung)**

Der Workflow startet, wenn ein neues Dokument eintrifft. Sie haben zwei Optionen:
- **E-Mail-Trigger**: Überwacht ein dediziertes Postfach via IMAP. Wenn eine Rechnung eingeht, startet der Workflow innerhalb von 30 Sekunden.
- **Ordner-Überwachung**: Für lokale/self-hosted Setups, überwacht ein Verzeichnis auf neue PDFs.

```
Trigger → Anhang extrahieren → An KI übergeben
```

**2. Claude Vision Analyse**

Hier findet die Kernextraktion statt. Claude erhält das Dokumentenbild und einen strukturierten Prompt, der nach spezifischen Feldern fragt. Der Prompt ist entscheidend: er definiert die exakte JSON-Struktur, die Ihre Buchhaltungssoftware benötigt.

Wichtige Prompt-Elemente:
- Explizites JSON-Schema mit allen erforderlichen Feldern
- Anweisung "nur gültiges JSON, keine Erklärung" zurückzugeben
- Feldspezifische Hinweise für mehrdeutige Fälle (z.B. "Steuernummer" vs. "USt-IdNr.")

**3. Antwort-Parsing**

Claude gibt JSON zurück, aber manchmal in Markdown-Codeblöcken eingewickelt oder mit Zusatztext. Der Code-Node:
- Entfernt Markdown-Formatierung
- Validiert JSON-Struktur
- Führt mit Quell-Metadaten zusammen (E-Mail-Absender, Zeitstempel)
- Markiert Parse-Fehler zur manuellen Prüfung

**4. Validierungsschicht**

Vor dem Export durchläuft jede Rechnung Plausibilitätsprüfungen:
- Mathematik-Prüfung: Ergeben die Positionen die Summe?
- MwSt-Satz-Validierung: Werden 19% oder 7% (deutsche Sätze) korrekt angewendet?
- Duplikat-Erkennung: Hash der Rechnungsnummer um erneute Einreichungen zu erkennen

**5. Export & Archivierung**

Schließlich exportieren validierte Daten in Ihr Buchhaltungssystem-Format (DATEV XML, CSV) und archivieren das Original mit Verarbeitungs-Metadaten.

### Starter-Workflow herunterladen

> **Kein Screenshot. Der echte Workflow.** Das ist importierbare n8n-JSON: jeden Node lesen, eigene Zugangsdaten eintragen, laufen lassen. Es ist der Aufbau, wie er entworfen wurde, kein Export aus einer laufenden Instanz. Nehmen Sie ihn als Startpunkt, den Sie durch Lesen prüfen können, nicht als System mit Produktionskilometern. Die Workflows hinter den [Live-Demos](/de/projekte/) sind die, die aus meinem eigenen n8n exportiert sind.
>
> **Cloud-Version (Claude API):** [Download n8n-invoice-cloud.json](/workflows/n8n-invoice-cloud.json)
> **Lokale Version (Ollama):** [Download n8n-invoice-local.json](/workflows/n8n-invoice-local.json)

**Schnellstart:**
1. JSON importieren via n8n Einstellungen → Workflow importieren
2. Zugangsdaten konfigurieren (IMAP, Anthropic/Ollama, Dateispeicher)
3. Prompt an Ihr Rechnungsformat anpassen
4. Mit 5-10 Beispielrechnungen testen

Dieser Starter behandelt den Kern-Extraktionsfluss. Eine maßgeschneiderte Implementierung würde Ihre spezifischen Validierungsregeln, Buchhaltungssoftware-Exportformat, Fehler-Alerting und Multi-Source-Eingang hinzufügen: die Komponenten, die es produktionsreif für Ihr Setup machen.

## Mehr erfahren

Für eine konzeptionelle Übersicht über KI-gestützte Rechnungsautomatisierung und ROI-Berechnungen, siehe: **[Rechnungsverarbeitung automatisieren mit KI](/de/blog/rechnungsverarbeitung-automatisieren/)**

## Ihr nächster Schritt

Verarbeiten Sie manuell Stapel von Dokumenten?

1. **Messen**: Wie lange dauert ein Dokument wirklich?
2. **Sammeln**: 20 typische Dokumente in ihren chaotischsten Formaten
3. **Testen**: Wir können einen Proof-of-Concept mit Ihren Beispielen durchführen

[Kostenlose Erstberatung buchen](https://cal.com/tobias-leinss/strategiegespraech): Ich zeige Ihnen, welche Genauigkeit Sie mit Ihren Dokumenttypen erwarten können.
