---
title: "Referenz-Build: Multi-Plattform Inventar-Sync für Retail"
description: "Die vollständige Architektur eines zentralen Bestands-Hubs, der Shopify, WooCommerce, Amazon und eBay im Gleichtakt hält: eine Quelle der Wahrheit, Echtzeit-Webhooks und der Workflow zum Herunterladen und Nachprüfen."
pubDate: 2026-06-28
heroImage: "/images/blog/case-study-ecommerce.png"
category: reference-build
tags: ["e-commerce", "inventory", "n8n", "shopify", "woocommerce", "amazon", "ai", "claude", "ollama"]
draft: false
lang: de
alternateSlug: "case-study-ecommerce-sync"
---

> **Kurz gesagt:** Ein System hält den echten Bestand, alle Verkaufskanäle lesen daraus. Ein Verkauf auf irgendeiner Plattform löst einen Webhook aus, der Hub zieht den zentralen Bestand ab und schiebt den neuen Wert binnen Sekunden an die übrigen drei. Produktinhalte werden einmal geschrieben und pro Marktplatz angepasst. Gebaut auf n8n mit Airtable als Quelle der Wahrheit.

> **Was das hier ist:** ein Referenz-Build. Die Architektur, die Konfliktauflösung und das Verhalten im Fehlerfall, aufgeschrieben, damit Sie die Technik beurteilen können. Es stehen keine Kundenzahlen darin. Prüfen können Sie das laufende System: **[Demos ausprobieren →](/de/projekte/)**.

## Das Problem dahinter

Wer über Shopify, WooCommerce, Amazon und eBay verkauft, hat vier Systeme, die alle glauben, den Bestand zu kennen, und keines spricht mit den anderen. Synchronisiert wird, wenn jemand daran denkt, also lebt die Wahrheit in einer Tabelle, die bereits veraltet ist. Das Ergebnis: Überverkäufe, am schlimmsten an den Tagen, die am meisten zählen, und eine Produktbeschreibung, die über vier Listings hinweg still auseinandergedriftet ist.

Die Lösung ist nicht schnelleres Synchronisieren. Sie ist die Entscheidung, dass genau ein System die Wahrheit hält und alle anderen daraus lesen. Alles Weitere folgt aus dieser einen Entscheidung, auch die unangenehmen Teile: was passiert, wenn zwei Plattformen im selben Moment das letzte Stück verkaufen, und was passiert, wenn eine Marktplatz-API gerade nicht erreichbar ist.

## Auf einen Blick

| | |
|---|---|
| **Stack** | Zentraler n8n-Hub + Airtable als Single Source of Truth + Echtzeit-Webhooks + KI-Listing-Content |
| **Sync-Richtung** | Plattformen melden Verkäufe hinein, der Hub schiebt den verbindlichen Bestand hinaus |
| **Sicherungen** | Optimistisches Sperren auf dem zentralen Bestand, Retry-Queue pro Plattform, Pufferbestand in Spitzenzeiten, Abgleichlauf |
| **Nachprüfbar** | Die vollständige n8n-JSON, aus der laufenden Instanz exportiert |

Genau diese Art von Aufbau mache ich unter [Integrationen & APIs](/de/services/integrationen-apis/): Tools so verbinden, dass Daten von selbst fließen. Die [Live-Demos](/de/projekte/) zeigen funktionierende Beispiele.

## Die Lösung

Ein zentraler Inventar-Hub mit Echtzeit-Sync und KI-gestütztem Produktmanagement.

### Tool-Stack

| Komponente | Tool | Warum |
|------------|------|-------|
| Zentraler Hub | Airtable / Notion | Flexibel, API-freundlich, visuell |
| Workflow-Engine | n8n | Echtzeit-Webhooks, self-hosted |
| Shopify-Sync | n8n + Shopify API | Native Integration |
| WooCommerce-Sync | n8n + WooCommerce API | REST API |
| Amazon-Sync | n8n + Amazon SP-API | Marktplatz-Integration |
| KI-Produktassistent | Claude API | Kategorisierung, Beschreibungen |
| KI Lokal | Ollama | Anomalie-Erkennung, Kosteneinsparung |

