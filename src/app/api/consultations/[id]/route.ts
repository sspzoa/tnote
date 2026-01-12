import { type NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, session } = await getAuthenticatedClient();

    if (session.role !== "owner" && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: consultationId } = await params;
    const body = await request.json();

    const { consultationDate, title, content } = body;

    if (!consultationDate || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ConsultationLogs")
      .update({
        consultation_date: consultationDate,
        title: title,
        content: content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultationId)
      .eq("workspace", session.workspace)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to update consultation log" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Consultation log not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, session } = await getAuthenticatedClient();

    if (session.role !== "owner" && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: consultationId } = await params;

    const { error } = await supabase
      .from("ConsultationLogs")
      .delete()
      .eq("id", consultationId)
      .eq("workspace", session.workspace);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to delete consultation log" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
