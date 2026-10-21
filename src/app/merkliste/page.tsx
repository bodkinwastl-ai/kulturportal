"use client";

import { useState } from "react";
import { useEvents } from "@/lib/use-events";
import { cn, isUpcoming } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { EventDetailDrawer } from "@/components/event-detail-drawer";
import { ToastNotice } from "@/components/toast-notice";

const byDate = (a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime();

/** "anna@x.at (21.10.), bert@y.at" -> ["anna@x.at (21.10.)", "bert@y.at"] */
const recipients = (invitees?: string) =>
  (invitees || "").split(",").map((s) => s.trim()).filter(Boolean);

export default function MerklistePage() {
  const {
    events, loading, notionConnected, notice, dismissNotice,
    handleStatusChange, handleCalendarToggle, handleInviteesChange,
    handleRatingChange, handlePersonalNoteChange,
  } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [onlyUnsent, setOnlyUnsent] = useState(false);

  // Sending a tip moves an event to "Einladen", so both statuses belong on the list
  const marked = events
    .filter((e) => (e.status === "Interessant" || e.status === "Einladen") && isUpcoming(e.date))
    .sort(byDate);
  const unsentCount = marked.filter((e) => recipients(e.invitees).length === 0).length;
  const shown = onlyUnsent ? marked.filter((e) => recipients(e.invitees).length === 0) : marked;

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  return (
    <AppShell notionConnected={notionConnected}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Merkliste</h1>
            <p className="page-meta">
              {marked.length} {marked.length === 1 ? "Event" : "Events"} als interessant markiert · {unsentCount} noch an niemanden geschickt
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={onlyUnsent}
              onChange={(e) => setOnlyUnsent(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Nur noch nicht weitergeleitet
          </label>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center" role="status" aria-label="Lädt">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : shown.length === 0 ? (
          <p className="text-muted-foreground">
            {onlyUnsent ? "Alles Markierte ist schon weitergeleitet." : "Noch nichts als interessant markiert."}
          </p>
        ) : (
          <ul className="space-y-2">
            {shown.map((event) => {
              const sentTo = recipients(event.invitees);
              const date = new Date(event.date);
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
                    className="enterprise-card flex w-full flex-col gap-2 px-4 py-3 text-left sm:flex-row sm:items-center sm:gap-6"
                  >
                    <span className="min-w-0 sm:flex-1">
                      <span className="block truncate font-medium text-foreground">{event.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[
                          date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" }).replace(".,", ","),
                          event.venue,
                          event.city,
                        ].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5 sm:max-w-[45%] sm:justify-end">
                      <span className="text-xs text-muted-foreground">Geschickt an</span>
                      {sentTo.length === 0 ? (
                        <span className="text-xs text-muted-foreground">noch an niemanden</span>
                      ) : (
                        sentTo.map((r) => (
                          <span
                            key={r}
                            className={cn("rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground")}
                          >
                            {r}
                          </span>
                        ))
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
      <ToastNotice notice={notice} onDismiss={dismissNotice} />
    </AppShell>
  );
}
