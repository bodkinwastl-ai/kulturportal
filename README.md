# Kulturprogramm-Portal MVP

Ein persönliches Dashboard für Peters Kulturveranstaltungen aus dem Notion-basierten Kultur-Radar-System.

## Features

- **Dashboard**: Übersicht über neue, interessante und geplante Events mit Statistiken
- **Event Management**: Triagieren, bewerten, Kalender-Sync vorbereiten
- **Filterung**: Nach Region, Stadt, Kategorie, Status und Suchbegriff
- **Detail-Ansicht**: Vollständige Event-Informationen mit Aktionen
- **Mock-Daten Fallback**: Funktioniert auch wenn Notion nicht erreichbar ist
- **Mobile-responsive**: Funktioniert auf Desktop und Mobile

## Technologie

- **Frontend**: Next.js 16 mit App Router, TypeScript, Tailwind CSS
- **UI-Komponenten**: Radix UI Primitives mit shadcn/ui-Stil
- **Backend**: Next.js API Routes
- **Datenquelle**: Notion API mit Mock-Daten als Fallback
- **Deployment**: Optimiert für Vercel

## Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Environment konfigurieren

Kopiere `.env.example` zu `.env.local`:

```bash
cp .env.example .env.local
```

Fülle die Notion-Konfiguration aus:

```env
# Notion API Configuration
NOTION_TOKEN=your_notion_token_here

# Basic Auth für Vercel (optional)
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=your_password_here
```

Optional für die Info-Mail ("Per Mail empfehlen" im Event-Detail), Versand über Gmail / Google Workspace:

```env
GMAIL_USER=du@deine-domain.at
# Google-Konto -> Sicherheit -> App-Passwörter (Bestätigung in zwei Schritten nötig)
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
# Anzeigename des Absenders (optional) und Antwortadresse (optional, Standard: GMAIL_USER)
MAIL_FROM_NAME="Peter Wastl"
MAIL_REPLY_TO=du@deine-domain.at
```

Der Mail-Endpunkt ist in Produktion nur mit gesetztem `BASIC_AUTH_USER`/`BASIC_AUTH_PASSWORD` nutzbar.

### 3. Entwicklungsserver starten

```bash
npm run dev
```

Portal ist verfügbar unter: http://localhost:3000

### 4. Production Build

```bash
npm run build
npm start
```

## Notion Integration

Das Portal nutzt zwei Notion-Datenbanken:

- **Events DB**: `3f85e96f-2473-817b-b31e-d0ea97414538`
- **Sources DB**: `3f85e96f-2473-81c2-8c9f-e2f0491381e1`

### Notion-Felder (Events)

- `Event` (Title): Event-Name
- `Datum` (Date): Datum und Uhrzeit
- `Ort` (Rich Text): Venue
- `Stadt` (Rich Text): Stadt
- `Region` (Rich Text): Region
- `Kategorien` (Multi-Select): Event-Kategorien
- `Quelle` (Relation): Verweis auf Sources DB
- `URL` (URL): Event-Link
- `Beschreibung` (Rich Text): Event-Beschreibung
- `Preis` (Rich Text): Preisinformation
- `Status` (Select): Neu, Interessant, Kalender, Einladen, Gebucht, Ignorieren, Vielleicht
- `CalendarWanted` (Checkbox): Für Kalender-Sync markiert
- `CalendarCreated` (Checkbox): Kalendertermin erstellt
- `CalendarEventId` (Rich Text): Google Calendar Event ID
- `Invitees` (Rich Text): Einladungsliste
- `Rating` (Number): Bewertung 1-5
- `PersonalNote` (Rich Text): Persönliche Notiz
- `LastReviewedAt` (Date): Letzte Bearbeitung

## Vercel Deployment

### 1. Vercel CLI installieren

```bash
npm i -g vercel
```

### 2. Projekt deployen

```bash
vercel
```

### 3. Environment Variables setzen

In der Vercel Dashboard:

- `NOTION_TOKEN`: Notion Integration Token
- `BASIC_AUTH_USER`: Username für Basic Auth (optional)
- `BASIC_AUTH_PASSWORD`: Password für Basic Auth (optional)

### 4. Basic Auth Setup (Optional)

Füge `vercel.json` hinzu für Basic Auth:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "headers": {
        "WWW-Authenticate": "Basic realm=\"Kulturportal\""
      }
    }
  }
}
```

## Architektur

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Dashboard
│   ├── events/page.tsx    # Alle Events
│   ├── api/               # API Routes
│   └── globals.css        # Global Styles
├── components/            # React Komponenten
│   ├── app-shell.tsx     # Navigation + Layout
│   ├── event-card.tsx    # Event Card
│   ├── event-detail-drawer.tsx
│   ├── event-filters.tsx # Filter UI
│   ├── status-pill.tsx   # Status Badge
│   └── ui/               # UI Primitives
├── lib/                  # Utilities
│   ├── types.ts          # TypeScript Typen
│   ├── notion.ts         # Notion API Client
│   ├── mock-events.ts    # Mock-Daten
│   └── utils.ts          # Hilfsfunktionen
```

## Verwendung

### Dashboard

- Zeigt Statistiken: Neu, Interessant, Kalender, Einladen, diese Woche
- Neue Events stehen immer oben
- Schnelle Aktionen direkt auf Event Cards

### Event Triage

- **Interessant**: Event auf Watchlist setzen
- **Kalender**: `CalendarWanted = true` für bestehenden Sync-Job
- **Einladen**: Invitees verwalten + Kalender markieren
- **Ignorieren**: Aus aktiver Inbox entfernen
- **Gebucht**: Als fix geplant markieren

### Filters

- **Suche**: Titel, Beschreibung, Venue durchsuchen
- **Region**: Nach Regionen filtern
- **Kategorien**: Nach Event-Typen filtern
- **Status**: Aktuelle Bearbeitungsphase filtern

### Event Detail

- Vollständige Event-Informationen
- Bewertung (1-5 Sterne)
- Persönliche Notizen
- Invitees-Management
- Externe Links
- Status-Aktionen

## Mock-Daten

Ohne Notion-Verbindung werden automatisch Mock-Daten geladen:

- 6 Beispiel-Events verschiedener Kategorien
- Verschiedene Status-Zustände
- Realistische Wiener Kulturveranstaltungen
- Demonstriert alle Features

## Kalender-Integration

Das Portal setzt nur Notion-Felder. Die echte Kalender-Erstellung erfolgt über:

```bash
/home/peter/.hermes/scripts/culture_radar_calendar_sync.py
```

**Workflow:**
1. Portal: `CalendarWanted = true` setzen
2. Sync-Job: Google Calendar Termin erstellen
3. Sync-Job: `CalendarCreated = true`, `CalendarEventId` setzen