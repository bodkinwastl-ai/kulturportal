import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/** True for events today or later (date-only Notion values count as today). */
export function isUpcoming(dateStr: string, now: Date = new Date()): boolean {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return new Date(dateStr) >= startOfToday;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** "Heute", "Morgen" or "Samstag, 26. Oktober" */
export function dayLabel(date: Date, now: Date = new Date()): string {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (dayKey(date) === dayKey(now)) return "Heute";
  if (dayKey(date) === dayKey(tomorrow)) return "Morgen";
  const label = date.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  return date.getFullYear() === now.getFullYear()
    ? label
    : `${label} ${date.getFullYear()}`;
}

/** Groups events (already sorted by date) into consecutive day buckets. */
export function groupByDay<T extends { date: string }>(items: T[]): { key: string; label: string; items: T[] }[] {
  const groups: { key: string; label: string; items: T[] }[] = [];
  for (const item of items) {
    const d = new Date(item.date);
    const key = dayKey(d);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, label: dayLabel(d), items: [item] });
  }
  return groups;
}

/** Monday 00:00 of the week containing `date` (local time). */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - daysSinceMonday);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Local YYYY-MM-DD (no UTC shift). */
export function toDateParam(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateParam(value: string | null): Date | null {
  const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}
