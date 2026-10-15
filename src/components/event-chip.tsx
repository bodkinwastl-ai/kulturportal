"use client";

import { CultureEvent } from "@/lib/types";
import { categoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { Star, CalendarCheck, Users } from "lucide-react";

const STATUS_DOT: Record<string, string> = {
  Neu: "bg-orange-600",
  Interessant: "bg-amber-500",
  Kalender: "bg-teal-600",
  Einladen: "bg-violet-600",
  Gebucht: "bg-emerald-600",
  Vielleicht: "bg-stone-400",
};

/** Compact event tile for the week grid. */
export function EventChip({ event, onOpen }: { event: CultureEvent; onOpen: () => void }) {
  const time = new Date(event.date).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const stripe = event.categories[0] ? categoryColor(event.categories[0]).bar : "bg-border";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="enterprise-card relative block w-full overflow-hidden p-2.5 pl-4 text-left"
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", stripe)} aria-hidden="true" />
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[event.status] ?? "bg-stone-400")}
          aria-hidden="true"
        />
        <span className="font-medium">{time} Uhr</span>
        <span className="sr-only">Status {event.status}</span>
        <span className="ml-auto flex items-center gap-1">
          {event.rating ? <Star className="h-3 w-3 fill-amber-400 text-amber-500" aria-label={`${event.rating} von 5`} /> : null}
          {event.calendarWanted && <CalendarCheck className="h-3 w-3 text-teal-700" aria-label="Für Kalender markiert" />}
          {event.invitees && <Users className="h-3 w-3 text-violet-700" aria-label="Einladungen" />}
        </span>
      </span>
      <span className="mt-1 line-clamp-2 block font-display text-sm font-semibold leading-snug text-foreground">
        {event.title}
      </span>
      {event.venue && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{event.venue}</span>}
    </button>
  );
}
