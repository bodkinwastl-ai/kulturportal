import { NextRequest, NextResponse } from "next/server";
import { updateCultureSource, deleteCultureSource } from "@/lib/notion";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const success = await updateCultureSource(id, body);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to update source" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating source:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update source" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const success = await deleteCultureSource(id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to delete source" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting source:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete source" },
      { status: 500 }
    );
  }
}