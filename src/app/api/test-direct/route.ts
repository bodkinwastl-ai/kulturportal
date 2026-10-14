import { NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  const SOURCES_DB_ID = '3f85e96f-2473-81c2-8c9f-e2f0491381e1';
  
  console.log("Direct test: Starting with NOTION_TOKEN:", !!process.env.NOTION_TOKEN);
  
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
    
    console.log(`Direct test: Response status ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Direct test: Error ${response.status}: ${errorText}`);
      return NextResponse.json({ 
        success: false, 
        error: `Notion API ${response.status}: ${errorText}`,
        hasToken: !!process.env.NOTION_TOKEN,
        tokenLength: process.env.NOTION_TOKEN?.length || 0
      });
    }
    
    const data = await response.json();
    console.log(`Direct test: Got ${data.results?.length || 0} results`);
    
    return NextResponse.json({ 
      success: true, 
      count: data.results?.length || 0,
      firstResult: data.results?.[0]?.properties?.Quelle?.title?.[0]?.text?.content || 'none',
      hasToken: !!process.env.NOTION_TOKEN,
      tokenLength: process.env.NOTION_TOKEN?.length || 0
    });
    
  } catch (error) {
    console.error("Direct test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      hasToken: !!process.env.NOTION_TOKEN,
      tokenLength: process.env.NOTION_TOKEN?.length || 0
    });
  }
}