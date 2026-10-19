"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Search } from "lucide-react";
import { useEvents } from "@/lib/use-events";
import { groupByVenue, isUpcoming } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { EventGroups } from "@/components/event-groups";
import { EventDetailDrawer } from "@/components/event-detail-drawer";
import { ToastNotice } from "@/components/toast-notice";
import { Input } from "@/components/ui/input";

const byDate = (a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime();

function VenuesView() {
  const params = useSearchParams();
  const selectedKey = params.get("ort");
  const {
    events, loading, notionConnected, notice, dismissNotice,
    handleStatusChange, handleCalendarToggle, handleInviteesChange,
    handleRatingChange, handlePersonalNoteChange,
  } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showPast, setShowPast] = useState(false);

  // Ignored events never count; groups are built from all events so a venue keeps its name
  const groups = groupByVenue(events.filter((e) => e.status !== "Ignorieren"));
  const withUpcoming = groups
    .map((g) => ({ ...g, upcoming: g.events.filter((e) => isUpcoming(e.date)).sort(byDate) }))
    .filter((g) => g.upcoming.length > 0);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;
  const drawer = (
    <EventDetailDrawer
      event={selectedEvent}
      open={!!selectedEvent}
      onOpenChange={(open) => !open && setSelectedEventId(null)}
      onStatusChange={(status) => selectedEvent && handleStatusChange(selectedEvent.id, status)}
      onCalendarToggle={() => selectedEvent && handleCalendarToggle(selectedEvent.id)}
      onInviteesChange={(invitees) => selectedEvent && handleInviteesChange(selectedEvent.id, invitees)}
      onRatingChange={(rating) => selectedEvent && handleRatingChange(selectedEvent.id, rating)}
      onPersonalNoteChange={(note) => selectedEvent && handlePersonalNoteChange(selectedEvent.id, note)}
    />
  );

  const spinner = (
    <div className="flex h-64 items-center justify-center" role="status" aria-label="Lädt">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );

  // ---------- Detail ----------
  if (selectedKey) {
    const group = groups.find((g) => g.key === selectedKey);
    const all = (group?.events ?? []).slice().sort(byDate);
    const upcoming = all.filter((e) => isUpcoming(e.date));
    const shown = showPast ? all : upcoming;
    const pastCount = all.length - upcoming.length;

    return (
      <AppShell notionConnected={notionConnected}>
        <div className="space-y-6">
          <Link href="/venues" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Alle Orte
          </Link>

          {loading ? (
            spinner
          ) : !group ? (
            <p className="text-muted-foreground">Dieser Ort ist nicht (mehr) vorhanden.</p>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{group.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[group.city, `${upcoming.length} kommende${upcoming.length === 1 ? "s Event" : " Events"}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {pastCount > 0 && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={showPast}
                      onChange={(e) => setShowPast(e.target.checked)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    Vergangene ({pastCount})
                  </label>
                )}
              </div>

              {shown.length > 0 ? (
                <EventGroups
                  events={shown}
                  grouped
                  onOpen={(event) => setSelectedEventId(event.id)}
                  onStatusChange={handleStatusChange}
                  onCalendarToggle={handleCalendarToggle}
                />
              ) : (
                <p className="text-muted-foreground">Keine kommenden Events an diesem Ort.</p>
              )}
            </>
          )}
          {drawer}
        </div>
        <ToastNotice notice={notice} onDismiss={dismissNotice} />
      </AppShell>
    );
  }

  // ---------- List ----------
  const q = query.trim().toLowerCase();
  const list = withUpcoming
    .filter((g) => !q || `${g.name} ${g.city}`.toLowerCase().includes(q))
    .sort((a, b) => byDate(a.upcoming[0], b.upcoming[0]));

  return (
    <AppShell notionConnected={notionConnected}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Orte</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {withUpcoming.length} {withUpcoming.length === 1 ? "Ort" : "Orte"} mit kommenden Events
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Orte durchsuchen"
            placeholder="Orte durchsuchen…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          spinner
        ) : list.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((g) => {
              const next = new Date(g.upcoming[0].date);
              return (
                <li key={g.key}>
                  <Link
                    href={`/venues?ort=${encodeURIComponent(g.key)}`}
                    className="enterprise-card flex h-full flex-col gap-2 p-4 sm:p-5"
                  >
                    <span className="font-display text-lg font-semibold leading-snug text-foreground">{g.name}</span>
                    {g.city && (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {g.city}
                      </span>
                    )}
                    <span className="mt-auto pt-2 text-sm text-foreground">
                      <strong className="font-semibold">{g.upcoming.length}</strong>{" "}
                      {g.upcoming.length === 1 ? "kommendes Event" : "kommende Events"}
                      <span className="text-muted-foreground">
                        {" · nächstes "}
                        {next.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" }).replace(".,", ",")}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">{q ? "Kein Ort passt zur Suche." : "Noch keine Orte mit kommenden Events."}</p>
        )}
        {drawer}
      </div>
      <ToastNotice notice={notice} onDismiss={dismissNotice} />
    </AppShell>
  );
}

export default function VenuesPage() {
  return (
    <Suspense fallback={null}>
      <VenuesView />
    </Suspense>
  );
}
