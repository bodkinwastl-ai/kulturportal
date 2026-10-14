"use client";

import { CultureEventStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Star,
  CalendarCheck,
  Users,
  CircleCheck,
  CircleHelp,
  EyeOff,
  type LucideIcon,
} from "lucide-react";

interface StatusPillProps {
  status: CultureEventStatus;
  size?: "sm" | "default" | "lg";
  className?: string;
}

// One tonal pair per status. All text/background pairs are >= 4.5:1.
const STATUS: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  Neu: { label: "Neu", icon: Sparkles, tone: "bg-orange-50 text-orange-800 ring-orange-200" },
  Interessant: { label: "Interessant", icon: Star, tone: "bg-amber-50 text-amber-900 ring-amber-200" },
  Kalender: { label: "Kalender", icon: CalendarCheck, tone: "bg-teal-50 text-teal-800 ring-teal-200" },
  Einladen: { label: "Einladen", icon: Users, tone: "bg-violet-50 text-violet-800 ring-violet-200" },
  Gebucht: { label: "Gebucht", icon: CircleCheck, tone: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  Vielleicht: { label: "Vielleicht", icon: CircleHelp, tone: "bg-stone-100 text-stone-700 ring-stone-200" },
  Ignorieren: { label: "Ignoriert", icon: EyeOff, tone: "bg-stone-100 text-stone-600 ring-stone-200" },
};

export function StatusPill({ status, size = "default", className }: StatusPillProps) {
  const config = STATUS[status] ?? {
    label: status,
    icon: CircleHelp,
    tone: "bg-stone-100 text-stone-700 ring-stone-200",
  };
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-medium ring-1 ring-inset whitespace-nowrap",
        config.tone,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "default" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
