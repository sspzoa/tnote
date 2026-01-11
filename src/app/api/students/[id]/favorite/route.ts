import { NextResponse } from "next/server";
import { getAuthenticatedClient, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminOrOwner();
    const { supabase, session } = await getAuthenticatedClient();
    const { is_favorite } = await request.json();
    const { id } = await params;

    if (typeof is_favorite !== "boolean") {
      return NextResponse.json({ error: "is_favorite must be a boolean" }, { status: 400 });
    }

    // Verify student belongs to workspace
    const { data: student, error: fetchError } = await supabase
      .from("Users")
      .select("id, workspace")
      .eq("id", id)
      .eq("workspace", session.workspace)
      .eq("role", "student")
      .single();

    if (fetchError || !student) {
      return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("Users")
      .update({ is_favorite })
      .eq("id", id)
      .eq("workspace", session.workspace);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "즐겨찾기 업데이트에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Favorite toggle error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