### Architekturübersicht

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Shopify   │◄───►│             │◄───►│ WooCommerce │
└─────────────┘     │   Zentraler │     └─────────────┘
                    │   n8n Hub   │
┌─────────────┐     │             │     ┌─────────────┐
│   Amazon    │◄───►│             │◄───►│    eBay     │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    │  Airtable │
                    │  (Quelle) │
                    └───────────┘
```

### Kernfunktionen

#### 1. Echtzeit-Inventar-Sync

**So funktioniert es**:
- Jede Plattform sendet Webhooks bei Bestellungen/Inventaränderungen
- n8n empfängt Event, aktualisiert zentrales Airtable
- Änderung propagiert zu allen anderen Plattformen innerhalb 60 Sekunden

**Verarbeitete Webhook-Events**:
- Bestellung aufgegeben → Bestand auf allen Plattformen reduzieren
- Bestellung storniert → Bestand erhöhen
- Manuelle Anpassung → Zu allen Plattformen synchronisieren
- Erstattung verarbeitet → Einlagern wenn zutreffend

**Konfliktlösung**:
Wenn zwei Bestellungen gleichzeitig für den letzten Artikel eingehen:
1. Erster Webhook gewinnt (atomares Update in Airtable)
2. Zweite Bestellung triggert Bestandsalarm
3. Mensch entscheidet: aus alternativer Quelle erfüllen oder stornieren

#### 2. KI-gestützte Produktkategorisierung

Neue Produkte brauchen korrekte Kategorisierung für jeden Marktplatz. KI erledigt das automatisch.

**Input** (von Lieferantendaten):
```
Produkt: "Ergonomische Wireless Maus, 2,4GHz, Silent Click, Schwarz"
EAN: 1234567890123
Marke: TechFlow
```

**KI-Output**:
```json
{
  "amazon_category": "Elektronik > Computer > Mäuse",
  "amazon_keywords": ["kabellose maus", "ergonomische maus", "leise maus"],
  "shopify_type": "Computer-Zubehör",
  "shopify_tags": ["wireless", "ergonomisch", "maus", "büro"],
  "ebay_category_id": 23160,
  "attributes": {
    "konnektivitaet": "2,4GHz Wireless",
    "farbe": "Schwarz",
    "feature": "Silent Click"
  }
}
```

Die KI mappt Produkte automatisch zur Taxonomie jeder Plattform.

#### 3. Bestands-Anomalie-Erkennung

Ollama läuft lokal zur Erkennung von Inventar-Anomalien:

**Überwachte Muster**:
- Plötzliche große Bestandsreduzierungen (Diebstahl? Großbestellung?)
- Bestandszählung passt nicht zur Verkaufsgeschwindigkeit
- Plattform-Zählungen weichen vom zentralen Hub ab
- Ungewöhnliche Retourenmuster

**Alert-Beispiel**:
```
⚠️ Anomalie erkannt
Produkt: SKU-1234 (Wireless Maus Schwarz)
Problem: Shopify zeigt 45 Einheiten, zentraler Hub zeigt 23
Aktion: Manuelle Bestandsprüfung erforderlich
Mögliche Ursache: Nicht erfasste Lieferung oder Sync-Fehler
```

#### 4. KI-Beschreibungsgenerierung

Marktplatzspezifische Listings erstellen dauerte früher 30 Minuten. Jetzt:

**Input**: Basis-Produktinfo + ein Foto

**KI generiert**:
- Amazon-Listing (Bullet Points, A+-Content-ready)
- Shopify-Beschreibung (Markenstimme, SEO-optimiert)
- eBay-Listing (marktplatzspezifische Keywords)
- Übersetzungen (Deutsch, Englisch, Französisch)

**Vorher → nachher**:

*Input*:
```
Maus, wireless, ergonomisch, schwarz, leise Klicks
```

*Shopify-Output*:
```
Arbeiten Sie komfortabel mit der TechFlow Ergonomischen Wireless Maus.
Entwickelt für den ganztägigen Einsatz, mit Silent-Click-Technologie
die Ihre Kollegen nicht stört. Die 2,4GHz Wireless-Verbindung bietet
zuverlässige, verzögerungsfreie Performance bis zu 10m.

