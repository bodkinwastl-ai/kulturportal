# Kulturprogramm-Portal Product Brief

> Arbeitsname: Kulturportal / Kultur Radar Cockpit
>
> Ziel: Aus den in Notion gesammelten Kultur-Radar-Events ein schönes, schnelles Entscheidungsportal bauen, in dem Peter Events sichten, bewerten, priorisieren, in den Kalender übernehmen und optional Einladungen vorbereiten kann.

## 1. Kurzfassung

Das Portal ist kein öffentliches Eventportal, sondern ein persönliches Entscheidungs-Cockpit für Peter. Es nutzt die bestehenden Notion-Datenbanken aus dem Kultur-Radar-System als Datenquelle:

- Sources DB: Kulturquellen
- Events DB: gefundene Events
- Google Calendar Sync: erzeugt Kalendertermine, sobald ein Event freigegeben ist

Der Mehrwert liegt nicht im Sammeln allein, sondern im Kuratieren: schnell sehen, was relevant ist, entscheiden, bewerten, einladen, ignorieren.

## 2. Problem

Aktuell landen gefundene Kulturangebote in Notion. Notion ist als Datenbank gut, aber als tägliches Entscheidungsinterface zu schwerfällig:

- Zu wenig visuelle Übersicht
- Schwierig, Events emotional und praktisch zu vergleichen
- CalendarWanted, Invitees, Status und Bewertung sind möglich, aber nicht als schöner Flow gestaltet
- Gute Events können in Listen untergehen
- Keine klare Triage: anschauen, interessant, Kalender, einladen, ignorieren

## 3. Zielbild

Ein privates Webportal mit Dashboard-Charakter:

- Events werden als hochwertige Cards dargestellt
- Filter nach Zeitraum, Stadt, Kategorie, Status, Quelle und Bewertung
- „Neu“ steht oben und wird als Inbox/Triage behandelt
- Peter entscheidet direkt pro Event:
  - interessiert mich
  - in Kalender übernehmen
  - jemanden einladen
  - nicht interessant
  - später ansehen
- Bewertungen/Notizen helfen, zukünftige Empfehlungen besser zu kuratieren
- Notion bleibt die Datenquelle und Steuerzentrale, das Portal ist die schöne Arbeitsoberfläche

## 4. Nutzer

Primärnutzer:

- Peter Wastl

Sekundärnutzer, optional später:

- Familie/Freunde als Einladungsziel, aber nicht zwingend als eingeloggte Portalnutzer
- Eventuell später ein Share-Link pro Event oder Wochenliste

## 5. Kern-Use-Cases

### 5.1 Wochenübersicht öffnen

Peter öffnet das Portal und sieht sofort:

- neue Events seit letztem Check
- kommende Highlights der nächsten 30 Tage
- Events mit Entscheidung offen
- Events, die bereits für Kalender markiert sind
- eventuell kollidierende Termine oder besonders bald stattfindende Events

### 5.2 Event triagieren

Pro Event kann Peter schnell entscheiden:

- Ignorieren: Event verschwindet aus der aktiven Inbox
- Interessant: Event bleibt auf Watchlist
- Kalender: Event wird für Calendar Sync markiert
- Einladen: Invitees/Notiz werden ergänzt
- Gebucht: Event als fix geplant markieren

### 5.3 Event bewerten

Bewertung nicht nur als Sterne, sondern als Entscheidungsqualität:

- Relevanz: 1-5
- Stimmung/Interest: „Must see“, „Vielleicht“, „Nur wenn Zeit“, „Nicht meins“
- Optional: kurze persönliche Notiz

Diese Bewertung soll später helfen, Quellen/Kategorien besser zu priorisieren.

### 5.4 Einladungen vorbereiten

Wenn Peter jemanden mitnehmen möchte:

- Invitees-Feld erfassen, ideal E-Mail-Adressen oder Namen
- Kalender-Sync übernimmt echte E-Mail-Adressen als Google Calendar Attendees
- Namen ohne E-Mail bleiben als Notiz im Kalendertermin

### 5.5 Kalenderfreigabe

Nicht jedes gefundene Event kommt in den Kalender.

