"use client";

import { CultureEvent, CultureEventStatus } from "@/lib/types";
import { StatusPill } from "./status-pill";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Users, Star, ExternalLink, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: CultureEvent;
  onClick: () => void;
  onStatusChange: (status: CultureEventStatus) => void;
  onCalendarToggle: () => void;
}

export function EventCard({ event, onClick, onStatusChange, onCalendarToggle }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isUpcoming = eventDate > new Date();
  const isPast = eventDate < new Date() && !isToday;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString("de-DE", { month: "short" }),
      time: date.toLocaleString("de-DE", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      weekday: date.toLocaleString("de-DE", { weekday: "short" })
    };
  };
  
  const dateInfo = formatDate(event.date);
  
  return (
    <div 
      className={cn(
        "enterprise-card hover-lift cursor-pointer group",
        isToday && "ring-2 ring-accent/60 border-accent/30",
        isPast && "opacity-75",
        event.status === "Neu" && "border-l-4 border-l-blue-500"
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Compact Header */}
        <div className="flex items-start justify-between">
          {/* Date Block - Smaller */}
          <div className="flex items-center space-x-3">
            <div className="text-center min-w-[48px] flex-shrink-0">
              <div className={cn(
                "text-lg font-bold transition-colors",
                isToday ? "text-accent" : "text-foreground"
              )}>
                {dateInfo.day}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {dateInfo.month}
              </div>
            </div>
            
            {/* Title & Time - More Compact */}
            <div className="flex-1 min-w-0">
              <h3 className="event-title font-semibold text-foreground text-base leading-tight mb-1 line-clamp-2 text-compact group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground space-x-2">
                <Clock className="w-3 h-3" />
                <span>{dateInfo.time}</span>
                <span>•</span>
                <span className="capitalize">{dateInfo.weekday}</span>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <StatusPill status={event.status} />
        </div>
        
        {/* Location - More Compact */}
        <div className="flex items-center text-xs text-muted-foreground space-x-1">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">
            {event.venue && <span className="font-medium">{event.venue}</span>}
            {event.venue && (event.city || event.region) && <span> • </span>}
            {event.city}{event.region && event.region !== event.city ? `, ${event.region}` : ""}
          </span>
        </div>
        
        {/* Categories & Price - Inline and Compact */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {event.categories.slice(0, 2).map((category, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5 font-normal"
              >
                {category}
              </Badge>
            ))}
            {event.categories.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{event.categories.length - 2}
              </Badge>
            )}
          </div>
          
          {/* Price & Rating */}
          <div className="flex items-center space-x-3 text-xs">
            {event.price && (
              <span className="font-semibold text-foreground">{event.price}</span>
            )}
            {event.rating && (
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                <span className="font-medium">{event.rating}/5</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Description - Only if space allows */}
        {event.description && (
          <p className="event-description text-xs text-muted-foreground line-clamp-2 text-compact leading-relaxed">
            {event.description}
          </p>
        )}
        
        {/* Action Bar - More Compact */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            {/* Status Actions */}
            {event.status === "Neu" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange("Interessant");
                  }}
                  className="h-7 px-2 text-xs text-green-700 border-green-200 hover:bg-green-50"
                >
                  ✓ Interessant
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange("Ignorieren");
                  }}
                  className="h-7 px-2 text-xs text-muted-foreground border-muted hover:bg-muted/50"
                >
                  ✕ Ignore
                </Button>
              </>
            )}
            
            {/* Calendar Toggle */}
            {(event.status === "Interessant" || event.status === "Neu") && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onCalendarToggle();
                }}
                className={cn(
                  "h-7 px-2 text-xs border-purple-200 hover:bg-purple-50",
                  event.calendarWanted ? "text-purple-700 bg-purple-50" : "text-purple-600"
                )}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Kalender
              </Button>
            )}
          </div>
          
          {/* Source & Indicators */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {event.calendarWanted && (
              <Calendar className="w-3 h-3 text-purple-500" />
            )}
            {event.invitees && (
              <Users className="w-3 h-3 text-orange-500" />
            )}
            {event.url && (
              <ExternalLink className="w-3 h-3" />
            )}
            <span className="font-medium text-xs">
              {event.sourceName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}