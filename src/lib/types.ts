export type CultureEventStatus =
  | "Neu"
  | "Interessant"
  | "Kalender"
  | "Einladen"
  | "Ignorieren"
  | "Gebucht"
  | "Vielleicht";

export type CultureEvent = {
  id: string;
  title: string;
  date: string;
  venue?: string;
  city?: string;
  region?: string;
  categories: string[];
  sourceName?: string;
  /** Notion page id of the source (relation); resolved to sourceName on the server */
  sourceId?: string;
  url?: string;
  description?: string;
  price?: string;
  status: CultureEventStatus;
  calendarWanted: boolean;
  calendarCreated: boolean;
  calendarEventId?: string;
  invitees?: string;
  rating?: number;
  personalNote?: string;
  lastReviewedAt?: string;
};

export type CultureSource = {
  id: string;
  name: string;
  url: string;
  active: boolean;
  regions: string[];
  categories: string[];
  priority: number;
  lastCheck?: string;
  notes?: string;
};