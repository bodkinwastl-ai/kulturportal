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
    <div className="space-y-6">
      {groupByDay(events).map((group) => (
        <section key={group.key} aria-labelledby={`day-${group.key}`}>
          <h2
            id={`day-${group.key}`}
            className={cn(
              "sticky top-14 z-10 -mx-4 mb-3 border-b border-border bg-background px-4 py-2 text-sm font-semibold uppercase tracking-wider sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
              group.label === "Heute" ? "text-accent" : "text-muted-foreground"
            )}
          >
            {group.label}
            <span className="ml-2 font-normal text-muted-foreground">{group.items.length}</span>
          </h2>
          <div className={gridClass}>{cards(group.items)}</div>
        </section>
      ))}
    </div>
  );
}