✓ Ergonomisches Design reduziert Handgelenkbelastung
✓ Leise Schalter für ruhigen Betrieb
✓ 12 Monate Batterielaufzeit
✓ Plug & Play USB-Empfänger
```

*Amazon-Output*:
```
• ERGONOMISCHER KOMFORT: Wissenschaftlich entwickelte Form unterstützt
  natürliche Handposition, reduziert Ermüdung bei längerem Einsatz
• SILENT-CLICK-TECHNOLOGIE: Geräuschreduzierte Schalter perfekt
  für Büro, Bibliothek oder geteilte Arbeitsplätze
• ZUVERLÄSSIGES 2,4GHz WIRELESS: Starke Verbindung bis zu 10m,
  keine Störungen durch andere Geräte
...
```

### Implementierungs-Highlights

#### Shopify Webhook Setup

```javascript
// n8n webhook node Konfiguration
{
  "topic": "orders/create",
  "address": "https://n8n.yourdomain.com/webhook/shopify-orders",
  "format": "json"
}
```

Wenn eine Bestellung eingeht:
1. Line Items und Mengen extrahieren
2. Airtable-Bestandszählungen aktualisieren
3. Sync zu WooCommerce, Amazon, eBay triggern
4. Transaktion für Audit Trail protokollieren

#### Amazon SP-API Integration

Amazon erfordert OAuth und signierte Requests. n8n handhabt:
- Token-Refresh (automatisch)
- Request-Signierung
- Rate Limiting (Drosselung um 429s zu vermeiden)
- Feed-Submission für Bulk-Updates

#### Umgang mit Plattform-Verzögerungen

Nicht alle Plattformen aktualisieren sofort:
- Shopify: Echtzeit-Webhooks ✓
- WooCommerce: Echtzeit-Webhooks ✓
- Amazon: Feeds alle 15 Min verarbeitet
- eBay: API-Calls, nahezu Echtzeit

Für Amazons Verzögerung halten wir einen "pending"-Status:
- Sofort Bestand als "reserviert" im zentralen Hub markieren
- Bestätigen wenn Amazon-Feed abgeschlossen
- Alert wenn Feed fehlschlägt

## Was sich ändert, und was nicht

Hier steht keine Vorher-Nachher-Tabelle. Ich habe diesen Hub nicht auf Ihrem Sortiment betrieben, und für einen erfundenen Händler erfundene Zahlen sagen Ihnen nichts.

Was die Architektur ändert, ist strukturell:

- **Es gibt genau einen Bestandswert.** Vier Systeme haben nicht länger je eine eigene Meinung, und Drift wird durch den Aufbau unmöglich statt durch Disziplin.
- **Der Sync wartet nicht mehr auf einen Menschen.** Ein Verkauf läuft per Webhook in Sekunden durch, das Risikofenster schrumpft von einem Tag auf die Dauer eines API-Aufrufs.
- **Ein neuer Kanal ist ein Konnektor, kein Umbau.** Ein fünfter Marktplatz heißt: dem Hub einen weiteren Ausgang beibringen, nicht eine weitere Tabellenspalte pflegen.

Was der Hub nicht leistet: Überverkäufe unmöglich machen. Zwei Plattformen können weiterhin im selben Moment das letzte Stück verkaufen, und eine Marktplatz-API kann weiterhin ausfallen, wenn Sie sie brauchen. Genau dafür sind Pufferstrategie und Retry-Queue weiter unten da: sie verkleinern das Fenster, sie schließen es nicht. Wer Ihnen null Überverkäufe verspricht, hat noch keinen Sync-Hub am Black Friday betrieben.

Die Zahl, die zu messen lohnt, ist Ihre aktuelle Abweichungsquote: Messen Sie an einem beliebigen Dienstag, wie weit die Tabelle von der Realität entfernt ist, und dann noch einmal an Ihrem stärksten Tag. Der Abstand zwischen beiden ist die Größe des Problems, für das Sie hier eine Lösung kaufen.

## Technische Details

### Bestandspuffer-Strategie

Um Überverkäufe während Sync-Verzögerungen zu verhindern:
- Plattform-Bestand = zentraler Bestand - Puffer
- Puffer variiert nach Verkaufsgeschwindigkeit: schnelle Seller bekommen größeren Puffer
- Wöchentlich automatisch angepasst basierend auf Verkaufsmustern

### Mehrsprachiger Produktcontent

Für deutsche und französische Märkte:
1. KI generiert Basis-Beschreibung auf Englisch
2. Claude übersetzt mit marktplatzspezifischer Terminologie
3. Manuelle Prüfung für Top 20% Seller, Rest auto-veröffentlichen

### Monitoring-Dashboard

Echtzeit-Sichtbarkeit in Airtable:
- Bestandslevels über alle Plattformen
- Sync-Status (letztes Update, Fehler)
- Anomalie-Alerts
- Verkaufsgeschwindigkeit pro Kanal

## Kosten

| Posten | Monatlich |
|--------|-----------|
| Airtable Pro | €20 |
| n8n self-hosted | €0 |
| Claude API (Beschreibungen, Kategorisierung) | €45 |
| Ollama (Anomalie-Erkennung) | €0 |
| **Gesamt** | **€65/Monat** |

vs. 15 Stunden/Woche manuelle Arbeit = €1.500/Monat Äquivalent.

## Wichtige Erkenntnisse

1. **Webhooks > Polling**: Echtzeit-Sync verhindert die meisten Überverkäufe
2. **Single Source of Truth**: Airtable ist autoritativ, Plattformen sind Spiegel
3. **Puffer für langsame Plattformen**: Amazons 15-Min-Verzögerung muss berücksichtigt werden
4. **KI für Mühsames, nicht Kritisches**: KI für Beschreibungen nutzen, nicht für Bestandszählungen

## Selbst bauen

So bauen Sie einen Multi-Plattform-Inventar-Sync von Grund auf.

### Node-für-Node Aufschlüsselung

**1. Universeller Webhook-Eingang**

Ein einzelner Webhook-Endpoint empfängt Events von allen Plattformen. Der erste Schritt normalisiert verschiedene Payload-Formate:

```javascript
// Plattform aus Payload-Struktur erkennen
if (body.topic?.includes('shopify')) platform = 'shopify';
else if (body.source === 'woocommerce') platform = 'woocommerce';
else if (body.NotificationType) platform = 'amazon';
```

Ausgabe: Konsistentes `{ sku, quantity_change, new_quantity, source }` unabhängig vom Ursprung.

**2. Zentraler Hub-Lookup (Airtable)**

Ihre zentrale Inventardatenbank nach SKU abfragen. Airtable (oder Notion) dient als Single Source of Truth:
- Aktueller Bestandslevel
- Plattform-spezifische IDs (Shopify Variant ID, WooCommerce Produkt-ID, Amazon ASIN)
- Letzter Sync-Zeitstempel
- Puffermengen pro Plattform

**3. Bestandsberechnung**

Zwei Update-Typen behandeln:
- **Absolut**: "Setze Bestand auf 50" → new_quantity = 50
- **Relativ**: "Bestellung aufgegeben, -1" → new_quantity = aktuell - 1

Immer nicht-negative Werte erzwingen. Delta für Audit Trails loggen.

**4. Zentralen Hub aktualisieren**

Neuen Bestandslevel zurück nach Airtable schreiben mit:
- Aktualisierter Menge
- Zeitstempel
- Quell-Plattform (um Echo-Loops zu verhindern)

**5. Plattform-Distribution (Split → Switch)**

Für jede Plattform, die aktualisiert werden muss (alle außer Quelle):
- **Shopify**: GraphQL API oder REST `/variants/{id}/inventory_levels`
- **WooCommerce**: REST API `PUT /products/{id}`
- **Amazon**: SP-API Inventar-Feed (Batch, 15-Min Verarbeitung)

Plattform-spezifische Eigenheiten behandeln:
- Shopify braucht location_id für Multi-Location-Inventar
- Amazon erfordert XML-Feed-Format und Polling zur Bestätigung
- WooCommerce Bestandsverwaltung muss pro Produkt aktiviert sein

**6. Bestätigung & Alerting**

Nach erfolgreichem Sync:
- Slack-Benachrichtigung mit SKU, neuem Level, aktualisierten Plattformen
- Webhook-Antwort bestätigt Abschluss
- Logging für Sync-Issue-Debugging

### KI-gestützte Kategorisierung (Optionaler Node)

Beim Anlegen neuer Produkte kann Claude auto-kategorisieren:
- Amazon Kategoriepfad und Keywords
- Shopify Produkttyp und Tags
- Attribut-Extraktion aus Produktnamen

Dieser Node ist im Starter standardmäßig deaktiviert, für Neuprodukt-Workflows aktivieren.

### Starter-Workflow herunterladen

> **Kein Screenshot. Der echte Workflow.** Das ist importierbare n8n-JSON: jeden Node lesen, eigene Zugangsdaten eintragen, laufen lassen. Es ist der Aufbau, wie er entworfen wurde, kein Export aus einer laufenden Instanz. Nehmen Sie ihn als Startpunkt, den Sie durch Lesen prüfen können, nicht als System mit Produktionskilometern. Die Workflows hinter den [Live-Demos](/de/projekte/) sind die, die aus meinem eigenen n8n exportiert sind.
>
> [Download n8n-ecommerce-sync.json](/workflows/n8n-ecommerce-sync.json)

**Schnellstart:**
1. JSON importieren via n8n Einstellungen → Workflow importieren
2. Zugangsdaten konfigurieren (Airtable, Shopify, WooCommerce, Slack)
3. Airtable-Base einrichten mit: SKU, stock, shopify_id, wc_id, amazon_asin
4. Webhooks in jeder Plattform auf Ihren n8n-Endpoint konfigurieren
5. Mit manuellen Bestandsanpassungen testen

Dieser Starter behandelt die Kern-Sync-Schleife. Ein Produktionssystem würde Bestandspuffer für langsame Plattformen, Konfliktlösung für simultane Bestellungen, Anomalie-Erkennung (Ollama), Multi-Location-Support und Retry-Logik für API-Fehler hinzufügen: die Resilienz-Schicht, die Black-Friday-Traffic aushält ohne ins Schwitzen zu kommen.

## Ihr nächster Schritt

Verkaufen Sie über mehrere Plattformen?

1. **Das Chaos erfassen**: Welche Plattformen? Was ist die aktuelle Sync-Methode?
2. **Schmerzpunkte finden**: Überverkäufe, Listing-Zeit, Abweichungen?
3. **Mit Sync starten**: Zuerst Inventar fixen, dann KI-Features hinzufügen.

Wenn Systeme ständig auseinanderlaufen, ist das [Integrationen & APIs](/de/services/integrationen-apis/)-Arbeit.

[Kostenloses Strategiegespräch buchen](https://cal.com/tobias-leinss/strategiegespraech), Ich bewerte Ihr Multi-Plattform-Setup und empfehle eine Sync-Strategie.
