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

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data, error } = await supabase
    .from("StudentTags")
    .select("*")
    .eq("workspace", session.workspace)
    .order("name", { ascending: true });

  if (error) throw error;
  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { name, color, hiddenByDefault } = await request.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "태그 이름은 필수입니다." }, { status: 400 });
  }

  if (name.length > 20) {
    return NextResponse.json({ error: "태그 이름은 20자 이하여야 합니다." }, { status: 400 });
  }

  if (!color || !VALID_COLORS.includes(color)) {
    return NextResponse.json({ error: "유효한 색상을 선택해주세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("StudentTags")
    .insert({
      workspace: session.workspace,
      name: name.trim(),
      color,
      hidden_by_default: hiddenByDefault ?? false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 존재하는 태그 이름입니다." }, { status: 409 });
    }
    throw error;
  }
  return NextResponse.json({ success: true, data }, { status: 201 });
};

export const GET = withLogging(handleGet, { resource: "tags", action: "read", allowedRoles: ["owner", "admin"] });
export const POST = withLogging(handlePost, { resource: "tags", action: "create", allowedRoles: ["owner", "admin"] });
