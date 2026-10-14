import { Client } from "@notionhq/client";
import { CultureEvent, CultureSource } from "./types";
import { mockEvents, mockSources } from "./mock-events";

// Notion-Datenbank IDs aus dem Briefing
const EVENTS_DB_ID = "3f85e96f-2473-817b-b31e-d0ea97414538";
const SOURCES_DB_ID = "3f85e96f-2473-81c2-8c9f-e2f0491381e1";

let notionClient: Client | null = null;

// Notion Client initialisieren 
if (process.env.NOTION_TOKEN) {
  notionClient = new Client({
    auth: process.env.NOTION_TOKEN,
  });
}

// Hilfsfunktion um Notion-Eigenschaften zu extrahieren
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNotionProperty(property: any): any {
  if (!property) return null;
  
  switch (property.type) {
    case "title":
      return property.title?.[0]?.plain_text || "";
    case "rich_text": 
      return property.rich_text?.[0]?.plain_text || "";
    case "select":
      return property.select?.name || "";
    case "multi_select":
      return property.multi_select?.map((item: { name: string }) => item.name) || [];
    case "date":
      return property.date?.start || null;
    case "checkbox":
      return property.checkbox || false;
    case "number":
      return property.number || null;
    case "url":
      return property.url || "";
    case "relation":
      return property.relation?.[0]?.id || null;
    default:
      return null;
  }
}

// Notion Event zu CultureEvent konvertieren
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNotionToCultureEvent(page: any): CultureEvent {
  const props = page.properties;
  
  return {
    id: page.id,
    title: extractNotionProperty(props.Event) || extractNotionProperty(props.Title) || "Unbekanntes Event",
    date: extractNotionProperty(props.Datum) || extractNotionProperty(props.Date) || new Date().toISOString(),
    venue: extractNotionProperty(props.Ort) || extractNotionProperty(props.Venue) || "",
    city: extractNotionProperty(props.Stadt) || extractNotionProperty(props.City) || "",
    region: extractNotionProperty(props.Region) || "",
    categories: extractNotionProperty(props.Kategorien) || extractNotionProperty(props.Categories) || [],
    sourceName: extractNotionProperty(props.Quelle) || extractNotionProperty(props.Source) || "",
    url: extractNotionProperty(props.URL) || "",
    description: extractNotionProperty(props.Beschreibung) || extractNotionProperty(props.Description) || "",
    price: extractNotionProperty(props.Preis) || extractNotionProperty(props.Price) || "",
    status: extractNotionProperty(props.Status) || "Neu",
    calendarWanted: extractNotionProperty(props.CalendarWanted) || false,
    calendarCreated: extractNotionProperty(props.CalendarCreated) || false,
    calendarEventId: extractNotionProperty(props.CalendarEventId) || undefined,
    invitees: extractNotionProperty(props.Invitees) || undefined,
    rating: extractNotionProperty(props.Rating) || undefined,
    personalNote: extractNotionProperty(props.PersonalNote) || undefined,
    lastReviewedAt: extractNotionProperty(props.LastReviewedAt) || undefined,
  };
}

// Events aus Notion laden
export async function fetchEvents(): Promise<CultureEvent[]> {
  if (!notionClient) {
    console.log("Notion client not available, using mock data");
    return mockEvents;
  }
  
  try {
    // Vereinfachte Query ohne Types
    const response = await fetch(`https://api.notion.com/v1/databases/${EVENTS_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        sorts: [
          {
            property: "Datum",
            direction: "ascending",
          },
        ],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.map(mapNotionToCultureEvent);
  } catch (error) {
    console.error("Fehler beim Laden der Events aus Notion:", error);
    console.log("Fallback zu Mock-Daten");
    return mockEvents;
  }
}

// Event in Notion aktualisieren
export async function updateEvent(eventId: string, updates: Partial<CultureEvent>): Promise<boolean> {
  if (!notionClient) {
    console.log("Notion client not available, simulating update");
    return true; // Simulation für Mock-Modus
  }
  
  try {
    const properties: Record<string, unknown> = {};
    
    if (updates.status !== undefined) {
      properties.Status = {
        select: { name: updates.status }
      };
    }
    
    if (updates.calendarWanted !== undefined) {
      properties.CalendarWanted = {
        checkbox: updates.calendarWanted
      };
    }
    
    if (updates.invitees !== undefined) {
      properties.Invitees = {
        rich_text: [{ text: { content: updates.invitees } }]
      };
    }
    
    if (updates.rating !== undefined) {
      properties.Rating = {
        number: updates.rating
      };
    }
    
    if (updates.personalNote !== undefined) {
      properties.PersonalNote = {
        rich_text: [{ text: { content: updates.personalNote } }]
      };
    }
    
    if (updates.lastReviewedAt !== undefined) {
      properties.LastReviewedAt = {
        date: { start: updates.lastReviewedAt }
      };
    }
    
    // Vereinfachter Update über fetch
    const response = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        properties,
      }),
    });
    
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body?.message || `Notion antwortete mit ${response.status}`;
      console.error("Notion-Update fehlgeschlagen:", response.status, message);
      throw new Error(message);
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Events:", error);
    throw error;
  }
}

// Sources aus Notion laden
export async function getCultureSources(): Promise<CultureSource[]> {
  // Skip during build/prerender phase
  if (!process.env.NOTION_TOKEN) {
    console.log("No NOTION_TOKEN available, using mock sources");
    return mockSources;
  }
  
  console.log("getCultureSources: Starting with NOTION_TOKEN present");
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${SOURCES_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({})
    });
    
    console.log(`getCultureSources: Notion API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`getCultureSources: Notion API error ${response.status}: ${errorText}`);
      throw new Error(`Notion API error: ${response.status}`);
    }
    
    const data = await response.json();
    const sources = data.results.map(mapNotionToCultureSource);
    console.log(`getCultureSources: Successfully loaded ${sources.length} sources from Notion`);
    return sources;
  } catch (error) {
    console.error("getCultureSources: Error loading from Notion:", error);
    console.log("getCultureSources: Fallback zu Mock-Daten");
    return mockSources;
  }
}

