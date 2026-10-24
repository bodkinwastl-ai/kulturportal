import { CultureEvent } from "./types";

const STOPWORDS = new Set([
  "premiere", "live", "tickets", "ticket", "konzert", "mit", "und", "der", "die", "das", "the", "von", "im", "in", "am",
]);

function tokens(title: string): string[] {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t && !STOPWORDS.has(t));
}

const normPlace = (s?: string) => (s ? tokens(s).join(" ") : "");
const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};
const hourKey = (iso: string) => `${dayKey(iso)}-${new Date(iso).getHours()}`;

function samePlace(a: CultureEvent, b: CultureEvent): boolean {
  const pa = [normPlace(a.venue), normPlace(a.city)].filter(Boolean);
  const pb = [normPlace(b.venue), normPlace(b.city)].filter(Boolean);
  return pa.some((x) => pb.includes(x));
}

function unknownPlace(a: CultureEvent, b: CultureEvent): boolean {
  return (!a.venue && !a.city) || (!b.venue && !b.city);
}

function similarity(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  if (!sa.size || !sb.size) return 0;
  let shared = 0;
  sa.forEach((t) => sb.has(t) && shared++);
  const jaccard = shared / (sa.size + sb.size - shared);
  // "Hamlet" vs "Hamlet - Schauspielhaus Graz": one title's tokens contained in the other
  const contained = shared === Math.min(sa.size, sb.size) && Math.min(sa.size, sb.size) >= 2 ? 0.75 : 0;
  return Math.max(jaccard, contained);
}

/** Same title, same hour, same place (venue or city): safe to collapse. */
export function isSureDuplicate(a: CultureEvent, b: CultureEvent): boolean {
  const ta = tokens(a.title).join(" ");
  return !!ta && ta === tokens(b.title).join(" ") && hourKey(a.date) === hourKey(b.date) && samePlace(a, b);
}

/** Similar title within 3 hours (matinee and evening show stay apart), place matching or unknown: worth a human look. */
export function isPossibleDuplicate(a: CultureEvent, b: CultureEvent): boolean {
  if (Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) > 3 * 3600_000) return false;
  if (!(samePlace(a, b) || unknownPlace(a, b))) return false;
  return similarity(tokens(a.title), tokens(b.title)) >= 0.7;
}

const filled = (e: CultureEvent) =>
  [e.url, e.price, e.description, e.venue, e.city, e.region, e.sourceName].filter(Boolean).length;

/** Winner of a pair/group: anything the user already triaged beats Neu, then the fuller record. */
function rank(e: CultureEvent): number {
  return (e.status !== "Neu" ? 100 : 0) + filled(e) + (e.rating ? 1 : 0) + (e.personalNote ? 1 : 0);
}
const byRank = (a: CultureEvent, b: CultureEvent) => rank(b) - rank(a) || a.id.localeCompare(b.id);

/**
 * Collapses sure duplicates into one event (alsoAt lists the other sources) and flags
 * possible ones with possibleDuplicateOf. Never mutates or deletes anything in Notion.
 */
export function dedupeEvents(events: CultureEvent[]): CultureEvent[] {
  // 1. sure duplicates: union-find over pairs on the same day
  const parent = events.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const byDay = new Map<string, number[]>();
  events.forEach((e, i) => {
    const k = dayKey(e.date);
    byDay.set(k, [...(byDay.get(k) ?? []), i]);
  });
  byDay.forEach((idx) => {
    for (let x = 0; x < idx.length; x++)
      for (let y = x + 1; y < idx.length; y++)
        if (isSureDuplicate(events[idx[x]], events[idx[y]])) parent[find(idx[x])] = find(idx[y]);
  });
  const groups = new Map<number, CultureEvent[]>();
  events.forEach((e, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), e]));

  const winners = Array.from(groups.values()).map((members) => {
    const [winner, ...rest] = [...members].sort(byRank);
    if (!rest.length) return winner;
    const alsoAt = Array.from(new Set(rest.map((r) => r.sourceName).filter((s): s is string => !!s && s !== winner.sourceName)));
    return { ...winner, alsoAt: alsoAt.length ? alsoAt : undefined, mergedCount: rest.length };
  });

  // 2. possible duplicates among still-visible winners: flag only the lower-ranked one
  const visible = winners.filter((e) => e.status !== "Ignorieren");
  const flagged = new Map<string, CultureEvent>();
  for (let x = 0; x < visible.length; x++) {
    for (let y = x + 1; y < visible.length; y++) {
      const [best, other] = [visible[x], visible[y]].sort(byRank);
      if (!flagged.has(other.id) && isPossibleDuplicate(best, other)) flagged.set(other.id, best);
    }
  }
  return winners.map((e) => {
    const best = flagged.get(e.id);
    return best ? { ...e, possibleDuplicateOf: { id: best.id, title: best.title, sourceName: best.sourceName } } : e;
  });
}
