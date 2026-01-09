import { NextResponse } from "next/server";
import { getAuthenticatedClient, getSession, requireAdminOrOwner } from "@/shared/lib/supabase/auth";

// 클리닉 목록 조회
export async function GET() {
  console.log("🟢 GET /api/clinics - Request received");
  try {
    const session = await getSession();
    if (!session) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    console.log("✅ Session found:", { userId: session.userId, role: session.role });

    const { supabase } = await getAuthenticatedClient();

    const { data, error } = await supabase.from("Clinics").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Database error:", error);
      throw error;
    }

    console.log("✅ Clinics fetched:", data?.length || 0, "records");
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("❌ Clinics fetch error:", error);
    return NextResponse.json({ error: "클리닉 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 클리닉 생성 (관리자만)
export async function POST(request: Request) {
  console.log("🔵 POST /api/clinics - Request received");
  try {
    console.log("🔵 Checking authorization...");
    await requireAdminOrOwner();
    console.log("✅ Authorization passed");

    const body = await request.json();
    console.log("🔵 Request body:", body);
    const { name, operatingDays, startDate, endDate } = body;

    if (!name || !operatingDays || !Array.isArray(operatingDays) || operatingDays.length === 0) {
      console.log("❌ Validation failed: missing name or operatingDays");
      return NextResponse.json({ error: "클리닉 이름과 운영 요일을 입력해주세요." }, { status: 400 });
    }

    if (!startDate || !endDate) {
      console.log("❌ Validation failed: missing dates");
      return NextResponse.json({ error: "시작 날짜와 종료 날짜를 입력해주세요." }, { status: 400 });
    }

    if (new Date(startDate) > new Date(endDate)) {
      console.log("❌ Validation failed: invalid date range");
      return NextResponse.json({ error: "시작 날짜는 종료 날짜보다 이전이어야 합니다." }, { status: 400 });
    }

    if (!operatingDays.every((d: number) => d >= 0 && d <= 6)) {
      console.log("❌ Validation failed: invalid days");
      return NextResponse.json({ error: "올바른 요일을 선택해주세요." }, { status: 400 });
    }

    console.log("🔵 Getting authenticated client...");
    const { supabase, session } = await getAuthenticatedClient();
    console.log("✅ Session:", { userId: session.userId, workspace: session.workspace, role: session.role });

    console.log("🔵 Inserting into database...", {
      name,
      operating_days: operatingDays,
      start_date: startDate,
      end_date: endDate,
      workspace: session.workspace,
    });

    const { data, error } = await supabase
      .from("Clinics")
      .insert({
        name,
        operating_days: operatingDays,
        start_date: startDate,
        end_date: endDate,
        workspace: session.workspace,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Database error:", error);
      throw error;
    }

    console.log("✅ Clinic created successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("❌ Clinic creation error:", error);
    console.error("❌ Error stack:", error.stack);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ error: "클리닉 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
