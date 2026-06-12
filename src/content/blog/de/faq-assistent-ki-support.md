---
title: "24/7 KI-Support ohne Nachtschicht: FAQ-Assistent für Ihr Unternehmen"
description: "Wie Sie mit n8n, OpenAI-Embeddings und Claude wiederkehrende Support-Anfragen automatisieren – und sich auf die Fragen konzentrieren, die wirklich Ihre Zeit brauchen."
pubDate: 2025-04-10
category: automation
tags: ["faq", "support", "ki", "rag", "n8n", "vektordatenbank"]
heroImage: "/images/blog/faq-automation.png"
draft: false
lang: de
alternateSlug: "faq-automation-ai-support"
---

Öffnungszeiten. Preise. Wie lange dauert die Lieferung? Was passiert nach der Anfrage? Für Ihre Kunden sind das wichtige Fragen. Für Sie sind es die gleichen vier Sätze, die Sie diese Woche zum zwanzigsten Mal tippen.

Das Support-Postfach ist kein Einzelfall. Es ist ein Muster – und Muster lassen sich automatisieren.

## Das Problem mit wiederkehrenden Fragen

Wer Support-Anfragen manuell beantwortet, steht vor einem Zielkonflikt: Schnelle Antworten erfordern Zeit, die an anderer Stelle fehlt. Wartezeiten dagegen frustrieren Kunden – selbst wenn die Antwort am Ende einfach ist.

Das Tragische daran: Die meisten dieser Fragen sind vorhersehbar. 70–80 % der eingehenden Anfragen vieler kleiner Unternehmen drehen sich um dieselben Themen. Das Wissen für die Antworten ist längst vorhanden – es steckt nur noch nicht im richtigen System.

Genau hier setzt der **FAQ-Assistent** an.

## Was ist RAG – und warum ist das wichtig?

Hinter dem FAQ-Assistenten steckt eine Technik namens RAG: Retrieval-Augmented Generation. In drei Sätzen erklärt:

Statt einer KI alles Wissen einzuprogrammieren, gibt man ihr eine durchsuchbare Wissensbasis. Kommt eine Frage rein, sucht die KI zuerst nach den passendsten Einträgen – und antwortet dann auf Basis dieser Quellen. Das Ergebnis ist präziser und bleibt aktuell, weil nur die Wissensbasis gepflegt werden muss, nicht das Modell.

Es ist der Unterschied zwischen einem Mitarbeiter, der alles auswendig weiß, und einem, der gezielt nachschlägt – und dabei zuverlässiger ist.

## Wie der Workflow funktioniert

Der Prozess läuft in vier Schritten ab:

```
Kunde stellt Frage
    │
    ▼
Frage wird eingebettet
(OpenAI Embeddings → Zahlenvektor)
    │
    ▼
Ähnlichste Einträge aus
der Wissensbasis abrufen
    │
    ▼
Claude formuliert Antwort
auf Basis der gefundenen Quellen
    │
    ├── Hohe Sicherheit ──→ Antwort direkt senden
    │
    └── Niedrige Sicherheit ──→ Weiterleitung an Mensch
```

Das Einbetten klingt technisch, ist aber das Herzstück: Jede Frage und jeder Wissenseintrag wird in einen Zahlenvektor umgewandelt. Ähnliche Bedeutungen ergeben ähnliche Zahlen. So findet das System „Wann habt ihr auf?" und „Öffnungszeiten am Wochenende?" als dasselbe – auch wenn die Formulierung unterschiedlich ist.

## Sicherheit durch Confidence Scoring

Nicht jede Frage ist eindeutig. Was passiert, wenn die KI unsicher ist?

Der Assistent bewertet bei jeder Antwort intern, wie gut die gefundenen Wissenseinträge zur Frage passen. Liegt dieser Wert unter einem definierten Schwellenwert, wird die Anfrage nicht automatisch beantwortet – sondern weitergeleitet: an einen Menschen, ein Ticketsystem oder eine definierte Fallback-Adresse.

Das ist keine Schwäche des Systems. Es ist das Design. Ein Assistent, der weiß, was er nicht weiß, ist zuverlässiger als einer, der immer eine Antwort erfindet.

