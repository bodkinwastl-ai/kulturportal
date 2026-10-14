"use client";

import { useEffect, useState } from "react";
import { CultureEvent, CultureEventStatus } from "@/lib/types";
import { AppShell } from "@/components/app-shell";
import { EventCard } from "@/components/event-card";
import { EventDetailDrawer } from "@/components/event-detail-drawer";
import { EventFilters } from "@/components/event-filters";
import { Button } from "@/components/ui/button";
import { Calendar, Grid, List } from "lucide-react";

type SortOption = "date" | "status" | "rating";

export default function EventsPage() {
  const [events, setEvents] = useState<CultureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notionConnected, setNotionConnected] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CultureEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CultureEventStatus[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data.events || []);
      setNotionConnected(data.notionConnected || false);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, []);
  
  const updateEventStatus = async (eventId: string, updates: Partial<CultureEvent>) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        // Optimistic update
        setEvents(prev => 
          prev.map(event => 
            event.id === eventId 
              ? { ...event, ...updates }
              : event
          )
        );
        
        // Update selected event if it's open
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(prev => prev ? { ...prev, ...updates } : null);
        }
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };
  
  const handleStatusChange = (eventId: string, status: CultureEventStatus) => {
    const updates: Partial<CultureEvent> = { status };
    
    // Auto-set calendar wanted for certain statuses
    if (status === "Kalender" || status === "Einladen") {
      updates.calendarWanted = true;
    }
    
    updateEventStatus(eventId, updates);
  };
  
  const handleCalendarToggle = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      updateEventStatus(eventId, { 
        calendarWanted: !event.calendarWanted,
        status: !event.calendarWanted && event.status === "Neu" ? "Interessant" : event.status
      });
    }
  };
  
  const handleInviteesChange = (eventId: string, invitees: string) => {
    updateEventStatus(eventId, { 
      invitees,
      status: invitees && !["Einladen", "Gebucht"].includes(events.find(e => e.id === eventId)?.status || "") 
        ? "Einladen" 
        : events.find(e => e.id === eventId)?.status || "Neu"
    });
  };
  
  const handleRatingChange = (eventId: string, rating: number) => {
    updateEventStatus(eventId, { rating });
  };
  
  const handlePersonalNoteChange = (eventId: string, personalNote: string) => {
    updateEventStatus(eventId, { personalNote });
  };
  
  // Filter events
  const filteredEvents = events.filter(event => {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Alle Events</h1>
            <p className="text-slate-600 mt-1">
              Vollständige Liste aller gefundenen Kulturveranstaltungen
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Sortierung:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white"
              >
                <option value="date">Datum</option>
                <option value="status">Status</option>
                <option value="rating">Bewertung</option>
              </select>
            </div>
            
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
          <div className={
            viewMode === "grid" 
              ? "events-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
              : "space-y-4"
          }>
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => setSelectedEvent(event)}
                onStatusChange={(status) => handleStatusChange(event.id, status)}
                onCalendarToggle={() => handleCalendarToggle(event.id)}
              />
            ))}
          </div>
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
          onOpenChange={(open) => !open && setSelectedEvent(null)}
          onStatusChange={(status) => selectedEvent && handleStatusChange(selectedEvent.id, status)}
          onCalendarToggle={() => selectedEvent && handleCalendarToggle(selectedEvent.id)}
          onInviteesChange={(invitees) => selectedEvent && handleInviteesChange(selectedEvent.id, invitees)}
          onRatingChange={(rating) => selectedEvent && handleRatingChange(selectedEvent.id, rating)}
          onPersonalNoteChange={(note) => selectedEvent && handlePersonalNoteChange(selectedEvent.id, note)}
        />
      </div>
    </AppShell>
  );
}