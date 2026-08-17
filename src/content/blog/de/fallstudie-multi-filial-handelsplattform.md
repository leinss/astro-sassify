---
title: "Fallstudie: Drei Anwendungen auf Daten, die mir nicht gehören"
description: "Neun Monate Umbau von Produkt-, Shop- und Eventsystemen eines Filialhändlers, dessen Datenwahrheit in einem Kassensystem und einer Supply-Chain-Plattform fremder Eigentümer liegt. Was kaputtging, und was ich deshalb geändert habe."
pubDate: 2026-08-14
heroImage: "/images/blog/case-study-ecommerce.png"
category: case-study
tags: ["postgresql", "supabase", "e-commerce", "integration", "row-level-security", "datenqualitaet"]
draft: false
lang: de
alternateSlug: "case-study-multi-branch-retail-platform"
---

> **Kurz gesagt:** Ein Händler mit regulierten Konsumgütern, mehreren Filialen und einem Lager hatte ein Kassensystem mit eingeschränkter Dateneingabe, eine Website ohne Verbindung zur Kasse und zum Shop, keinen verlässlichen Abgleich und keine Möglichkeit zu erkennen, wenn beide Seiten auseinanderliefen. In neun Monaten habe ich darauf drei Anwendungen gebaut (eine Produktverwaltung fürs Backoffice, den Kundenshop und eine Eventseite) plus die Anbindung an eine Supply-Chain-Plattform, die jemand anderem gehört. Der schwierige Teil waren nie die Anwendungen. Es war, auf Daten korrekt zu sein, die ich nicht kontrolliere.

> **Zu den Details:** Der Kunde wird nicht genannt, seine Anbieter auch nicht. Alles Technische unten ist real und stammt aus der Arbeit; die Zahlen sind aus den Repositories gezählt, nicht geschätzt.

## Der Ausgangspunkt

Das Kassensystem hielt die Wahrheit über Bestand und Preise, und es war der einzige Ort, an dem Mitarbeiter überhaupt etwas eingeben konnten, mit wenigen Feldern und ohne nennenswerte Validierung. Daneben stand eine WordPress-Seite, die weder mit der Kasse noch mit dem Shop verbunden war. Produktdaten wurden von Hand in Stapeln hochgeladen. Sobald jemand irgendwo einen Preis änderte, waren die beiden anderen Systeme falsch, und niemand konnte es sehen.

Es gab keine Drift-Erkennung. Genau das wird unterschätzt. Dass zwei Systeme sich widersprechen, ist ein normaler Dienstag. Dass zwei Systeme sich drei Wochen lang *unbemerkt* widersprechen, kostet Geld.

## Was ich gebaut habe

Drei Anwendungen, alle produktiv:

| | Aufgabe |
|---|---|
| **Produktverwaltung fürs Backoffice** | Wo kuratiert wird: Beschreibungen, Einkaufspreise, Sichtbarkeit, Bilder, und eine Prüfliste für alles, was von der Kasse abgewichen ist |
| **Kundenshop** | Der öffentliche Shop, der die kuratierte Ebene und die Live-Werte der Kasse zusammen liest |
| **Eventseite** | Eine eigene öffentliche Seite für Veranstaltungen und Besucherinfos des Standorts |

Dazu die Anbindung an ein **fremd betriebenes Supply-Chain-System**: Lagerbewegungen, FIFO-Chargenverfolgung, Bestände je Filiale und Lager. Dort arbeite ich über einen Staging-Branch zu; der Maintainer übernimmt nach Produktion. Diese Einschränkung hat das Design stärker geprägt als alles andere, und die nächsten beiden Abschnitte zeigen, warum.

Durchgehend Postgres mit Row-Level Security, Objektspeicher für Produktbilder und Continuous Deployment. Rund **1.067 Commits** über die drei Anwendungen, die mir gehören, in neun Monaten. Alle drei sind live.

## Die Entwurfsentscheidung, die sich ausgezahlt hat: keine gespeicherten Drift-Flags

Der naheliegende Weg, Abweichungen zwischen kuratierten Daten und Kasse zu verfolgen, ist ein Trigger und eine Boolean-Spalte. Irgendetwas schreibt `is_stale = true`, eine Warteschlange liest es, Mitarbeiter räumen es weg.

Das habe ich nicht gemacht, und diese Entscheidung würde ich am härtesten verteidigen.

Drift-Erkennung ist hier ein **JOIN zur Lesezeit mit `IS DISTINCT FROM`**. Nichts wird gespeichert, also kann nichts an der Veralterung veralten. Es gibt keinen Trigger, den ein Massenimport umgeht, kein Flag, das nach einer Migration nachgezogen werden muss, kein Zeitfenster, in dem die Prüfliste der Realität widerspricht, weil ein Schreibpfad den Trigger übersprungen hat. Der Vergleich läuft, wenn jemand hinsieht, gegen das, was beide Seiten in diesem Moment sagen, korrekt durch Konstruktion statt durch Pflege.

Der Preis ist ein etwas teurerer Lesezugriff. Ein guter Tausch, und die beiden folgenden Fehler erklären, warum ich aufgehört habe, gespeicherten Aussagen über fremde Daten zu trauen.

## Was schiefging, Teil eins: die Kasse vergibt Artikelnummern neu

Das Kassensystem erlaubt es, eine bestehende Artikelnummer einem **anderen Produkt** zu geben. Gleiche Nummer, neuer Artikel, kein Signal.