Portal-Aktion:

- „In Kalender“ setzt `CalendarWanted = true`
- Der bestehende Syncjob erstellt später den Google Calendar Termin
- Nach erfolgreicher Erstellung setzt der Sync `CalendarCreated = true`, schreibt `CalendarEventId`, Status `Kalender`

## 6. Bestehende Datenbasis

### 6.1 Notion Sources DB

ID laut aktuellem System:

`3f85e96f-2473-81c2-8c9f-e2f0491381e1`

Wichtige Felder:

- `Quelle` Title
- `URL`
- `Aktiv`
- `Region`
- `Kategorien`
- `Priorität`

### 6.2 Notion Events DB

ID laut aktuellem System:

`3f85e96f-2473-817b-b31e-d0ea97414538`

Bestehende Felder:

- `Event`
- `Datum`
- `Ort`
- `Stadt`
- `Region`
- `Kategorien`
- `Quelle`
- `URL`
- `Beschreibung`
- `Preis`
- `Status`
- `CalendarWanted`
- `Invitees`
- `CalendarCreated`
- `CalendarEventId`
- `Scan-Key`

### 6.3 Vorschlag für zusätzliche Felder

Für ein gutes Portal sollten ergänzt werden:

- `Rating` Number 1-5
- `PersonalNote` Rich text
- `Decision` Select: `Neu`, `Interessant`, `Kalender`, `Einladen`, `Ignorieren`, `Gebucht`, `Vielleicht`
- `LastReviewedAt` Date
- `ReviewedBy` Rich text oder Select, optional
- `HeroImage` URL oder Files, optional später
- `WhyRecommended` Rich text, optional durch Radar-Agent befüllbar

Wenn wir minimal bleiben wollen, können `Rating` und `PersonalNote` zuerst reichen.

## 7. Informationsarchitektur

### 7.1 Seiten

#### Dashboard

Ziel: schnelle Tages-/Wochenentscheidung.

Bereiche:

- Top Stats: Neu, Interessant, Kalender, diese Woche
- „Neu zuerst“ Inbox
- Highlights der nächsten 30 Tage
- Kategorie-/Regionsfilter

#### Events

Ziel: komplette filterbare Liste.

Funktionen:

- Suche
- Filter: Zeitraum, Region, Stadt, Kategorie, Status, Bewertung, Quelle
- Sortierung: Datum, Relevanz, neu gefunden, bald zuerst
- Card/List Toggle optional

#### Event Detail Drawer

Kein full page reload. Seitlicher Drawer oder Modal.

Inhalt:

- Titel
- Datum/Zeit
- Ort/Stadt
- Kategorie
- Beschreibung
- Preis
- Quelle/Link
- Bewertung
- Notiz
- Invitees
- Aktionen

#### Sources

Optional für v1.5:

- Quellenliste aus Notion
- Aktiv/Inaktiv anzeigen
- Priorität anzeigen
- Kategorien/Regionen sichtbar

#### Settings / Admin

Optional später:

- Syncstatus
- Notion-Verbindung
- Kalender-Syncstatus
- Quellengewichtung

### 7.2 Startansicht

Die Startansicht soll immer entscheidungsorientiert sein:

1. Neue Events ganz oben
2. Dann bald stattfindende interessante Events
3. Dann bereits markierte Kalender-/Einladungs-Events
4. Ignorierte und Gebuchte ausblenden, außer Filter zeigt sie explizit

## 8. UX-Konzept

### 8.1 Event Card

Pflichtinformationen:

- Datum groß sichtbar
- Stadt + Venue
- Kategorie-Chips
- Eventtitel
- Kurzbeschreibung
- Preis, falls vorhanden
- Quelle
- Status

Primäre Aktionen:

- Interessant
- Kalender
- Einladen
- Ignorieren

Sekundäre Aktionen:

- Original öffnen
- Notiz bearbeiten
- Bewertung setzen

### 8.2 Entscheidungsfluss

Default-Flow für neue Events:

