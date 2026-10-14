"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CultureEvent, CultureEventStatus } from "@/lib/types";
import { AppShell } from "@/components/app-shell";
import { EventCard } from "@/components/event-card";
import { EventDetailDrawer } from "@/components/event-detail-drawer";
import { EventFilters } from "@/components/event-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Star, TrendingUp, Clock, Filter } from "lucide-react";

interface DashboardStats {
  neu: number;
  interessant: number;
  kalender: number;
  einladen: number;
  thisWeek: number;
  total: number;
}

export default function Dashboard() {
  const [events, setEvents] = useState<CultureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notionConnected, setNotionConnected] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CultureEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CultureEventStatus[]>(["Neu", "Interessant"]);
  const [showFilters, setShowFilters] = useState(false);
  
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
  
  // Sort events: Neu first, then by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    // Priority order: Neu > Interessant > Kalender > Einladen > Rest
    const statusPriority = {
      "Neu": 1,
      "Interessant": 2, 
      "Kalender": 3,
      "Einladen": 4
    };
    
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 5;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 5;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Calculate stats
  const stats: DashboardStats = events.reduce((acc, event) => {
    acc.total++;
    switch (event.status) {
      case "Neu": acc.neu++; break;
      case "Interessant": acc.interessant++; break;
      case "Kalender": acc.kalender++; break;
      case "Einladen": acc.einladen++; break;
    }
    
    // This week check
    const eventDate = new Date(event.date);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    if (eventDate <= weekFromNow && eventDate >= new Date()) {
      acc.thisWeek++;
    }
    
    return acc;
  }, { neu: 0, interessant: 0, kalender: 0, einladen: 0, thisWeek: 0, total: 0 });
  
  const availableRegions = Array.from(new Set(events.map(e => e.region).filter(Boolean))) as string[];
  const availableCategories = Array.from(new Set(events.flatMap(e => e.categories)));
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegions([]);
    setSelectedCategories([]);
    setSelectedStatuses(["Neu", "Interessant"]);
  };
  
  const activeFiltersCount = (
    (searchTerm ? 1 : 0) + 
    selectedRegions.length + 
    selectedCategories.length +
    (selectedStatuses.length !== 2 || !selectedStatuses.includes("Neu") || !selectedStatuses.includes("Interessant") ? 1 : 0)
  );
  
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Übersicht</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {sortedEvents.length} von {stats.total} Events
              {activeFiltersCount === 0 ? " · Neu und Interessant" : ` · ${activeFiltersCount} Filter aktiv`}
              {" · "}
              <Link href="/events" className="font-medium text-foreground underline underline-offset-4 hover:text-accent">
                Alle Events
              </Link>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filter
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-xs text-accent-foreground">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* Triage strip: "Neu" is the task, everything else is context */}
        <dl className="grid grid-cols-3 divide-x divide-y divide-border overflow-hidden rounded-xl border border-border bg-card md:grid-cols-6 md:divide-y-0">
          {[
            { label: "Neu", value: stats.neu, strong: true },
            { label: "Interessant", value: stats.interessant },
            { label: "Kalender", value: stats.kalender },
            { label: "Einladen", value: stats.einladen },
            { label: "Diese Woche", value: stats.thisWeek },
            { label: "Gesamt", value: stats.total },
          ].map((item) => (
            <div key={item.label} className="px-4 py-3">
              <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
              <dd className={`font-display text-2xl font-semibold ${item.strong && item.value > 0 ? "text-accent" : "text-foreground"}`}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Filters - Collapsible */}
        {showFilters && (
          <Card className="enterprise-card">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
        )}
        
        {/* Events Grid - Dichter */}
        {sortedEvents.length > 0 ? (
          <div className="dense-grid sm:grid-cols-2 xl:grid-cols-3">
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
          <Card className="enterprise-card">
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Keine Events gefunden</h3>
              <p className="text-muted-foreground text-sm">
                {events.length === 0 
                  ? "Noch keine Events vorhanden" 
                  : "Versuche andere Filter oder Suchbegriffe"}
              </p>
            </CardContent>
          </Card>
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