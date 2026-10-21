"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CultureEventStatus } from "@/lib/types";
import { useEvents } from "@/lib/use-events";
import { EventFilters } from "@/components/event-filters";
import { addDays, isUpcoming, parseDateParam, startOfWeek, toDateParam } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { WeekGrid } from "@/components/week-grid";
import { EventDetailDrawer } from "@/components/event-detail-drawer";
import { ToastNotice } from "@/components/toast-notice";
import { Button } from "@/components/ui/button";

function WeekView() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    events, loading, notionConnected, notice, dismissNotice,
    handleStatusChange, handleCalendarToggle, handleInviteesChange,
    handleRatingChange, handlePersonalNoteChange,
  } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CultureEventStatus[]>([]);

  const thisWeek = startOfWeek(new Date());
  const weekStart = startOfWeek(parseDateParam(params.get("week")) ?? thisWeek);
  const weekEnd = addDays(weekStart, 7);
  const isCurrentWeek = toDateParam(weekStart) === toDateParam(thisWeek);

  const go = (start: Date) => router.replace(`/week?week=${toDateParam(start)}`);

  // Filter options come from all upcoming events so they stay stable across weeks
  const upcoming = events.filter((e) => isUpcoming(e.date));
  const availableRegions = Array.from(new Set(upcoming.map((e) => e.region).filter(Boolean))) as string[];
  const availableCategories = Array.from(new Set(upcoming.flatMap((e) => e.categories)));

  const matches = (e: (typeof events)[number]) => {
    const q = searchTerm.trim().toLowerCase();
    if (q && ![e.title, e.description, e.venue].some((v) => v?.toLowerCase().includes(q))) return false;
    if (selectedRegions.length > 0 && e.region && !selectedRegions.includes(e.region)) return false;
    if (selectedCategories.length > 0 && !e.categories.some((c) => selectedCategories.includes(c))) return false;
    // Without a status filter, ignored events stay hidden
    return selectedStatuses.length > 0 ? selectedStatuses.includes(e.status) : e.status !== "Ignorieren";
  };

  const inWeek = upcoming.filter((e) => {
    const d = new Date(e.date);
    return d >= weekStart && d < weekEnd;
  });
  const weekEvents = inWeek
    .filter(matches)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const hasFilters = !!searchTerm || selectedRegions.length + selectedCategories.length + selectedStatuses.length > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegions([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;
  const rangeLabel = `${weekStart.toLocaleDateString("de-DE", { day: "numeric", month: "short" })} – ${addDays(weekStart, 6).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <AppShell notionConnected={notionConnected}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Woche</h1>
            <p className="page-meta">
              {rangeLabel} · {weekEvents.length} {weekEvents.length === 1 ? "Event" : "Events"}
              {hasFilters && inWeek.length !== weekEvents.length && ` von ${inWeek.length}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Vorherige Woche" onClick={() => go(addDays(weekStart, -7))}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="outline" disabled={isCurrentWeek} onClick={() => go(thisWeek)}>
              Diese Woche
            </Button>
            <Button variant="outline" size="icon" aria-label="Nächste Woche" onClick={() => go(addDays(weekStart, 7))}>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <EventFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedRegions={selectedRegions}
          onRegionsChange={setSelectedRegions}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          selectedStatuses={selectedStatuses}
          onStatusesChange={setSelectedStatuses}
          availableRegions={availableRegions}
          availableCategories={availableCategories}
          onClearFilters={clearFilters}
        />

        {!loading && hasFilters && weekEvents.length === 0 && inWeek.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Kein Event dieser Woche passt zu den Filtern ({inWeek.length} ausgeblendet).{" "}
            <button type="button" onClick={clearFilters} className="font-medium text-foreground underline underline-offset-4">
              Filter zurücksetzen
            </button>
          </p>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center" role="status" aria-label="Lädt">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
          <WeekGrid weekStart={weekStart} events={weekEvents} onOpen={(e) => setSelectedEventId(e.id)} />
        )}

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
      </div>
      <ToastNotice notice={notice} onDismiss={dismissNotice} />
    </AppShell>
  );
}

export default function WeekPage() {
  return (
    <Suspense fallback={null}>
      <WeekView />
    </Suspense>
  );
}