Der Abgleich schrieb die kuratierte Ebene mit `ON CONFLICT (sku) DO NOTHING`. Zusammen gelesen heißt das: Wurde eine Nummer neu vergeben, behielt die kuratierte Zeile ihren ursprünglichen Snapshot und ihre gesamte Kuratierung (Beschreibung, Einkaufspreis, Sichtbarkeit) dauerhaft an einem Produkt, das es unter dieser Nummer nicht mehr gab. Der Shop zeigte das eine, die Kasse meinte das andere, und die Zeile sah aus jedem Blickwinkel gesund aus.

Die verlockende Lösung ist eine Richtlinie: Mitarbeiter sollen Nummern nicht wiederverwenden. Das scheitert doppelt. Es verlässt sich auf Disziplin in einem System, das ich nicht kontrolliere, und es hilft den bereits kaputten Zeilen nicht.

Der Abgleich musste die Wiederverwendung also **aushalten**:

1. **Leser lösen die kanonische Zeile auf.** Backoffice und Shop wählen je Nummer das lebende Produkt und bevorzugen aktive Zeilen. Name, Preis und Bestand stimmen damit unabhängig davon, welchen Zwilling sie treffen.
2. **Mitarbeiter sehen den Konflikt.** Weicht der Live-Titel vom eingefrorenen Snapshot ab, zeigt das Backoffice „Nummer neu vergeben: erneut ziehen", damit ein Mensch die Kuratierung bewusst korrigiert, statt es über einen Kunden zu erfahren.
3. **Die Ursachenbehebung ging stromaufwärts.** Die dauerhafte Antwort ist, gar nicht auf die Nummer zu schlüsseln, sondern die *interne* Produkt-ID der Kasse mitzuführen, die niemand neu vergeben kann. Dieser Abgleich gehört dem Supply-Chain-Maintainer, also habe ich Migration und Diff geschrieben und übergeben, statt in fremdem Code zu editieren.

Die allgemeine Lehre ist mehr wert als der Vorfall: **Schlüsseln Sie Ihre Daten nie auf einen Bezeichner, den ein anderes System neu vergeben kann.** Wenn es sein muss, führen Sie die fremde Identität daneben mit, damit ein Tausch erkennbar statt unsichtbar ist.

## Was schiefging, Teil zwei: eine Korrektur, die der nächste Lauf löscht

Sechs Produktbilder ließen sich im Backoffice nicht mehr bearbeiten. Das Klassifizierungsfeld, an dem die Bearbeitung hängt, war auf NULL gefallen.

Ich habe sie in einer einzigen Transaktion nachgezogen, null verbleibende Fälle verifiziert und die Anweisung zum Zurückrollen notiert. Dann habe ich geprüft, ob die Korrektur überlebt, und das tat sie nicht. Jeder Abgleichlauf leitet dieses Feld neu aus einer **fest verdrahteten Kategorienzuordnung** ab, und in dieser Zuordnung fehlte eine Kategorie der Kasse. Der nächste Lauf hätte alle sechs erneut auf NULL gesetzt.

Eine Zeile war schlimmer. Ihre Kategorie war in jedem Quellsatz leer, es gab also gar nichts abzuleiten. Ein manuelles Nachziehen wäre bei jedem einzelnen Lauf wieder weg. Ich habe sie bewusst kaputt gelassen und dokumentiert, warum: Eine Korrektur, die man wöchentlich wiederholen muss, ist keine Korrektur, sondern eine Pflichtaufgabe, für die man sich freiwillig gemeldet hat.

Die dauerhafte Änderung war eine Zeile in dieser Kategorienzuordnung: wieder in einer Funktion, die jemand anderem gehört, also wieder ein Diff zur Übergabe statt eine Änderung im Code.

Wenn Sie aus diesem Projekt eine Gewohnheit übernehmen, dann diese: **Klären Sie nach jeder Datenkorrektur, was sie wieder rückgängig macht.** In einer Pipeline, die Ihnen nicht ganz gehört, hat diese Frage überraschend oft eine Antwort.

## Was das für Sie als Auftraggeber bedeutet

Integrationsarbeit wird meist so verkauft, als gehörten die Systeme Ihnen. Meistens tun sie das nicht. Da ist eine Kasse, die die Mitarbeiter nicht hergeben, eine Lieferantenplattform mit eigenem Maintainer und eigenem Releaseplan, und eine Website, die der Cousin von jemandem gebaut hat. Kontrollieren können Sie Ihre eigene Ebene, und den Unterschied macht diese Disziplin:

- **Gehen Sie davon aus, dass die Quelle sich selbst widerspricht,** und machen Sie den Widerspruch sichtbar, statt ihn still in Ihre Daten sickern zu lassen.
- **Speichern Sie keine Schlussfolgerungen über fremde Daten.** Berechnen Sie sie, wenn Sie sie brauchen: sonst pflegen Sie einen Cache von Tatsachen, die still falsch geworden sind.
- **Trennen Sie Workaround und Ursachenbehebung.** Halten Sie das Problem heute auf Ihrer Seite aus, schicken Sie die Ursachenänderung an den Eigentümer, und sagen Sie ehrlich, welches von beiden Sie getan haben.

Das ist die Form dieser Arbeit: [Integrationen & APIs](/de/services/integrationen-apis/), bei denen die Systeme echt sind, die Daten unsauber und Ihnen niemand die Hoheit über die ganze Kette überreicht.

Wenn Ihnen das bekannt vorkommt: [Buchen Sie ein kostenloses Gespräch](https://cal.com/tobias-leinss/strategiegespraech) und beschreiben Sie, wo Ihre Systeme sich widersprechen. Das ist meistens der interessante Teil.
