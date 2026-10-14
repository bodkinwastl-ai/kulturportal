// Static class strings so Tailwind can see them. Text/background pairs are >= 4.5:1.
export type CategoryColor = { bar: string; chip: string };

const PALETTE: CategoryColor[] = [
  { bar: "bg-rose-500", chip: "bg-rose-50 text-rose-800" },
  { bar: "bg-sky-500", chip: "bg-sky-50 text-sky-800" },
  { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-900" },
  { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-800" },
  { bar: "bg-violet-500", chip: "bg-violet-50 text-violet-800" },
  { bar: "bg-teal-500", chip: "bg-teal-50 text-teal-800" },
  { bar: "bg-fuchsia-500", chip: "bg-fuchsia-50 text-fuchsia-800" },
  { bar: "bg-indigo-500", chip: "bg-indigo-50 text-indigo-800" },
];

// Stable colours for common categories; everything else is hashed.
const KNOWN: Record<string, number> = {
  klassik: 7,
  oper: 6,
  jazz: 2,
  ausstellung: 5,
  theater: 0,
  comedy: 3,
  konzert: 1,
  tanz: 4,
};

export function categoryColor(category: string): CategoryColor {
  const key = category.trim().toLowerCase();
  if (key in KNOWN) return PALETTE[KNOWN[key]];
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
