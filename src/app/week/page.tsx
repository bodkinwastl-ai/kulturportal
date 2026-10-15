"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEvents } from "@/lib/use-events";
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

  const thisWeek = startOfWeek(new Date());
  const weekStart = startOfWeek(parseDateParam(params.get("week")) ?? thisWeek);
  const weekEnd = addDays(weekStart, 7);
  const isCurrentWeek = toDateParam(weekStart) === toDateParam(thisWeek);

  const go = (start: Date) => router.replace(`/week?week=${toDateParam(start)}`);

  const weekEvents = events
    .filter((e) => isUpcoming(e.date) && e.status !== "Ignorieren")
    .filter((e) => {
      const d = new Date(e.date);
      return d >= weekStart && d < weekEnd;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;
  const rangeLabel = `${weekStart.toLocaleDateString("de-DE", { day: "numeric", month: "short" })} – ${addDays(weekStart, 6).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <AppShell notionConnected={notionConnected}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Woche</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {rangeLabel} · {weekEvents.length} {weekEvents.length === 1 ? "Event" : "Events"}
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