## Demo: Testen Sie den FAQ-Assistenten

<!-- DEMO_WIDGET_PLACEHOLDER -->

## Was das in der Praxis bedeutet

Ein Blick auf konkrete Zeitersparnisse:

| Aufgabe | Manuell | Mit FAQ-Assistent |
|---------|---------|-------------------|
| Preis-Anfrage beantworten | 5 min | ~3 Sek. |
| Onboarding-Fragen klären | 10 min | ~3 Sek. |
| Wiederkehrende Support-Fragen | Täglich | Automatisch |
| Reaktionszeit | Geschäftszeiten | 24/7 |

Bei fünf wiederkehrenden Anfragen täglich, fünf Tage die Woche, ergibt das über 200 gesparte Stunden im Jahr – allein für Fragen, auf die die Antwort seit Monaten dieselbe ist.

## DSGVO: Was mit den Daten passiert

Support-Anfragen können sensible Informationen enthalten. Deshalb ist Transparenz kein Bonus, sondern Pflicht:

- **Datenspeicherung in der EU**: Die Vektordatenbank läuft auf Supabase in einer europäischen Region. Keine Daten verlassen die EU ohne Ihre Freigabe.
- **Kein Logging ohne Einwilligung**: Anfragen werden für die Verarbeitung genutzt, nicht dauerhaft gespeichert – sofern Sie das nicht explizit aktivieren.
- **Volle Kontrolle über die Wissensbasis**: Sie pflegen, was der Assistent weiß. Kein Black-Box-Verhalten: Sie sehen jeden Eintrag und können ihn jederzeit ändern oder entfernen.
- **AVV mit Anthropic**: Die KI-Verarbeitung über Claude ist DSGVO-kompatibel abgesichert.

## Was sich anpassen lässt

Der FAQ-Assistent ist kein Fertigprodukt – er passt sich Ihrem Betrieb an:

- **Eigene Wissensbasis**: Ob FAQ-Dokument, Notion-Seite oder bestehende Hilfetexte – der Ingestion-Workflow verarbeitet alle gängigen Formate.
- **Kanalwahl**: Integration in ein Chat-Widget auf Ihrer Website, in E-Mail-Postfächer oder in Slack – je nachdem, wo Ihre Kunden schreiben.
- **Eskalation**: Niedrig-sicherige Anfragen landen direkt in Ihrem Ticketsystem (Freshdesk, Linear, Jira – was auch immer Sie nutzen).
- **Ton und Stil**: Ein kurzes Prompt-Dokument reicht, damit die KI Ihren Schreibstil trifft.

## Die Workflows herunterladen

Der FAQ-Assistent besteht aus zwei n8n-Workflows:

- **Antwort-Workflow**: verarbeitet eingehende Fragen und gibt Antworten zurück  
  [faq-assistent.json herunterladen](/workflows/faq-assistent.json)

- **Ingestion-Workflow**: liest Ihre Wissensbasis ein und schreibt sie in die Vektordatenbank  
  [faq-ingestion.json herunterladen](/workflows/faq-ingestion.json)

Nach dem Import in Ihre n8n-Instanz und dem Einrichten einer Supabase-Datenbank sind Sie in ein bis zwei Stunden einsatzbereit. Die SQL-Einrichtung für die Vektordatenbank finden Sie im [GitHub-Repository](https://github.com/leinss).

## Technischer Deep Dive

Wenn Sie die Implementierungsdetails interessieren — warum PostgreSQL Full-Text-Search statt Vektordatenbank, wie die OR-Suchlogik funktioniert und welche n8n-Fallgruben beim Item-Splitting lauern:

→ **[FAQ-Assistent mit n8n, PostgreSQL FTS und Kimi k2.5 bauen](https://leinss.xyz/de/blog/faq-assistent-technik/)** *(leinss.xyz)*

---

*Interesse an einer maßgeschneiderten FAQ-Lösung für Ihr Unternehmen? [Sprechen Sie mich an.](https://cal.com/tobias-leinss/strategiegespraech)*
