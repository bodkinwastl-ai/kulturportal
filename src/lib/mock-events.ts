import { CultureEvent, CultureSource } from "./types";

// Demo data stays upcoming: dates are relative to today.
function daysFromNow(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export const mockEvents: CultureEvent[] = [
  {
    id: "1",
    title: "Wiener Philharmoniker - Neujahrskonzert Probe",
    date: daysFromNow(0, 19, 30),
    venue: "Musikverein Wien",
    city: "Wien",
    region: "Wien",
    categories: ["Klassik", "Konzert"],
    sourceName: "Vienna.at",
    url: "https://vienna.at/events/philharmoniker",
    description: "Generalprobe für das berühmte Neujahrskonzert mit den Wiener Philharmonikern. Eine seltene Gelegenheit, dieses weltberühmte Ensemble in einer entspannteren Atmosphäre zu erleben.",
    price: "€ 85-180",
    status: "Neu",
    calendarWanted: false,
    calendarCreated: false,
    rating: 5,
    personalNote: "Unbedingt ansehen! Seltene Chance auf Karten."
  },
  {
    id: "2", 
    title: "Digital Art Exhibition - Future Visions",
    date: daysFromNow(1, 18, 0),
    venue: "MAK Wien",
    city: "Wien", 
    region: "Wien",
    categories: ["Ausstellung", "Digital Art", "Zeitgenössisch"],
    sourceName: "MAK",
    url: "https://mak.at/exhibitions/future-visions",
    description: "Immersive digitale Kunstausstellung mit interaktiven Installationen von internationalen Künstlern. Schwerpunkt auf KI-generierte Kunst und Virtual Reality Erfahrungen.",
    price: "€ 14",
    status: "Interessant",
    calendarWanted: true,
    calendarCreated: false,
    invitees: "lisa@example.com, mark@example.com"
  },
  {
    id: "3",
    title: "Jazz im Keller - Marcus Miller Quartet", 
    date: daysFromNow(1, 21, 0),
    venue: "Porgy & Bess",
    city: "Wien",
    region: "Wien", 
    categories: ["Jazz", "Konzert"],
    sourceName: "Porgy & Bess",
    url: "https://porgy.at/events/marcus-miller",
    description: "Der legendäre Bassist Marcus Miller mit seinem Quartet. Virtuose Fusion von Jazz, Funk und R&B in der legendären Wiener Jazz-Location.",
    price: "€ 45",
    status: "Kalender",
    calendarWanted: true,
    calendarCreated: true,
    calendarEventId: "cal_123456",
    rating: 4
  },
  {
    id: "4",
    title: "Lange Nacht der Museen",
    date: daysFromNow(5, 18, 0), 
    venue: "Diverse Museen",
    city: "Wien",
    region: "Wien",
    categories: ["Ausstellung", "Event", "Kultur"], 
    sourceName: "Lange Nacht",
    url: "https://langenacht.at",
    description: "Über 700 Museen und Kultureinrichtungen öffnen ihre Türen für eine Nacht. Mit einem Ticket Zugang zu allen teilnehmenden Locations.",
    price: "€ 19",
    status: "Einladen", 
    calendarWanted: true,
    calendarCreated: false,
    invitees: "Familie, Sarah",
    personalNote: "Perfekt für einen Kulturabend mit der Familie"
  },
  {
    id: "5",
    title: "Stand-up Comedy - Michael Niavarani",
    date: daysFromNow(9, 20, 0),
    venue: "Stadtsaal",
    city: "Wien",
    region: "Wien", 
    categories: ["Comedy", "Theater"],
    sourceName: "Stadtsaal",
    url: "https://stadtsaal.com/niavarani",
    description: "Michael Niavarani mit seinem neuen Programm 'Kontra'. Österreichs Comedy-Legende mit gewohnt scharfzüngigem Humor.",
    price: "€ 32-54",
    status: "Ignorieren",
    calendarWanted: false,
    calendarCreated: false,
    lastReviewedAt: daysFromNow(-4, 10, 0)
  },
  {
    id: "6",
    title: "Opernball 2025 - Vorbereitungswalzer",
    date: daysFromNow(21, 19, 0),
    venue: "Wiener Staatsoper", 
    city: "Wien",
    region: "Wien",
    categories: ["Oper", "Gala", "Tanz"],
    sourceName: "Staatsoper",
    url: "https://staatsoper.at/opernball-prep",
    description: "Walzertraining und Generalprobe für den Opernball 2025. Dresscode: Abendgarderobe erwünscht.",
    price: "€ 120",
    status: "Gebucht",
    calendarWanted: true, 
    calendarCreated: true,
    calendarEventId: "cal_789012",
    invitees: "partner@example.com",
    rating: 3,
    personalNote: "Gebucht, Kleider organisieren"
  }
];

export const mockSources: CultureSource[] = [
  {
    id: "1",
    name: "Vienna.at",
    url: "https://vienna.at/events", 
    active: true,
    regions: ["Wien"],
    categories: ["Konzert", "Klassik", "Theater"],
    priority: 2,
    notes: "Hauptquelle für Wiener Kulturveranstaltungen"
  },
  {
    id: "2", 
    name: "MAK Wien",
    url: "https://mak.at/exhibitions",
    active: true,
    regions: ["Wien"], 
    categories: ["Ausstellung", "Zeitgenössisch", "Design"],
    priority: 2,
    notes: "Museum für angewandte Kunst"
  },
  {
    id: "3",
    name: "Porgy & Bess", 
    url: "https://porgy.at/events",
    active: true,
    regions: ["Wien"],
    categories: ["Jazz", "Blues", "World Music"],
    priority: 2,
    notes: "Wiener Jazz Club"
  },
  {
    id: "4",
    name: "Jazzfestival Saalfelden",
    url: "https://www.jazzsaalfelden.com/de",
    active: true,
    regions: ["Salzburg"],
    categories: ["Jazz", "Festival"],
    priority: 2,
    notes: "Salzburger Jazz Festival"
  }
];