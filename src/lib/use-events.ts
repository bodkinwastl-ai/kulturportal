"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CultureEvent, CultureEventStatus } from "@/lib/types";
import { dedupeEvents } from "@/lib/dedupe";

export type Notice = {
  id: number;
  kind: "ok" | "error";
  message: string;
  undo?: () => void;
};

/** Loads events and owns every write: optimistic update, rollback on error, undo. */
export function useEvents() {
  const [rawEvents, setEvents] = useState<CultureEvent[]>([]);
  const events = useMemo(() => dedupeEvents(rawEvents), [rawEvents]);
  const [loading, setLoading] = useState(true);
  const [notionConnected, setNotionConnected] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeId = useRef(0);
  const eventsRef = useRef(rawEvents);
  useEffect(() => {
    eventsRef.current = rawEvents;
  }, [rawEvents]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setEvents(data.events || []);
        setNotionConnected(data.notionConnected || false);
      })
      .catch((error) => console.error("Error loading events:", error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const show = (n: Omit<Notice, "id">) => setNotice({ ...n, id: ++noticeId.current });

  const apply = (id: string, updates: Partial<CultureEvent>) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));

  async function update(eventId: string, updates: Partial<CultureEvent>, okMessage?: string) {
    const before = eventsRef.current.find((e) => e.id === eventId);
    if (!before) return;
    const previous = Object.fromEntries(
      (Object.keys(updates) as (keyof CultureEvent)[]).map((k) => [k, before[k]])
    ) as Partial<CultureEvent>;

    apply(eventId, updates);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Fehler ${response.status}`);
      }
      if (okMessage) {
        show({
          kind: "ok",
          message: okMessage,
          undo: () => update(eventId, previous, "Rückgängig gemacht"),
        });
      }
    } catch (error) {
      apply(eventId, previous);
      show({
        kind: "error",
        message: `Speichern fehlgeschlagen: ${error instanceof Error ? error.message : "unbekannter Fehler"}`,
      });
    }
  }

  const statusMessage: Record<string, string> = {
    Interessant: "Als interessant markiert",
    Ignorieren: "Event ignoriert",
    Kalender: "Für Kalender vorgemerkt",
    Einladen: "Zum Einladen vorgemerkt",
    Gebucht: "Als gebucht markiert",
    Vielleicht: "Als vielleicht markiert",
  };

  const handleStatusChange = (eventId: string, status: CultureEventStatus) => {
    const updates: Partial<CultureEvent> = { status };
    if (status === "Kalender" || status === "Einladen") updates.calendarWanted = true;
    update(eventId, updates, statusMessage[status] ?? `Status: ${status}`);
  };

  const handleCalendarToggle = (eventId: string) => {
    const event = eventsRef.current.find((e) => e.id === eventId);
    if (!event) return;
    const wanted = !event.calendarWanted;
    update(
      eventId,
      { calendarWanted: wanted, status: wanted && event.status === "Neu" ? "Interessant" : event.status },
      wanted ? "Für Kalender vorgemerkt" : "Kalender-Markierung entfernt"
    );
  };

  const handleInviteesChange = (eventId: string, invitees: string) => {
    const event = eventsRef.current.find((e) => e.id === eventId);
    const status = event?.status ?? "Neu";
    update(eventId, {
      invitees,
      status: invitees && !["Einladen", "Gebucht"].includes(status) ? "Einladen" : status,
    });
  };

  /** Hides the duplicate and carries over what the user entered on it (rating, note, invitees) if the target has none. */
  const handleMerge = (duplicateId: string, targetId: string) => {
    const dup = eventsRef.current.find((e) => e.id === duplicateId);
    const target = eventsRef.current.find((e) => e.id === targetId);
    if (dup && target) {
      const carry: Partial<CultureEvent> = {};
      if (dup.rating && !target.rating) carry.rating = dup.rating;
      if (dup.personalNote && !target.personalNote) carry.personalNote = dup.personalNote;
      if (dup.invitees && !target.invitees) carry.invitees = dup.invitees;
      if (Object.keys(carry).length) update(targetId, carry);
    }
    update(duplicateId, { status: "Ignorieren" }, "Duplikat zusammengeführt");
  };

  return {
    events,
    loading,
    notionConnected,
    notice,
    dismissNotice: () => setNotice(null),
    handleStatusChange,
    handleCalendarToggle,
    handleInviteesChange,
    handleMerge,
    handleRatingChange: (eventId: string, rating: number) => update(eventId, { rating }),
    handlePersonalNoteChange: (eventId: string, personalNote: string) => update(eventId, { personalNote }),
  };
}
