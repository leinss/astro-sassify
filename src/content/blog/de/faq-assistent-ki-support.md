---
title: "24/7 KI-Support ohne Nachtschicht: FAQ-Assistent für Ihr Unternehmen"
description: "Wie Sie mit n8n, OpenAI-Embeddings und Claude wiederkehrende Support-Anfragen automatisieren, und sich auf die Fragen konzentrieren, die wirklich Ihre Zeit brauchen."
pubDate: 2026-05-14
category: automation
tags: ["faq", "support", "ki", "rag", "n8n", "vektordatenbank"]
heroImage: "/images/blog/faq-automation.png"
draft: false
lang: de
alternateSlug: "faq-automation-ai-support"
---

> **Kurz gesagt:** Ein KI-FAQ-Assistent beantwortet wiederkehrende Support-Fragen automatisch per RAG: Er durchsucht Ihre Wissensbasis nach den passendsten Einträgen und lässt ein Modell eine Antwort formulieren, die nur auf diesen Quellen basiert. Passt nichts gut genug, leitet er an einen Menschen weiter, statt zu raten. So wird der vorhersehbare Teil Ihres Postfachs abgedeckt, rund um die Uhr.

Öffnungszeiten. Preise. Wie lange dauert die Lieferung? Was passiert nach der Anfrage? Für Ihre Kunden sind das wichtige Fragen. Für Sie sind es die gleichen vier Sätze, die Sie diese Woche zum zwanzigsten Mal tippen.

Das Support-Postfach ist kein Einzelfall. Es ist ein Muster, und Muster lassen sich automatisieren.

## Das Problem mit wiederkehrenden Fragen

Wer Support-Anfragen manuell beantwortet, steht vor einem Zielkonflikt: Schnelle Antworten erfordern Zeit, die an anderer Stelle fehlt. Wartezeiten dagegen frustrieren Kunden, selbst wenn die Antwort am Ende einfach ist.

Das Tragische daran: Die meisten dieser Fragen sind vorhersehbar. Bevor Sie etwas bauen, sortieren Sie zwei Wochen Ihres eigenen Postfachs nach Themen. Dann sehen Sie die Form: eine Handvoll Fragen deckt den Großteil des Volumens ab, und ein langer Schwanz braucht wirklich Sie. Diese Zählung ist zugleich der Business Case, und zwar Ihrer statt einer Zahl von einem fremden Support-Desk.

Genau hier setzt der **FAQ-Assistent** an. Er ist Teil meiner Arbeit rund um [Kommunikationsautomatisierung](/de/services/kommunikationsautomatisierung/), und Sie können ihn unten in der Demo oder auf der [Demo-Seite](/de/projekte/) live testen.

## Was ist RAG, und warum ist das wichtig?

Hinter dem FAQ-Assistenten steckt eine Technik namens RAG: Retrieval-Augmented Generation. In drei Sätzen erklärt:

Statt einer KI alles Wissen einzuprogrammieren, gibt man ihr eine durchsuchbare Wissensbasis. Kommt eine Frage rein, sucht die KI zuerst nach den passendsten Einträgen, und antwortet dann auf Basis dieser Quellen. Das Ergebnis ist präziser und bleibt aktuell, weil nur die Wissensbasis gepflegt werden muss, nicht das Modell.

Es ist der Unterschied zwischen einem Mitarbeiter, der alles auswendig weiß, und einem, der gezielt nachschlägt, und dabei zuverlässiger ist.

## Wie der Workflow funktioniert

Der Prozess läuft in vier Schritten ab:

```
Kunde stellt Frage
    │
    ▼
Wissensbasis nach den
passendsten Einträgen durchsuchen
    │
    ▼
Das Modell formuliert die Antwort
nur auf Basis der gefundenen Quellen
    │
    ├── Gute Treffer ──→ Antwort direkt senden
    │
    └── Kein Treffer ──→ Weiterleitung an Mensch
```

