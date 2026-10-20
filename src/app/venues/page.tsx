"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { useEvents } from "@/lib/use-events";
import { cn, groupByVenue, isUpcoming } from "@/lib/utils";
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
  const [city, setCity] = useState("");
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
  const matching = withUpcoming.filter((g) => !q || `${g.name} ${g.city}`.toLowerCase().includes(q));

  // Cities, busiest first; chips filter the list
  const cityTotals = new Map<string, number>();
  for (const g of matching) {
    const city = g.city || "Ohne Stadt";
    cityTotals.set(city, (cityTotals.get(city) ?? 0) + g.upcoming.length);
  }
  const cities = [...cityTotals.entries()].sort((a, b) => b[1] - a[1]);
  const visibleCities = city ? cities.filter(([c]) => c === city) : cities;

  return (
    <AppShell notionConnected={notionConnected}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Orte</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {withUpcoming.length} {withUpcoming.length === 1 ? "Ort" : "Orte"} mit kommenden Events
          </p>
        </div>

        <div className="space-y-3">
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
          {cities.length > 1 && (
            <div role="group" aria-label="Stadt" className="flex flex-wrap gap-2">
              {[["", matching.reduce((n, g) => n + g.upcoming.length, 0)] as [string, number], ...cities].map(([c, n]) => (
                <button
                  key={c || "all"}
                  type="button"
                  aria-pressed={city === c}
                  onClick={() => setCity(c)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]",
                    city === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card text-foreground hover:bg-secondary"
                  )}
                >
                  {c || "Alle"} <span className={city === c ? "opacity-80" : "text-muted-foreground"}>{n}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          spinner
        ) : visibleCities.length > 0 ? (
          <div className="space-y-6">
            {visibleCities.map(([cityName, total]) => {
              const houses = matching
                .filter((g) => (g.city || "Ohne Stadt") === cityName)
                .sort((a, b) => b.upcoming.length - a.upcoming.length || a.name.localeCompare(b.name, "de"));
              return (
                <section key={cityName} aria-labelledby={`city-${cityName}`}>
                  <h2 id={`city-${cityName}`} className="section-label">
                    {cityName}
                    <span className="font-normal normal-case tracking-normal">
                      {houses.length} {houses.length === 1 ? "Ort" : "Orte"} · {total} {total === 1 ? "Event" : "Events"}
                    </span>
                  </h2>
                  <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {houses.map((g) => {
                      const next = new Date(g.upcoming[0].date);
                      return (
                        <li key={g.key}>
                          <Link
                            href={`/venues?ort=${encodeURIComponent(g.key)}`}
                            className="enterprise-card flex items-center justify-between gap-3 px-4 py-3"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-foreground">{g.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                nächstes{" "}
                                {next.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" }).replace(".,", ",")}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-sm font-semibold text-foreground">
                              {g.upcoming.length}
                              <span className="sr-only"> kommende Events</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
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
