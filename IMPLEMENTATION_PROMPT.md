# Vibecoder Handoff: Kulturprogramm-Portal MVP

Du bist der Vibecoder-Agent. Baue ein erstes MVP für Peters privates Kulturprogramm-Portal.

## Kontext

Lies zuerst vollständig:

`/home/peter/projects/kulturportal/BRIEFING.md`

Das Portal soll die in Notion gesammelten Kultur-Radar-Events schön und entscheidungsorientiert darstellen. Peter will Events sichten, bewerten, ignorieren, für Kalender markieren und optional Invitees pflegen.

## Wichtige bestehende Systeme

Notion Events DB:

`3f85e96f-2473-817b-b31e-d0ea97414538`

Notion Sources DB:

`3f85e96f-2473-81c2-8c9f-e2f0491381e1`

Bestehender Kalender-Sync:

`/home/peter/.hermes/scripts/culture_radar_calendar_sync.py`

Wichtig: Das Portal soll in v1 keine Kalendertermine direkt erstellen. Es setzt nur Notion-Felder wie `CalendarWanted` und `Invitees`. Der bestehende Syncjob erstellt später den Google Calendar Termin.

Aktueller Blocker:

Notion gibt derzeit `404 object_not_found` auf die Kultur-Radar-Datenbanken zurück. Vermutlich sind die DBs nicht mit der Integration `N8N SocialMedia` geteilt. Baue das MVP daher so, dass es mit Mock-Daten starten kann und später sauber auf Notion umschaltet.

## Ziel

Erstelle ein Next.js MVP als privates Vercel-Dashboard/Cockpit für Peter.

Produktentscheidungen:

- Deployment-Ziel: Vercel.
- Zugriff: aktuell nur Peter. Basic Auth reicht für v1, keine öffentliche Seite.
- Notion darf erweitert werden um `Rating`, `PersonalNote`, `LastReviewedAt` und optional `WhyRecommended`.
- „Einladen“ soll Kalendererstellung auslösen, aber nicht direkt über Google Calendar im Portal. Setze `CalendarWanted = true`, `Status = Einladen` und `Invitees`. Der bestehende Kalender-Sync erstellt den Termin.
- Invitees bleiben ein freies Textfeld. Die App soll die zuletzt verwendeten Invitees merken und als Vorschläge anbieten, z. B. über localStorage für v1.
- Design: neu, hip, dynamisch, elegant, fancy. Premium Kultur-Cockpit statt generisches Dashboard.

## Empfohlener Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui oder kleine eigene Radix-basierte Komponenten
- Server-side Notion API client
- Mock-Daten-Fallback, solange Notion nicht erreichbar ist
- Vercel Deployment mit serverseitigen Environment Variables

## Design Read

Private decision dashboard for Peter, premium warm enterprise/editorial cockpit, not a public event marketing site.

Design dials:

- DESIGN_VARIANCE: 6
- MOTION_INTENSITY: 3
- VISUAL_DENSITY: 7

Designsprache:

- ActivityTracker/Hermes-Dashboard Nähe
- Dunkelblaue Navigation
- warmes Offwhite
- dezente Orange-Akzente
- dichte Cards/Listen
- wenig Clutter
- keine AI-purple Gradients
- keine übertriebene Animation

Palette:

- Palladian `#EEE9DF`
- Oatmeal `#C9C1B1`
- Blue Fantastic `#2C3B4D`
- Burning Flame `#FFB162`
- Truffle Trouble `#A35139`
- Abyssal Anchofish Blue `#1B2632`

## MVP Features

### Dashboard

- Top Stats: Neu, Interessant, Kalender, Einladen, diese Woche
- „Neu“ immer oben
- Event Cards mit klarer Entscheidungshierarchie
- Filterbar nach Region, Stadt, Kategorie, Status

### Events Ansicht

- vollständige Liste
- Suche
- Filter
- Sortierung: Datum, Status, Bewertung falls vorhanden

### Event Detail Drawer

- Titel
- Datum/Zeit
- Venue/Stadt/Region
- Kategorien
- Beschreibung
- Preis
- Quelle/URL
- Status
- CalendarWanted
- CalendarCreated
- Invitees
- Rating falls im Datenmodell vorhanden oder lokal mockbar
- PersonalNote falls im Datenmodell vorhanden oder lokal mockbar

### Actions

Implementiere API + UI für:

- Interessant: `Status = Interessant`
- Ignorieren: `Status = Ignorieren`
- Kalender: `CalendarWanted = true`
- Einladen: `Status = Einladen`, `Invitees = ...`
- Gebucht: `Status = Gebucht`
- Rating/Note, falls Feld existiert oder mockbar

Wenn Notion-Felder fehlen, soll die App das sauber anzeigen und nicht crashen.

## Architektur-Vorschlag

```text
app/
  page.tsx
  events/page.tsx
  api/events/route.ts
  api/events/[id]/route.ts
components/
  app-shell.tsx
  event-card.tsx
  event-detail-drawer.tsx
  event-filters.tsx
  status-pill.tsx
  rating-control.tsx
  invitees-editor.tsx
lib/
  notion.ts
  culture-events.ts
  mock-events.ts
  types.ts
```

## Datenmodell

Definiere TypeScript-Typen unabhängig von Notion:

```ts
export type CultureEventStatus =
  | "Neu"
  | "Interessant"
  | "Kalender"
  | "Einladen"
  | "Ignorieren"
  | "Gebucht"
  | "Vielleicht";

export type CultureEvent = {
  id: string;
  title: string;
  date: string;
  venue?: string;
  city?: string;
  region?: string;
  categories: string[];
  sourceName?: string;
  url?: string;
  description?: string;
  price?: string;
  status: CultureEventStatus;
  calendarWanted: boolean;
  calendarCreated: boolean;
  calendarEventId?: string;
  invitees?: string;
  rating?: number;
  personalNote?: string;
};
```

## Implementation Rules

- Notion access serverseitig halten, keine Tokens im Client.
- Wenn Notion nicht erreichbar ist, Mock-Daten verwenden und oben einen klaren Hinweis anzeigen.
- UI muss ohne echte Notion-Verbindung demonstrierbar sein.
- Actions bei Mock-Daten dürfen lokal nur simulieren.
- Keine direkten Google Calendar API Calls im Portal.
- Loading, Empty und Error States umsetzen.
- Mobile solide, Desktop priorisieren.
- Keine em-dashes in sichtbaren UI-Texten.

## Akzeptanzkriterien

- `npm run dev` startet die App.
- Dashboard zeigt Mock-Daten, wenn Notion nicht erreichbar ist.
- Event Cards zeigen Datum, Titel, Stadt, Kategorie, Status und Aktionen.
- Detail Drawer funktioniert.
- Filter funktionieren clientseitig.
- Actions aktualisieren UI optimistisch.
- Notion PATCH ist vorbereitet und funktioniert, sobald Zugriff wiederhergestellt ist.
- Kein Kalendertermin wird direkt erstellt.
- Design wirkt wie ein persönliches Cockpit, nicht wie eine generische Eventliste.

## Verifikation

Führe nach Umsetzung aus:

```bash
npm run lint
npm run build
npm run dev
```

Wenn Browser-Tools verfügbar sind:

- Dashboard öffnen
- Event filtern
- Event Detail öffnen
- Status ändern
- Invitees editieren
- Mobile Breite prüfen

## Rückmeldung an Syntax/Peter

Am Ende kurz berichten:

- Was gebaut wurde
- Ob Notion live funktioniert oder Mock-Fallback aktiv ist
- Welche Commands erfolgreich waren
- Welche offenen Fragen/Blocker bleiben
