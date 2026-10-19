import { NextRequest, NextResponse } from "next/server";
import { getCultureSources, createCultureSource } from "@/lib/notion";
import { mockSources } from "@/lib/mock-events";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sources = await getCultureSources();
    
    // Check if we got real data by checking for specific mock IDs
    const isRealData = sources.length > 4 && !sources.some(s => s.id === "1" && s.name === "Vienna.at");
    
    return NextResponse.json({
      sources,
      notionConnected: isRealData
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      sources: mockSources,
      notionConnected: false
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newSource = await createCultureSource(body);
    
    return NextResponse.json({ success: true, source: newSource });
  } catch (error) {
    console.error("Error creating source:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create source" },
      { status: 500 }
    );
  }
}