- Karte ansehen
- entweder „Ignorieren“ oder „Interessant“ oder „Kalender“
- bei „Kalender“ optional direkt Invitees eintragen
- Status ändert sich sofort optimistisch in der UI
- Notion wird aktualisiert
- bei Fehler Rollback + sichtbare Fehlermeldung

### 8.3 Bewertung

Nicht zu viel UI. Vorschlag:

- 5-Punkt-Relevanz als kleine Taste oder Segment Control
- Persönliche Notiz als einzeiliges Textfeld im Drawer
- Quick Labels: „Must see“, „Maybe“, „Family“, „Work“, „Date“, optional später

## 9. Design Direction

Reading this as: private decision dashboard for Peter, with a premium warm enterprise/editorial dashboard language, leaning toward custom Next.js + Tailwind/shadcn-style components, not a generic public event site.

Design dials:

- DESIGN_VARIANCE: 6
- MOTION_INTENSITY: 3
- VISUAL_DENSITY: 7

Warum:

- Es ist ein produktives Dashboard, kein Marketing-Auftritt
- Hohe Dichte ist wichtig, aber es soll nicht wie Notion oder ein Tabellenmonster wirken
- Motion soll ruhig bleiben: Hover, Drawer, kleine Statusübergänge, keine Showeffekte

Visuelle Richtung:

- ActivityTracker-/Hermes-Dashboard-Sprache
- Dunkelblaue Navigation
- warmes Offwhite als Hauptfläche
- dezente Orange-Akzente
- klare Cards, dichte Tabellen, wenig Clutter

Palette aus Peters Präferenzen:

- Palladian `#EEE9DF`
- Oatmeal `#C9C1B1`
- Blue Fantastic `#2C3B4D`
- Burning Flame `#FFB162`
- Truffle Trouble `#A35139`
- Abyssal Anchofish Blue `#1B2632`

Layout:

- Desktop-first Cockpit
- mobile brauchbar, aber nicht primär
- Cards mit klarer Hierarchie
- linke oder obere Navigation
- keine übertriebenen Gradients
- keine AI-purple Defaults

## 10. Tech Vorschlag

### 10.1 Stack

Empfohlen:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui oder eigene kleine Komponenten auf Radix-Basis
- Notion API serverseitig
- Google Calendar bleibt über bestehenden Syncjob angebunden

Alternative:

- Simple Vite/React + Express API, wenn schneller MVP wichtiger ist

### 10.2 Architektur

Frontend:

- `/dashboard`
- `/events`
- `/sources` optional
- Komponenten:
  - `EventCard`
  - `EventList`
  - `EventDetailDrawer`
  - `FilterBar`
  - `StatusPill`
  - `RatingControl`
  - `InviteesEditor`

Backend/API:

- `GET /api/events`
- `PATCH /api/events/:id`
- `GET /api/sources`
- optional `POST /api/events/:id/calendar-request`

Notion bleibt Source of Truth.

### 10.3 Auth

Für v1:

- lokal/LAN oder Vercel geschützt
- einfache Basic Auth oder Vercel Protection reicht

Später:

- Login, falls auch Familie/Freunde Zugriff bekommen

## 11. Daten-Mapping Actions zu Notion

### Interessant

Setzt:

- `Status = Interessant`
- `LastReviewedAt = now` falls Feld existiert

### Kalender

Setzt:

- `CalendarWanted = true`
- `Status = Interessant` oder `Einladen`, solange `CalendarCreated = false`
- optional `Invitees`

Der Kalender-Sync setzt später:

- `CalendarCreated = true`
- `CalendarEventId = <id>`
- `Status = Kalender`

### Einladen

Setzt:

- `Status = Einladen`
- `Invitees = <text>`
- optional `CalendarWanted = true`, falls Peter direkt will

Offene Produktfrage: Soll „Einladen“ automatisch Kalenderwunsch setzen oder nur vorbereiten?

### Ignorieren

Setzt:

- `Status = Ignorieren`
- `LastReviewedAt = now` falls Feld existiert

### Gebucht

Setzt:

- `Status = Gebucht`

## 12. MVP-Scope

### Muss

