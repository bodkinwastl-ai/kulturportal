"use client";

import { CultureEvent, CultureEventStatus } from "@/lib/types";
import { StatusPill } from "./status-pill";
import { Button } from "./ui/button";
import { Calendar, CalendarCheck, Check, Users, Star, ExternalLink, Clock, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryColor } from "@/lib/category-colors";

interface EventCardProps {
  event: CultureEvent;
  onClick: () => void;
  onStatusChange: (status: CultureEventStatus) => void;
  onCalendarToggle: () => void;
}

export function EventCard({ event, onClick, onStatusChange, onCalendarToggle }: EventCardProps) {
  const eventDate = new Date(event.date);
  const now = new Date();
  const isToday = eventDate.toDateString() === now.toDateString();
  const isPast = eventDate < now && !isToday;

  const day = eventDate.getDate();
  const month = eventDate.toLocaleString("de-DE", { month: "short" }).replace(".", "");
  const weekday = eventDate.toLocaleString("de-DE", { weekday: "short" }).replace(".", "");
  const time = eventDate.toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit" });

  const place = [
    event.venue,
    event.city && event.city !== event.venue ? event.city : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  const showTriage = event.status === "Neu";
  const showCalendar = event.status === "Neu" || event.status === "Interessant";
  const visibleCategories = event.categories.slice(1, 3);
  const extraCategories = event.categories.length - 1 - visibleCategories.length;

  return (
    <article
      className={cn(
        "enterprise-card group relative flex h-full cursor-pointer flex-col overflow-hidden p-4 sm:p-5",
        isToday && "border-accent",
        isPast && "opacity-70"
      )}
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Date tile */}
        <div className="flex w-12 shrink-0 flex-col items-center pt-0.5 text-center" aria-hidden="true">
          <span className={cn("font-display text-3xl font-semibold leading-none", isToday ? "text-accent" : "text-foreground")}>
            {day}
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{month}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {event.categories[0] && (
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className={cn("h-2 w-2 rounded-sm", categoryColor(event.categories[0]).bar)} aria-hidden="true" />
                {event.categories[0]}
              </span>
            )}
            <StatusPill status={event.status} size="sm" />
            {isToday && <span className="text-xs font-semibold text-accent">Heute</span>}
          </div>

          <h3 className="font-display text-lg font-semibold leading-snug text-balance text-foreground">
            <button
              type="button"
              onClick={stop(onClick)}
              className="line-clamp-2 text-left transition-colors group-hover:text-accent"
            >
              {event.title}
            </button>
          </h3>

          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span><span className="capitalize">{weekday}</span>, {time} Uhr</span>
          </p>
          {place && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{place}</span>
            </p>
          )}
        </div>
      </div>

      {event.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      )}

      {/* Facts: categories left, price + rating right; wraps on narrow cards */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <ul className="flex flex-wrap gap-1.5" aria-label="Kategorien">
          {visibleCategories.map((category) => (
            <li key={category} className={cn("rounded-md px-2 py-0.5 text-xs font-medium", categoryColor(category).chip)}>
              {category}
            </li>
          ))}
          {extraCategories > 0 && (
            <li className="rounded-md px-1 py-0.5 text-xs text-muted-foreground">+{extraCategories}</li>
          )}
        </ul>
        <div className="flex items-center gap-3 text-sm">
          {event.price && <span className="font-semibold text-foreground">{event.price}</span>}
          {event.rating ? (
            <span className="flex items-center gap-1 text-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
              <span className="sr-only">Bewertung</span>
              {event.rating}/5
            </span>
          ) : null}
        </div>
      </div>

      {/* Actions: stable structure, wraps instead of overlapping */}
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          {showTriage && (
            <>
              <Button size="sm" onClick={stop(() => onStatusChange("Interessant"))} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Interessant
              </Button>
              <Button size="sm" variant="ghost" onClick={stop(() => onStatusChange("Ignorieren"))} className="text-muted-foreground">
                <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Ignorieren
              </Button>
            </>
          )}
          {showCalendar && (
            <Button
              size="sm"
              variant="outline"
              aria-pressed={!!event.calendarWanted}
              onClick={stop(onCalendarToggle)}
              className={cn(event.calendarWanted && "border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100")}
            >
              {event.calendarWanted ? (
                <CalendarCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />
              ) : (
                <Calendar className="mr-1.5 h-4 w-4" aria-hidden="true" />
              )}
              Kalender
            </Button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            {event.url ? <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
            <span className="truncate">{event.sourceName}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {event.calendarWanted && <CalendarCheck className="h-3.5 w-3.5 text-teal-700" aria-label="Für Kalender markiert" />}
            {event.invitees && <Users className="h-3.5 w-3.5 text-violet-700" aria-label="Einladungen" />}
          </span>
        </div>
      </div>
    </article>
  );
}
