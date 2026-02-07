import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { createAdminClient } from "@/shared/lib/supabase/server";
import { isValidBirthYear, isValidPhoneNumber, removePhoneHyphens } from "@/shared/lib/utils/phone";

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "학생 ID가 필요합니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Users")
    .select("id, phone_number, name, parent_phone_number, school, branch, birth_year")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (error) throw error;
  return NextResponse.json({ data });
};

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "학생 ID가 필요합니다." }, { status: 400 });
  }

  const { name, phoneNumber, parentPhoneNumber, school, branch, birthYear } = await request.json();

  const updateData: Record<string, unknown> = {};

  // 이름 검증
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 50) {
      return NextResponse.json({ error: "이름은 1~50자 사이여야 합니다." }, { status: 400 });
    }
    updateData.name = name.trim();
  }

  // 전화번호 검증
  if (phoneNumber !== undefined) {
    const cleanedPhoneNumber = removePhoneHyphens(phoneNumber);
    if (!isValidPhoneNumber(cleanedPhoneNumber)) {
      return NextResponse.json({ error: "올바른 전화번호 형식이 아닙니다." }, { status: 400 });
    }
    updateData.phone_number = cleanedPhoneNumber;
  }

  // 학부모 전화번호 검증
  if (parentPhoneNumber !== undefined) {
    if (parentPhoneNumber) {
      const cleanedParentPhone = removePhoneHyphens(parentPhoneNumber);
      if (!isValidPhoneNumber(cleanedParentPhone)) {
        return NextResponse.json({ error: "올바른 학부모 전화번호 형식이 아닙니다." }, { status: 400 });
      }
      updateData.parent_phone_number = cleanedParentPhone;
    } else {
      updateData.parent_phone_number = null;
    }
  }

  // 학교 검증
  if (school !== undefined) {
    if (school && typeof school === "string" && school.length > 100) {
      return NextResponse.json({ error: "학교 이름은 100자 이하여야 합니다." }, { status: 400 });
    }
    updateData.school = school?.trim() || null;
  }

  // 지점 검증
  if (branch !== undefined) {
    if (branch && typeof branch === "string" && branch.length > 100) {
      return NextResponse.json({ error: "지점 이름은 100자 이하여야 합니다." }, { status: 400 });
    }
    updateData.branch = branch?.trim() || null;
  }

  // 출생연도 검증
  if (birthYear !== undefined) {
    if (birthYear) {
      const year = Number.parseInt(birthYear);
      if (Number.isNaN(year) || !isValidBirthYear(year)) {
        return NextResponse.json({ error: "올바른 출생연도가 아닙니다." }, { status: 400 });
      }
      updateData.birth_year = year;
    } else {
      updateData.birth_year = null;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "수정할 항목이 없습니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Users")
    .update(updateData)
    .eq("id", id)
    .eq("workspace", session.workspace)
    .select("id, phone_number, name, parent_phone_number, school, branch, birth_year")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 등록된 전화번호입니다." }, { status: 409 });
    }
    throw error;
  }

  if (updateData.phone_number || updateData.name) {
    const adminSupabase = createAdminClient();
    const authUpdate: Record<string, unknown> = {};
    if (updateData.phone_number) {
      authUpdate.email = `${updateData.phone_number}@tnote.local`;
    }
    const metadataUpdate: Record<string, unknown> = {};
    if (updateData.name) {
      metadataUpdate.name = updateData.name;
    }
    await adminSupabase.auth.admin.updateUserById(id!, {
      ...authUpdate,
      ...(Object.keys(metadataUpdate).length > 0 ? { user_metadata: metadataUpdate } : {}),
    });
  }

  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "학생 ID가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabase.from("Users").delete().eq("id", id).eq("workspace", session.workspace);

  if (error) throw error;

  const adminSupabase = createAdminClient();
  await adminSupabase.auth.admin.deleteUser(id!);

  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, { resource: "students", action: "read", allowedRoles: ["owner", "admin"] });
export const PATCH = withLogging(handlePatch, {
  resource: "students",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
export const DELETE = withLogging(handleDelete, {
  resource: "students",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