**Wie diese Suche arbeitet, ist eine Entscheidung, die man verstehen sollte, weil sie meist einfach vorausgesetzt wird.** Der Lehrbuchweg sind Embeddings: Jede Frage und jeder Wissenseintrag wird zu einem Zahlenvektor, ähnliche Bedeutungen ergeben ähnliche Zahlen, und das System erkennt „Wann habt ihr auf?" und „Öffnungszeiten am Wochenende?" als dieselbe Frage. Genau das macht der Workflow zum Herunterladen, und für einen großen oder mehrsprachigen Bestand ist es der richtige Standard.

Der Assistent auf dieser Seite macht es einfacher: Postgres-Volltextsuche über dieselben Einträge, ganz ohne Embedding-Aufruf. Bei einer Wissensbasis dieser Größe liefert sie dieselben Passagen, kostet pro Frage nichts und nimmt eine API-Abhängigkeit aus dem Antwortpfad. Beides ist RAG. Das Belegen kommt daher, dass das Modell nur sieht, was die Suche geliefert hat, nicht von Vektoren im Besonderen.

Fangen Sie mit Volltextsuche an. Wechseln Sie zu Embeddings, wenn Sie zeigen können, dass Fragen durchrutschen: eine Messung, keine Annahme.

## Sicherheit durch Confidence Scoring

Nicht jede Frage ist eindeutig. Was passiert, wenn die KI unsicher ist?

Der Assistent bewertet bei jeder Antwort, wie gut die gefundenen Wissenseinträge zur Frage passen. Klärt nichts die Schwelle, wird die Anfrage nicht automatisch beantwortet: sondern weitergeleitet: an einen Menschen, ein Ticketsystem oder eine definierte Fallback-Adresse.

Ob ein Assistent vertrauenswürdig ist, entscheidet sich an der Frage, die Ihr Bestand nicht beantworten kann. Schlecht gebaut liefert sie eine leere Antwort oder, schlimmer, eine selbstsichere Erfindung. In diesem Aufbau ist „die Suche findet nichts" ein echter Zweig: Das Modell bekommt keinen Kontext, sagt das und verweist auf einen Menschen. Testen Sie diesen Pfad zuerst, vor dem schönen. Fragen Sie etwas, von dem Sie wissen, dass es nicht in der Wissensbasis steht, und schauen Sie, was zurückkommt.

## Demo: Testen Sie den FAQ-Assistenten

<!-- DEMO_WIDGET_PLACEHOLDER -->

## Was das in der Praxis bedeutet

Ein Blick auf konkrete Zeitersparnisse:

| Aufgabe | Manuell | Mit FAQ-Assistent |
|---------|---------|-------------------|
| Preis-Anfrage beantworten | Minuten, sobald Sie dazu kommen | Sekunden |
| Onboarding-Fragen klären | Minuten, plus der Kontextwechsel | Sekunden |
| Wiederkehrende Support-Fragen | Täglich | Automatisch |
| Reaktionszeit | Geschäftszeiten | 24/7 |

Die Ersparnis ist Ihre eigene Anzahl mal Ihrer eigenen Bearbeitungszeit. 25 wiederkehrende Anfragen pro Woche zu je fünf Minuten sind rund zwei Stunden die Woche, also etwa hundert Stunden im Jahr, für Fragen, deren Antwort sich seit Monaten nicht geändert hat. Rechnen Sie das mit der Zählung von oben, nicht mit meinem Beispiel.

Was in keiner Tabelle steht: außerhalb der Geschäftszeiten. Eine Frage, die sonntags um 23 Uhr beantwortet wird, ist keine Zeitersparnis, sondern eine Antwort, auf die der Kunde sonst zwei Tage gewartet hätte.

## DSGVO: Was mit den Daten passiert

Support-Anfragen können sensible Informationen enthalten. Deshalb ist Transparenz kein Bonus, sondern Pflicht:

