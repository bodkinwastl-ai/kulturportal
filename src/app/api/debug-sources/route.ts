import { NextRequest, NextResponse } from "next/server";
import { getCultureSources } from "@/lib/notion";

export async function GET() {
  const debug = {
    hasToken: !!process.env.NOTION_TOKEN,
    tokenLength: process.env.NOTION_TOKEN?.length || 0,
    tokenPreview: process.env.NOTION_TOKEN?.substring(0, 15) + '...',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  try {
    const sources = await getCultureSources();
    
    return NextResponse.json({
      debug,
      sourcesCount: sources.length,
      firstSourceName: sources[0]?.name || 'none',
      mockDetected: sources.some(s => s.id === "1" && s.name === "Vienna.at")
    });
  } catch (error) {
    return NextResponse.json({
      debug,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}