// Create new source in Notion
export async function createCultureSource(sourceData: Partial<CultureSource>): Promise<CultureSource> {
  try {
    const response = await fetch(`https://api.notion.com/v1/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: SOURCES_DB_ID },
        properties: {
          'Quelle': {
            title: [{ text: { content: sourceData.name || 'Neue Quelle' } }]
          },
          'URL': {
            url: sourceData.url || ''
          },
          'Aktiv': {
            checkbox: sourceData.active ?? true
          },
          'Region': {
            multi_select: (sourceData.regions || []).map(r => ({ name: r }))
          },
          'Kategorien': {
            multi_select: (sourceData.categories || []).map(c => ({ name: c }))
          },
          'Priorität': {
            number: sourceData.priority || 2
          },
          'Notizen': {
            rich_text: [{ text: { content: sourceData.notes || '' } }]
          }
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create source: ${response.status}`);
    }
    
    const data = await response.json();
    return mapNotionToCultureSource(data);
  } catch (error) {
    console.error("Error creating source:", error);
    throw error;
  }
}

// Update source in Notion
export async function updateCultureSource(sourceId: string, updates: Partial<CultureSource>): Promise<boolean> {
  try {
    const properties: Record<string, any> = {};
    
    if (updates.name !== undefined) {
      properties['Quelle'] = {
        title: [{ text: { content: updates.name } }]
      };
    }
    
    if (updates.url !== undefined) {
      properties['URL'] = {
        url: updates.url
      };
    }
    
    if (updates.active !== undefined) {
      properties['Aktiv'] = {
        checkbox: updates.active
      };
    }
    
    if (updates.regions !== undefined) {
      properties['Region'] = {
        multi_select: updates.regions.map(r => ({ name: r }))
      };
    }
    
    if (updates.categories !== undefined) {
      properties['Kategorien'] = {
        multi_select: updates.categories.map(c => ({ name: c }))
      };
    }
    
    if (updates.priority !== undefined) {
      properties['Priorität'] = {
        number: updates.priority
      };
    }
    
    if (updates.notes !== undefined) {
      properties['Notizen'] = {
        rich_text: [{ text: { content: updates.notes } }]
      };
    }
    
    const response = await fetch(`https://api.notion.com/v1/pages/${sourceId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties }),
    });
    
    return response.ok;
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Source:", error);
    return false;
  }
}

// Delete source from Notion
export async function deleteCultureSource(sourceId: string): Promise<boolean> {
  try {
    // Notion doesn't have delete, so we set to archived
    const response = await fetch(`https://api.notion.com/v1/pages/${sourceId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        archived: true
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error("Fehler beim Löschen der Source:", error);
    return false;
  }
}

// Helper function to map Notion page to CultureSource
function mapNotionToCultureSource(page: any): CultureSource {
  const props = page.properties;
  return {
    id: page.id,
    name: extractNotionProperty(props.Quelle) || "Unbekannte Quelle",
    url: extractNotionProperty(props.URL) || "",
    active: extractNotionProperty(props.Aktiv) ?? true,
    regions: extractNotionProperty(props.Region) || [],
    categories: extractNotionProperty(props.Kategorien) || [],
    priority: extractNotionProperty(props.Priorität) || 2,
    lastCheck: extractNotionProperty(props['Letzter Check']),
    notes: extractNotionProperty(props.Notizen) || ""
  };
}

export async function fetchSources(): Promise<CultureSource[]> {
  return getCultureSources();
}

// Check ob Notion verfügbar ist
export async function checkNotionConnection(): Promise<boolean> {
  if (!notionClient) {
    return false;
  }
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${EVENTS_DB_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Notion connection check failed:", error);
    return false;
  }
}