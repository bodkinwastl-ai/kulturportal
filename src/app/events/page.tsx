"use client";

import { useState } from "react";
import { CultureEventStatus } from "@/lib/types";
import { useEvents } from "@/lib/use-events";
import { isUpcoming } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { EventGroups } from "@/components/event-groups";
import { ToastNotice } from "@/components/toast-notice";
import { EventDetailDrawer } from "@/components/event-detail-drawer";
import { EventFilters } from "@/components/event-filters";
import { Button } from "@/components/ui/button";
import { Calendar, Grid, List } from "lucide-react";

type SortOption = "date" | "status" | "rating";

export default function EventsPage() {
  const {
    events, loading, notionConnected, notice, dismissNotice,
    handleStatusChange, handleCalendarToggle, handleInviteesChange, handleMerge,
    handleRatingChange, handlePersonalNoteChange,
  } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CultureEventStatus[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showPast, setShowPast] = useState(false);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;
  const pastCount = events.filter((e) => !isUpcoming(e.date)).length;

  // Filter events
  const filteredEvents = events.filter(event => {
    if (!showPast && !isUpcoming(event.date)) return false;
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.venue?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (selectedRegions.length > 0 && event.region && !selectedRegions.includes(event.region)) {
      return false;
    }
    
    if (selectedCategories.length > 0 && !event.categories.some(cat => selectedCategories.includes(cat))) {
      return false;
    }
    
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(event.status)) {
      return false;
    }
    
    return true;
  });
  
  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "status":
        const statusOrder = ["Neu", "Interessant", "Kalender", "Einladen", "Gebucht", "Vielleicht", "Ignorieren"];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });
  
  const availableRegions = Array.from(new Set(events.map(e => e.region).filter(Boolean))) as string[];
  const availableCategories = Array.from(new Set(events.flatMap(e => e.categories)));
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegions([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
  };
  
  if (loading) {
    return (
      <AppShell notionConnected={notionConnected}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell notionConnected={notionConnected}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Alle Events</h1>
            <p className="page-meta">
              Vollständige Liste aller gefundenen Kulturveranstaltungen
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-muted-foreground">Sortierung</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 rounded-md border border-input bg-card px-2 text-sm"
              >
                <option value="date">Datum</option>
                <option value="status">Status</option>
                <option value="rating">Bewertung</option>
              </select>
            </div>
            
            {pastCount > 0 && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showPast}
                  onChange={(e) => setShowPast(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Vergangene ({pastCount})
              </label>
            )}

            {/* View Mode Toggle */}
            {/* View is a setting, not an action: active state is a tint, never the solid primary */}
            <div role="group" aria-label="Ansicht" className="flex overflow-hidden rounded-md border border-input bg-card">
              {([
                { mode: "grid", label: "Raster", icon: Grid },
                { mode: "list", label: "Liste", icon: List },
              ] as const).map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  aria-label={label}
                  aria-pressed={viewMode === mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex h-10 w-10 items-center justify-center transition-colors ${
                    viewMode === mode ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <EventFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedRegions={selectedRegions}
          onRegionsChange={setSelectedRegions}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          selectedStatuses={selectedStatuses}
          onStatusesChange={setSelectedStatuses}
          availableRegions={availableRegions}
          availableCategories={availableCategories}
          onClearFilters={clearFilters}
        />
        
        {/* Events Display */}
        {sortedEvents.length > 0 ? (
          <EventGroups
            events={sortedEvents}
            grouped={sortBy === "date"}
            layout={viewMode}
            onOpen={(event) => setSelectedEventId(event.id)}
            onStatusChange={handleStatusChange}
            onCalendarToggle={handleCalendarToggle}
            onMerge={handleMerge}
          />
        ) : (
          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <h3 className="mb-1 text-lg font-medium text-foreground">Keine Events gefunden</h3>
            <p className="text-sm text-muted-foreground">
              {events.length === 0 
                ? "Noch keine Events vorhanden" 
                : "Versuche andere Filter oder Suchbegriffe"}
            </p>
          </div>
        )}
        
        {/* Results Summary */}
        {events.length > 0 && (
          <div className="border-t border-border py-4 text-center text-sm text-muted-foreground">
            {filteredEvents.length} von {events.length} Events angezeigt
          </div>
        )}
        
        {/* Event Detail Drawer */}
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