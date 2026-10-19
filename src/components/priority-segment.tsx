"use client";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: 1, label: "Hoch" },
  { value: 2, label: "Normal" },
  { value: 3, label: "Niedrig" },
] as const;

export const PRIORITY_LABEL: Record<number, string> = { 1: "Hoch", 2: "Normal", 3: "Niedrig" };

/** Three-way switch: one click sets the priority. */
export function PrioritySegment({
  value,
  onChange,
  name,
  className,
}: {
  value: number;
  onChange: (priority: number) => void;
  name: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={`Priorität von ${name}`} className={cn("inline-flex rounded-md border border-input bg-card p-0.5", className)}>
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => !active && onChange(o.value)}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