- Events aus Notion lesen
- Dashboard mit Neu/Interessant/Kalender/Einladen anzeigen
- Filter nach Region, Stadt, Kategorie, Status
- Event Cards mit Datum, Ort, Beschreibung, Preis, Quelle
- Detail Drawer
- Status ändern: Interessant, Ignorieren, Kalender, Einladen, Gebucht
- Invitees bearbeiten
- CalendarWanted setzen
- Responsive Desktop + solide Mobile-Ansicht
- Fehlerzustände und Loading States

### Sollte

- Rating 1-5
- persönliche Notiz
- Suche
- Sortierung nach Datum/Relevanz
- Quellenanzeige
- Kalender-Syncstatus sichtbar

### Später

- AI-Empfehlung „Warum relevant für Peter“
- Wochenmail/Telegram Digest aus Portalzustand
- Share-Link für ausgewählte Events
- Einladungsvorschläge aus Kontaktliste
- Lernende Priorisierung nach Bewertungen
- Quellenmanagement im Portal

## 13. Akzeptanzkriterien

- Peter kann neue Events innerhalb von 5 Minuten sichten und entscheiden
- Statusänderungen landen korrekt in Notion
- `CalendarWanted=true` löst beim bestehenden Syncjob später einen Kalendertermin aus
- Ignorierte Events verschwinden aus der Standardansicht
- Neu steht immer oben
- UI wirkt wie ein sauberes persönliches Cockpit, nicht wie eine generische Eventliste
- Keine Kalendertermine werden direkt vom Portal erstellt, außer wir entscheiden später bewusst anders
- Fehler aus Notion/API werden sichtbar und zerstören keine lokale UI

## 14. Risiken und offene Punkte

### Notion-Zugriff

Aktuell gibt es einen bekannten Blocker: Notion gibt `404 object_not_found` für die Kultur-Radar-Datenbanken zurück. Vermutlich sind Hub/DBs nicht mit der Integration `N8N SocialMedia` geteilt. Vor Umsetzung muss Zugriff wieder funktionieren.

### Notion als Backend

Notion API ist okay für MVP, aber nicht ideal für hohe Performance. Für Peters private Nutzung reicht es. Caching ist sinnvoll.

### Kalender-Sync

Das Portal sollte nicht parallel selbst Kalendertermine erstellen, solange der bestehende Syncjob diese Aufgabe hat. Sonst entstehen Duplikate.

### Datenfelder

Vor Implementierung klären, ob wir zusätzliche Felder in Notion anlegen dürfen: `Rating`, `PersonalNote`, `LastReviewedAt`.

## 15. Geklärte Produktentscheidungen

- Deployment: Vercel.
- Zugriff: aktuell nur privat für Peter.
- Notion darf erweitert werden: `Rating`, `PersonalNote`, `LastReviewedAt` und optional `WhyRecommended`.
- Designrichtung: neu, hip, dynamisch, elegant, fancy. Nicht zu technisch-steif, nicht generisch. Eher ein hochwertiges persönliches Kultur-Cockpit mit editorial/premium Vibe.
- „Einladen“ soll einen Kalendereintrag auslösen, aber über den bestehenden sicheren Flow: Aktion setzt `CalendarWanted = true`, `Status = Einladen` und `Invitees`. Der bestehende Kalender-Sync erstellt dann den Google Calendar Eintrag samt Attendees. Das vermeidet doppelte Calendar-Logik im Portal.

## 16. Empfohlene nächste Entscheidung

V1 wird als privates Vercel-Cockpit gebaut:

- schnelle Erreichbarkeit von unterwegs
- Basic Auth vor das Portal reicht für v1
- Notion bleibt Source of Truth
- Kalendererstellung bleibt beim bestehenden Syncjob
- Invitees bleiben ein freies Textfeld, aber die zuletzt verwendeten Eingaben sollen als Vorschläge gemerkt werden
- UI darf deutlich hochwertiger und dynamischer sein als Notion, aber ohne Dashboard-Clutter

Nächster Schritt: Vibecoder-Agent soll aus diesem Brief ein Next.js MVP bauen, nachdem Notion-Zugriff wiederhergestellt ist oder mit Mock-Daten gestartet wird.
