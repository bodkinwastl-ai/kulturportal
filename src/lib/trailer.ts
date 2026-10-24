import { CultureEvent } from "./types";

// Categories where a trailer or sample video exists; readings, exhibitions, markets etc. get no button.
const TRAILER_CATEGORIES = ["kino", "film", "theater", "oper", "musical", "konzert", "klassik", "jazz", "tanz", "comedy", "kabarett"];

export const wantsTrailer = (e: CultureEvent) =>
  e.categories.some((c) => TRAILER_CATEGORIES.includes(c.trim().toLowerCase()));

/** On-demand YouTube search: nothing is fetched until the user clicks. */
export const trailerUrl = (e: CultureEvent) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${e.title} Trailer`)}`;
