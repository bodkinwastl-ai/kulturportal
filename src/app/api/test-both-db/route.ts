import { NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  const EVENTS_DB_ID = '3f85e96f-2473-817b-b31e-d0ea97414538';  // Events DB - should work
  const SOURCES_DB_ID = '3f85e96f-2473-81c2-8c9f-e2f0491381e1'; // Sources DB - problematic
  
  const results: { events: any, sources: any } = { events: null, sources: null };
  
  // Test Events DB
  try {
    const eventsResponse = await fetch(`https://api.notion.com/v1/databases/${EVENTS_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({})
    });
    
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      results.events = { success: true, count: eventsData.results?.length || 0 };
    } else {
      const errorText = await eventsResponse.text();
      results.events = { success: false, error: `${eventsResponse.status}: ${errorText}` };
    }
  } catch (error) {
    results.events = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
  
  // Test Sources DB
  try {
    const sourcesResponse = await fetch(`https://api.notion.com/v1/databases/${SOURCES_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({})
    });
    
    if (sourcesResponse.ok) {
      const sourcesData = await sourcesResponse.json();
      results.sources = { success: true, count: sourcesData.results?.length || 0 };
    } else {
      const errorText = await sourcesResponse.text();
      results.sources = { success: false, error: `${sourcesResponse.status}: ${errorText}` };
    }
  } catch (error) {
    results.sources = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
  
  return NextResponse.json({ 
    comparison: results,
    hasToken: !!process.env.NOTION_TOKEN,
    tokenLength: process.env.NOTION_TOKEN?.length || 0
  });
}