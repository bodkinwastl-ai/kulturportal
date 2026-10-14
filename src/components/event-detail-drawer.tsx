"use client";

import { CultureEvent, CultureEventStatus } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { StatusPill } from "./status-pill";
import { 
  Calendar, 
  Users, 
  Star, 
  ExternalLink, 
  MapPin, 
  Clock,
  Tag,
  Edit3,
  Check,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

export function EventDetailDrawer({
  event,
  open,
  onOpenChange,
  onStatusChange,
  onCalendarToggle,
  onInviteesChange,
  onRatingChange,
  onPersonalNoteChange
}: EventDetailDrawerProps) {
  const [isEditingInvitees, setIsEditingInvitees] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempInvitees, setTempInvitees] = useState("");
  const [tempNote, setTempNote] = useState("");
  const [recentInvitees, setRecentInvitees] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("kulturportal.recentInvitees");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  if (!event) return null;
  
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  const statusActions = [
    { status: "Interessant" as CultureEventStatus, label: "Interessant", color: "text-green-700 border-green-200 hover:bg-green-50" },
    { status: "Kalender" as CultureEventStatus, label: "In Kalender", color: "text-purple-700 border-purple-200 hover:bg-purple-50" },
    { status: "Einladen" as CultureEventStatus, label: "Einladen", color: "text-orange-700 border-orange-200 hover:bg-orange-50" },
    { status: "Gebucht" as CultureEventStatus, label: "Gebucht", color: "text-emerald-700 border-emerald-200 hover:bg-emerald-50" },
    { status: "Ignorieren" as CultureEventStatus, label: "Ignorieren", color: "text-gray-600 border-gray-200 hover:bg-gray-50" },
  ];
  
  const startEditingInvitees = () => {
    setTempInvitees(event.invitees || "");
    setIsEditingInvitees(true);
  };
  
  const saveInvitees = () => {
    const trimmedInvitees = tempInvitees.trim();
    if (trimmedInvitees) {
      const nextRecent = [
        trimmedInvitees,
        ...recentInvitees.filter((item) => item !== trimmedInvitees),
      ].slice(0, 6);
      setRecentInvitees(nextRecent);
      window.localStorage.setItem("kulturportal.recentInvitees", JSON.stringify(nextRecent));
    }
    onInviteesChange(tempInvitees);
    setIsEditingInvitees(false);
  };
  
  const cancelEditingInvitees = () => {
    setIsEditingInvitees(false);
    setTempInvitees("");
  };
  
  const startEditingNote = () => {
    setTempNote(event.personalNote || "");
    setIsEditingNote(true);
  };
  
  const saveNote = () => {
    onPersonalNoteChange(tempNote);
    setIsEditingNote(false);
  };
  
  const cancelEditingNote = () => {
    setIsEditingNote(false);
    setTempNote("");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900 pr-8">
              {event.title}
            </DialogTitle>
            <StatusPill status={event.status} />
          </div>
          
          <div className="flex items-center text-slate-600 space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatDate(event.date)}</span>
            </div>
            {!isUpcoming && (
              <span className="text-sm text-amber-600 font-medium">Vergangen</span>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Venue und Location */}
          {(event.venue || event.city) && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                {event.venue && (
                  <div className="font-medium text-slate-900">{event.venue}</div>
                )}
                <div className="text-slate-600">
                  {event.city}{event.region && event.region !== event.city ? `, ${event.region}` : ""}
                </div>
              </div>
            </div>
          )}
          
          {/* Kategorien */}
          {event.categories.length > 0 && (
            <div className="flex items-start space-x-3">
              <Tag className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex flex-wrap gap-2">
                {event.categories.map((category, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-md"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Beschreibung */}
          {event.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed">{event.description}</p>
            </div>
          )}
          
          {/* Preis */}
          {event.price && (
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="font-semibold text-slate-900">Preis: {event.price}</div>
            </div>
          )}
          
          {/* Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Bewertung</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRatingChange(star)}
                    className={cn(
                      "w-6 h-6 transition-colors",
                      star <= (event.rating || 0) 
                        ? "text-yellow-500 hover:text-yellow-600" 
                        : "text-slate-300 hover:text-yellow-400"
                    )}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Personal Note */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Persönliche Notiz</label>
              {!isEditingNote && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startEditingNote}
                  className="h-8 px-2"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {isEditingNote ? (
              <div className="space-y-2">
                <Input
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  placeholder="Notiz eingeben..."
                  className="w-full"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={saveNote}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditingNote}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[2.5rem] px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-700">
                {event.personalNote || "Keine Notiz"}
              </div>
            )}
          </div>
          
          {/* Invitees */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Einladungen
              </label>
              {!isEditingInvitees && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startEditingInvitees}
                  className="h-8 px-2"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {isEditingInvitees ? (
              <div className="space-y-2">
                <Input
                  value={tempInvitees}
                  onChange={(e) => setTempInvitees(e.target.value)}
                  placeholder="E-Mail-Adressen oder Namen, durch Komma getrennt..."
                  className="w-full"
                />
                {recentInvitees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recentInvitees.map((invitee) => (
                      <button
                        key={invitee}
                        type="button"
                        onClick={() => setTempInvitees(invitee)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                      >
                        {invitee}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button size="sm" onClick={saveInvitees}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditingInvitees}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[2.5rem] px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-700">
                {event.invitees || "Keine Einladungen"}
              </div>
            )}
          </div>
          
          {/* Calendar Status */}
          {(event.calendarWanted || event.calendarCreated) && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-700">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">
                  {event.calendarCreated ? "Im Kalender erstellt" : "Für Kalender vorgemerkt"}
                </span>
              </div>
              {event.calendarEventId && (
                <div className="text-xs text-purple-600 mt-1">
                  Event ID: {event.calendarEventId}
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <div className="text-sm font-medium text-slate-700 mb-3">Status ändern</div>
              <div className="flex flex-wrap gap-2">
                {statusActions.map(({ status, label, color }) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(status)}
                    className={cn(
                      color,
                      event.status === status && "ring-2 ring-current ring-opacity-20"
                    )}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            
            {!event.calendarWanted && (
              <Button
                onClick={onCalendarToggle}
                className="w-full"
                variant="outline"
              >
                <Calendar className="w-4 h-4 mr-2" />
                In Kalender übernehmen
              </Button>
            )}
            
            {/* External Link */}
            {event.url && (
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <a href={event.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Original ansehen
                </a>
              </Button>
            )}
          </div>
          
          {/* Quelle */}
          {event.sourceName && (
            <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-100">
              Quelle: {event.sourceName}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}