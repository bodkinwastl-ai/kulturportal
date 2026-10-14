# Kulturprogramm-Portal Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a private Kultur Radar decision cockpit that reads Notion events, presents them beautifully, and lets Peter decide what to ignore, track, invite people to, or mark for calendar sync.

**Architecture:** Next.js App Router with server-side Notion access, a mock-data fallback while Notion access is blocked, and a cockpit UI optimized for event triage. Google Calendar creation stays in the existing sync job; the portal only updates Notion control fields.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, shadcn/Radix-style components, Notion API, existing Google Calendar sync script.

---

## Current Context

Source docs:

- `/home/peter/projects/kulturportal/BRIEFING.md`
- `/home/peter/projects/kulturportal/IMPLEMENTATION_PROMPT.md`

Known blocker:

- Notion currently returns `404 object_not_found` for the Kultur Radar databases. Build mock fallback first.

## Task 1: Scaffold the app

**Objective:** Create a Next.js TypeScript app with Tailwind and a clean base layout.

**Files:**

- Create project under `/home/peter/projects/kulturportal/app` or another agreed repo path
- Create base app files

**Steps:**

1. Scaffold Next.js with TypeScript and Tailwind.
2. Add base CSS tokens for the Kultur Radar palette.
3. Create `AppShell` with dark blue navigation and warm offwhite content area.
4. Run `npm run dev` and verify the empty dashboard loads.

**Verification:**

```bash
npm run lint
npm run build
```

## Task 2: Define event data model and mock data

**Objective:** Make the UI independent from Notion’s raw API shape.

**Files:**

- `lib/types.ts`
- `lib/mock-events.ts`

**Steps:**

1. Define `CultureEventStatus` and `CultureEvent`.
2. Create 12-20 realistic mock events across OÖ, Wien, Salzburg and Graz.
3. Include varied statuses: Neu, Interessant, Kalender, Einladen, Ignorieren, Gebucht.
4. Include sample invitees, price, categories and descriptions.

**Verification:**

- TypeScript compiles.
- Mock events cover all UI states.

## Task 3: Build dashboard UI

**Objective:** Show top-level triage view with stats and new events first.

**Files:**

- `app/page.tsx`
- `components/event-card.tsx`
- `components/status-pill.tsx`

**Steps:**

1. Render stat cards: Neu, Interessant, Kalender, Einladen, diese Woche.
2. Sort events so Neu appears first, then soonest active events.
3. Build dense event cards with date, title, city, venue, categories, source and status.
4. Add primary action buttons.

**Verification:**

- Neu events are visibly at top.
- Ignorieren/Gebucht are not prominent in default dashboard.

## Task 4: Add filters and search

**Objective:** Let Peter narrow events quickly.

**Files:**

- `components/event-filters.tsx`
- `app/events/page.tsx`

**Steps:**

1. Add filter state for region, city, category, status.
2. Add text search over title, description, city and venue.
3. Add sort options: date, status, rating.
4. Create full Events page.

**Verification:**

- Filters combine correctly.
- Empty state appears if no events match.

## Task 5: Add detail drawer

**Objective:** Let Peter inspect and edit one event without leaving the list.

**Files:**

- `components/event-detail-drawer.tsx`
- `components/rating-control.tsx`
- `components/invitees-editor.tsx`

**Steps:**

1. Open drawer from card click.
2. Show complete event details.
3. Add editable invitees field.
4. Add rating and personal note UI.
5. Add original source link.

**Verification:**

- Drawer opens and closes reliably.
- Mobile layout remains usable.

## Task 6: Implement local action state

**Objective:** Make the MVP feel real before Notion writes are live.

**Files:**

- `lib/culture-events.ts`
- relevant page/components

**Steps:**

1. Centralize event state in the page or a lightweight store.
2. Implement optimistic updates for status, calendarWanted, invitees, rating and note.
3. Add error rollback path placeholder.
4. Show toast or inline status after action.

**Verification:**

- Clicking Interessant/Ignorieren/Kalender updates UI instantly.
- Calendar action sets `calendarWanted = true` but does not create calendar events.

## Task 7: Add Notion API integration

**Objective:** Prepare live data read/write from Notion.

**Files:**

- `lib/notion.ts`
- `app/api/events/route.ts`
- `app/api/events/[id]/route.ts`

**Steps:**

1. Read `NOTION_TOKEN` server-side.
2. Query Events DB.
3. Map raw Notion pages to `CultureEvent`.
4. PATCH Notion fields for actions.
5. Catch 404 and return structured `notionUnavailable` response.
6. Keep mock fallback in UI.

**Verification:**

- With current Notion 404, app falls back to mock data and shows warning.
- No token leaks to browser bundle.

## Task 8: Polish design and states

**Objective:** Make it feel like Peter’s cockpit, not a generic template.

**Files:**

- UI components and global styles

**Steps:**

1. Apply palette consistently.
2. Tighten card hierarchy and spacing.
3. Add loading skeletons.
4. Add empty/error states.
5. Audit visible copy for clarity.
6. Check desktop and mobile.

**Verification:**

```bash
npm run lint
npm run build
```

Manual checks:

- Dashboard readable at desktop.
- Mobile not broken.
- Actions visible and understandable.
- No direct calendar creation.

## Decisions

1. Deployment target: Vercel.
2. Access scope: private-only for Peter in v1.
3. Notion may be extended with `Rating`, `PersonalNote`, `LastReviewedAt` and optional `WhyRecommended`.
4. „Einladen“ should trigger calendar creation through the existing sync flow: set `CalendarWanted = true`, `Status = Einladen`, and `Invitees`; do not call Google Calendar directly from the portal.
5. Visual direction: new, hip, dynamic, elegant, fancy. Premium personal culture cockpit, not generic admin dashboard.

## Decisions, continued

6. Private access method for v1: Basic Auth.
7. Invitees: free text field, but remember recently used invitees and offer them as suggestions. Use localStorage for v1 unless a server-side store is already available.

## Remaining Open Questions

None for MVP scope.
