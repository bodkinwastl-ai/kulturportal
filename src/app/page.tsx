"use client";

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
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Überblick über {stats.total} Kulturveranstaltungen
            </p>
          </div>
          
          {/* Filter Toggle */}
          <div className="flex items-center space-x-2">
            <Badge variant={activeFiltersCount > 0 ? "default" : "outline"} className="text-xs">
              {activeFiltersCount > 0 ? `${activeFiltersCount} Filter aktiv` : "Keine Filter"}
            </Badge>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              title="Filter ein-/ausblenden"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Stats Cards - Kompakter */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Neu</p>
                  <p className="text-xl font-bold text-foreground">{stats.neu}</p>
                </div>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Interessant</p>
                  <p className="text-xl font-bold text-foreground">{stats.interessant}</p>
                </div>
                <Star className="w-4 h-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Kalender</p>
                  <p className="text-xl font-bold text-foreground">{stats.kalender}</p>
                </div>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Einladen</p>
                  <p className="text-xl font-bold text-foreground">{stats.einladen}</p>
                </div>
                <Users className="w-4 h-4 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Diese Woche</p>
                  <p className="text-xl font-bold text-foreground">{stats.thisWeek}</p>
                </div>
                <Clock className="w-4 h-4 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Gesamt</p>
                  <p className="text-xl font-bold text-foreground">{stats.total}</p>
                </div>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
        
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
          <div className="dense-grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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