import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import type { TagColor } from "@/shared/types";

const VALID_COLORS: TagColor[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
  "brown",
  "black",
  "white",
];

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const { name, color } = await request.json();

  const { data: existingTag, error: fetchError } = await supabase
    .from("StudentTags")
    .select("id")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (fetchError || !existingTag) {
    return NextResponse.json({ error: "태그를 찾을 수 없습니다." }, { status: 404 });
  }

  const updates: { name?: string; color?: TagColor; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "태그 이름은 필수입니다." }, { status: 400 });
    }
    if (name.length > 20) {
      return NextResponse.json({ error: "태그 이름은 20자 이하여야 합니다." }, { status: 400 });
    }
    updates.name = name.trim();
  }

  if (color !== undefined) {
    if (!VALID_COLORS.includes(color)) {
      return NextResponse.json({ error: "유효한 색상을 선택해주세요." }, { status: 400 });
    }
    updates.color = color;
  }

  const { data, error } = await supabase
    .from("StudentTags")
    .update(updates)
    .eq("id", id)
    .eq("workspace", session.workspace)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 존재하는 태그 이름입니다." }, { status: 409 });
    }
    throw error;
  }
  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data: existingTag, error: fetchError } = await supabase
    .from("StudentTags")
    .select("id")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (fetchError || !existingTag) {
    return NextResponse.json({ error: "태그를 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await supabase.from("StudentTags").delete().eq("id", id).eq("workspace", session.workspace);

  if (error) throw error;
  return NextResponse.json({ success: true });
};

export const PATCH = withLogging(handlePatch, { resource: "tags", action: "update", allowedRoles: ["owner", "admin"] });
export const DELETE = withLogging(handleDelete, {
  resource: "tags",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
