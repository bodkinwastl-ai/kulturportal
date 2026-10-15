"use client";

import { CultureEvent } from "@/lib/types";
import { EventChip } from "./event-chip";
import { addDays, isSameDay, cn } from "@/lib/utils";

interface WeekGridProps {
  weekStart: Date;
  events: CultureEvent[];
  onOpen: (event: CultureEvent) => void;
}

/** 7 columns from lg up; one block per day below. */
export function WeekGrid({ weekStart, events, onOpen }: WeekGridProps) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="grid gap-6 lg:grid-cols-7 lg:gap-3">
      {days.map((day) => {
        const isToday = isSameDay(day, today);
        const isPastDay = day < startOfToday;
        const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
        const weekday = day.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "");
        const longLabel = day.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });

        return (
          <section key={day.toISOString()} aria-label={longLabel} className={cn("min-w-0", isPastDay && "opacity-50")}>
            <header
              className={cn(
                "mb-2 flex items-baseline gap-2 border-b pb-2 lg:flex-col lg:items-start lg:gap-0",
                isToday ? "border-accent" : "border-border"
              )}
            >
              <span className={cn("text-xs font-medium uppercase tracking-wider", isToday ? "text-accent" : "text-muted-foreground")}>
                {weekday}
              </span>
              <span className={cn("font-display text-2xl font-semibold leading-none", isToday ? "text-accent" : "text-foreground")}>
                {day.getDate()}
                <span className="ml-2 text-sm font-normal text-muted-foreground lg:hidden">
                  {day.toLocaleDateString("de-DE", { month: "long" })}
                </span>
              </span>
            </header>
            <div className="space-y-2">
              {dayEvents.length > 0 ? (
                dayEvents.map((event) => <EventChip key={event.id} event={event} onOpen={() => onOpen(event)} />)
              ) : (
                <p className="py-1 text-sm text-muted-foreground lg:hidden">Keine Events</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
