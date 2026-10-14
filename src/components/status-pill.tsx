"use client";

import { CultureEventStatus } from "@/lib/types";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: CultureEventStatus;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function StatusPill({ status, size = "default", className }: StatusPillProps) {
  const getStatusConfig = (status: CultureEventStatus) => {
    switch (status) {
      case "Neu":
        return {
          className: "status-neu",
          label: "Neu",
          icon: "✨"
        };
      case "Interessant":
        return {
          className: "status-interessant",
          label: "Interessant", 
          icon: "⭐"
        };
      case "Kalender":
        return {
          className: "status-kalender",
          label: "Kalender",
          icon: "📅"
        };
      case "Einladen":
        return {
          className: "status-einladen",
          label: "Einladen",
          icon: "👥"
        };
      case "Ignorieren":
        return {
          className: "status-ignorieren",
          label: "Ignoriert",
          icon: "⭕"
        };
      case "Gebucht":
        return {
          className: "bg-emerald-100 text-emerald-800 border-emerald-300",
          label: "Gebucht",
          icon: "✅"
        };
      case "Vielleicht":
        return {
          className: "bg-yellow-100 text-yellow-800 border-yellow-300",
          label: "Vielleicht",
          icon: "🤔"
        };
      default:
        return {
          className: "bg-gray-100 text-gray-700 border-gray-200",
          label: status,
          icon: "❓"
        };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        "font-medium border transition-colors",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "default" && "text-xs px-2 py-1", 
        size === "lg" && "text-sm px-3 py-1.5",
        className
      )}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}