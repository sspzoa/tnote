import { type NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/shared/lib/supabase/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, session } = await getAuthenticatedClient();

    if (session.role !== "owner" && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: studentId } = await params;

    const { data, error } = await supabase
      .from("ConsultationLogs")
      .select("*")
      .eq("student_id", studentId)
      .eq("workspace", session.workspace)
      .order("consultation_date", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch consultation logs" }, { status: 500 });
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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, session } = await getAuthenticatedClient();

    if (session.role !== "owner" && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: studentId } = await params;
    const body = await request.json();

    const { consultationDate, title, content } = body;

    if (!consultationDate || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: student, error: studentError } = await supabase
      .from("Users")
      .select("id")
      .eq("id", studentId)
      .eq("workspace", session.workspace)
      .eq("role", "student")
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("ConsultationLogs")
      .insert({
        student_id: studentId,
        consultation_date: consultationDate,
        title: title,
        content: content,
        workspace: session.workspace,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to create consultation log" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
