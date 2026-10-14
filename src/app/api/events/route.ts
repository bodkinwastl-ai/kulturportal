import { NextResponse } from "next/server";
import { fetchEvents, checkNotionConnection } from "@/lib/notion";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await fetchEvents();
    const notionConnected = await checkNotionConnection();
    
    return NextResponse.json({
      events,
      notionConnected,
      message: notionConnected ? "Daten aus Notion geladen" : "Mock-Daten aktiv - Notion nicht verfügbar"
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Events" },
      { status: 500 }
    );
  }
}