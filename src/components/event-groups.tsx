"use client";

import { CultureEvent, CultureEventStatus } from "@/lib/types";
import { EventCard } from "./event-card";
import { groupByDay } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface EventGroupsProps {
  events: CultureEvent[];
  /** true: one section per day (events must be date-sorted); false: flat list */
  grouped: boolean;
  layout?: "grid" | "list";
  onOpen: (event: CultureEvent) => void;
  onStatusChange: (id: string, status: CultureEventStatus) => void;
  onCalendarToggle: (id: string) => void;
}

export function EventGroups({ events, grouped, layout = "grid", onOpen, onStatusChange, onCalendarToggle }: EventGroupsProps) {
  const gridClass = layout === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4";
  const cards = (list: CultureEvent[]) =>
    list.map((event) => (
      <EventCard
        key={event.id}
        event={event}
        onClick={() => onOpen(event)}
        onStatusChange={(status) => onStatusChange(event.id, status)}
        onCalendarToggle={() => onCalendarToggle(event.id)}
      />
    ));

  if (!grouped) return <div className={gridClass}>{cards(events)}</div>;

  return (
    <div className="space-y-8">
      {groupByDay(events).map((group) => (
        <section key={group.key} aria-labelledby={`day-${group.key}`}>
          <h2
            id={`day-${group.key}`}
            className={cn(
              "mb-3 border-b border-border pb-2 text-xl font-semibold",
              group.label === "Heute" ? "text-accent" : "text-foreground"
            )}
          >
            {group.label}
          </h2>
          <div className={gridClass}>{cards(group.items)}</div>
        </section>
      ))}
    </div>
  );
}