- **Wo die Wissensbasis liegt**: Auf der Demo-Instanz ist es eine Postgres-Datenbank auf meiner eigenen Hardware in Deutschland. In einem Aufbau für Sie liegt sie, wo Sie es entscheiden, und Postgres heißt, Sie können sie mitnehmen.
- **Wohin die Frage geht**: An das Modell, das der Workflow aufruft. Die Demo auf dieser Seite schickt sie an Kimi (Moonshot), der Workflow zum Herunterladen ist auf Claude (Anthropic) verdrahtet, ein selbst gehostetes Modell schickt sie nirgendwohin. Sind die Fragen Ihrer Kunden sensibel, ist diese Wahl die ganze DSGVO-Diskussion: treffen Sie sie vor dem Bau, nicht danach.
- **Aufbewahrung ist eine Einstellung**: n8n hält Ausführungsdaten vor, bis Sie es abstellen. Konfigurieren Sie das Pruning, statt anzunehmen, eine Frage verschwinde mit dem Absenden der Antwort.
- **Verträge**: Holen Sie sich für den gewählten Anbieter den Auftragsverarbeitungsvertrag und lesen Sie, was er zum Training mit Ihren Eingaben sagt. Verlassen Sie sich nicht auf einen Blogartikel, auch nicht auf diesen.
- **Volle Kontrolle über die Wissensbasis**: Sie pflegen, was der Assistent weiß. Kein Black-Box-Verhalten: Sie sehen jeden Eintrag und können ihn jederzeit ändern oder entfernen.

## Was sich anpassen lässt

Der FAQ-Assistent ist kein Fertigprodukt, er passt sich Ihrem Betrieb an:

- **Eigene Wissensbasis**: Ob FAQ-Dokument, Notion-Seite oder bestehende Hilfetexte, der Ingestion-Workflow verarbeitet alle gängigen Formate.
- **Kanalwahl**: Integration in ein Chat-Widget auf Ihrer Website, in E-Mail-Postfächer oder in Slack: je nachdem, wo Ihre Kunden schreiben.
- **Eskalation**: Niedrig-sicherige Anfragen landen direkt in Ihrem Ticketsystem (Freshdesk, Linear, Jira, was auch immer Sie nutzen).
- **Ton und Stil**: Ein kurzes Prompt-Dokument reicht, damit die KI Ihren Schreibstil trifft.

## Die Workflows herunterladen

> **Keine Screenshots. Die echten Workflows.** Das sind n8n-JSONs: Importieren Sie sie und prüfen Sie jeden Node selbst.

Der FAQ-Assistent besteht aus zwei n8n-Workflows:

- **Antwort-Workflow**: verarbeitet eingehende Fragen und gibt Antworten zurück  
  [faq-assistent.json herunterladen](/workflows/faq-assistent.json)

- **Ingestion-Workflow**: liest Ihre Wissensbasis ein und schreibt sie in den Speicher  
  [faq-ingestion.json herunterladen](/workflows/faq-ingestion.json)

Das sind die portablen Fassungen: Sie betten die Frage ein und suchen per Vektor, laufen also auf einem Standard-Supabase-Setup mit Ihren eigenen Schlüsseln. Wie oben beschrieben antwortet meine Instanz stattdessen per Volltextsuche; der [technische Teardown](https://leinss.xyz/blog/de/faq-assistant-technical/) behandelt beides. Nach Import und Einrichten der Datenbank dauert es ein bis zwei Stunden bis zur ersten belegten Antwort.

## Technische Details

Wenn Sie die Implementierungsdetails interessieren: warum PostgreSQL Full-Text-Search statt Vektordatenbank, was der Erdungs-Node tatsächlich zusammenbaut, und die n8n-Fallgrube mit dem leeren Ergebnis, die still nichts zurückgibt:

→ **[Wie ich einen RAG-FAQ-Assistenten mit n8n und Kimi gebaut habe](https://leinss.xyz/blog/de/faq-assistant-technical/)** *(leinss.xyz)*

Zum Weiterlesen: [Kundenkommunikation automatisieren, ohne die menschliche Note zu verlieren](/de/blog/kommunikation-automatisieren-menschlich-bleiben/).

---

*Interesse an einer maßgeschneiderten FAQ-Lösung für Ihr Unternehmen? [Sprechen Sie mich an.](https://cal.com/tobias-leinss/strategiegespraech)*
