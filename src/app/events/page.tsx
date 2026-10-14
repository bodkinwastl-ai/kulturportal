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
    handleStatusChange, handleCalendarToggle, handleInviteesChange,
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell notionConnected={notionConnected}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Alle Events</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vollständige Liste aller gefundenen Kulturveranstaltungen
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
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
            <div className="flex border border-slate-200 rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
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
          />
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Keine Events gefunden</h3>
            <p className="text-slate-600">
              {events.length === 0 
                ? "Noch keine Events vorhanden" 
                : "Versuche andere Filter oder Suchbegriffe"}
            </p>
          </div>
        )}
        
        {/* Results Summary */}
        {events.length > 0 && (
          <div className="text-sm text-slate-600 text-center py-4 border-t border-slate-200">
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