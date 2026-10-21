"use client";

import { useState } from "react";
import { CultureEvent, CultureEventStatus } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { StatusPill } from "./status-pill";
import { ShareEventForm } from "./share-event-form";
import { categoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { Calendar, CalendarCheck, Check, Clock, Edit3, ExternalLink, MapPin, Star, Users, X } from "lucide-react";

interface EventDetailDrawerProps {
  event: CultureEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: CultureEventStatus) => void;
  onCalendarToggle: () => void;
  onInviteesChange: (invitees: string) => void;
  onRatingChange: (rating: number) => void;
  onPersonalNoteChange: (note: string) => void;
}

const STATUS_CHOICES: { status: CultureEventStatus; label: string }[] = [
  { status: "Interessant", label: "Interessant" },
  { status: "Kalender", label: "Kalender" },
  { status: "Einladen", label: "Einladen" },
  { status: "Gebucht", label: "Gebucht" },
  { status: "Ignorieren", label: "Ignorieren" },
];

/** Click-to-edit single-line field used for note and invitees. */
function InlineField({
  label,
  icon,
  value,
  empty,
  placeholder,
  onSave,
}: {
  label: string;
  icon?: React.ReactNode;
  value?: string;
  empty: string;
  placeholder: string;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 eyebrow">
          {icon}
          {label}
        </span>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            aria-label={`${label} bearbeiten`}
            onClick={() => {
              setDraft(value || "");
              setEditing(true);
            }}
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      {editing ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(draft);
            setEditing(false);
          }}
        >
          <Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1" />
          <Button type="submit" size="icon" aria-label="Speichern">
            <Check className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button type="button" size="icon" variant="outline" aria-label="Abbrechen" onClick={() => setEditing(false)}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      ) : (
        <p className={cn("text-sm", value ? "text-foreground" : "text-muted-foreground")}>{value || empty}</p>
      )}
    </div>
  );
}

export function EventDetailDrawer({
  event,
  open,
  onOpenChange,
  onStatusChange,
  onCalendarToggle,
  onInviteesChange,
  onRatingChange,
  onPersonalNoteChange,
}: EventDetailDrawerProps) {
  if (!event) return null;

  const date = new Date(event.date);
  const isPast = date < new Date() && date.toDateString() !== new Date().toDateString();
  const when = date.toLocaleString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const place = [event.venue, event.city, event.region && event.region !== event.city ? event.region : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl gap-0 overflow-y-auto rounded-lg border-border bg-background p-0">
        {/* Header */}
        <DialogHeader className="space-y-3 border-b border-border p-5 pr-12 sm:p-6 sm:pr-14">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {event.categories[0] && (
              <span className="flex items-center gap-1.5 eyebrow">
                <span className={cn("h-2 w-2 rounded-sm", categoryColor(event.categories[0]).bar)} aria-hidden="true" />
                {event.categories[0]}
              </span>
            )}
            <StatusPill status={event.status} size="sm" />
            {isPast && <span className="text-xs font-medium text-amber-700">Vergangen</span>}
          </div>
          <DialogTitle className="font-display text-2xl font-semibold leading-tight text-balance text-foreground">
            {event.title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{when} Uhr</span>
              </p>
              {place && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {place}
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          {/* Actions first on mobile (forwarding stays near the top), right column on desktop */}
          <aside className="space-y-5 md:order-2">
            <div className="space-y-4 rounded-lg border border-border bg-card p-4">
              <ShareEventForm event={event} onInvited={onInviteesChange} />
            </div>

            <div className="grid gap-2">
              <Button
                variant="outline"
                aria-pressed={event.calendarWanted}
                onClick={onCalendarToggle}
                className={cn(event.calendarWanted && "border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100")}
              >
                {event.calendarWanted ? (
                  <CalendarCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                ) : (
                  <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {event.calendarCreated ? "Im Kalender erstellt" : event.calendarWanted ? "Für Kalender vorgemerkt" : "In Kalender übernehmen"}
              </Button>
              {event.url && (
                <Button asChild variant="outline">
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                    Original ansehen
                  </a>
                </Button>
              )}
            </div>
          </aside>

          <div className="min-w-0 space-y-5 md:order-1">
            {/* Status */}
            <div>
              <div className="mb-2 eyebrow">Status</div>
              <div role="group" aria-label="Status ändern" className="flex flex-wrap gap-2">
                {STATUS_CHOICES.map(({ status, label }) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={event.status === status ? "default" : "outline"}
                    aria-pressed={event.status === status}
                    onClick={() => onStatusChange(status)}
                    className={cn(event.status === status && "bg-primary text-primary-foreground")}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {event.description && <p className="text-sm leading-relaxed text-foreground">{event.description}</p>}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {event.categories.length > 1 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Kategorien">
                  {event.categories.slice(1).map((category) => (
                    <li key={category} className={cn("rounded-md px-2 py-0.5 text-xs font-medium", categoryColor(category).chip)}>
                      {category}
                    </li>
                  ))}
                </ul>
              )}
              {event.price && <span className="text-sm font-semibold text-foreground">{event.price}</span>}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <span className="eyebrow">Bewertung</span>
              <div className="flex gap-0.5" role="group" aria-label="Bewertung">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star)}
                    aria-label={`${star} von 5 Sternen`}
                    aria-pressed={star <= (event.rating || 0)}
                    className="rounded p-1 transition-transform duration-150 active:scale-90"
                  >
                    <Star
                      className={cn(
                        "h-5 w-5 transition-colors duration-150",
                        star <= (event.rating || 0) ? "fill-amber-400 text-amber-500" : "text-stone-300 [@media(hover:hover)]:hover:text-amber-400"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <InlineField
              label="Notiz"
              value={event.personalNote}
              empty="Keine Notiz"
              placeholder="Notiz eingeben…"
              onSave={onPersonalNoteChange}
            />
            <InlineField
              label="Einladungen"
              icon={<Users className="h-4 w-4" aria-hidden="true" />}
              value={event.invitees}
              empty="Keine Einladungen"
              placeholder="E-Mail-Adressen oder Namen, durch Komma getrennt…"
              onSave={onInviteesChange}
            />

            {event.sourceName && <p className="border-t border-border pt-4 text-xs text-muted-foreground">Quelle: {event.sourceName}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
