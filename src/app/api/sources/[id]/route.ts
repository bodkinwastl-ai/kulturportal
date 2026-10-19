import { NextRequest, NextResponse } from "next/server";
import { updateCultureSource, deleteCultureSource, restoreCultureSource } from "@/lib/notion";

const fail = (error: unknown, fallback: string) =>
  NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : fallback },
    { status: 500 }
  );

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // { restore: true } un-archives a deleted source
    if (body.restore === true) {
      await restoreCultureSource(id);
    } else {
      await updateCultureSource(id, body);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating source:", error);
    return fail(error, "Failed to update source");
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteCultureSource(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting source:", error);
    return fail(error, "Failed to delete source");
  }
}
