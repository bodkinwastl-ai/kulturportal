import { NextRequest, NextResponse } from "next/server";
import { updateEvent, checkNotionConnection } from "@/lib/notion";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Füge lastReviewedAt hinzu bei Status-Updates
    if (body.status) {
      body.lastReviewedAt = new Date().toISOString();
    }
    
    await updateEvent(id, body);
    const notionConnected = await checkNotionConnection();

    return NextResponse.json({
      success: true,
      message: notionConnected ? "Event erfolgreich aktualisiert" : "Update simuliert (Mock-Modus)"
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler beim Aktualisieren des Events" },
      { status: 500 }
    );
  }
}