import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const buildInfo = {
    version: "0.1.0",
    name: "Kulturportal",
    build: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    notionToken: process.env.NOTION_TOKEN ? "✓ set" : "✗ missing",
    basicAuth: process.env.BASIC_AUTH_USER ? "✓ configured" : "✗ missing",
  };

  return NextResponse.json(buildInfo);
}