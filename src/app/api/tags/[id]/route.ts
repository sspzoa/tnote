import { NextResponse } from "next/server";
import { createDeleteHandler, createUpdateHandler, validationError } from "@/shared/lib/api/createCrudRoute";
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

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data: tag, error: tagError } = await supabase
    .from("StudentTags")
    .select("id, name, color")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (tagError || !tag) {
    return NextResponse.json({ error: "태그를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("StudentTagAssignments")
    .select(
      `
      id,
      student_id,
      tag_id,
      start_date,
      end_date,
      created_at,
      student:Users!inner(id, name, phone_number, school)
    `,
    )
    .eq("tag_id", id)
    .eq("student:Users.workspace", session.workspace);

  if (assignmentsError) throw assignmentsError;

  return NextResponse.json({ data: { tag, assignments: assignments || [] } });
};

export const GET = withLogging(handleGet, { resource: "tags", action: "read", allowedRoles: ["owner", "admin"] });

export const PATCH = createUpdateHandler({
  table: "StudentTags",
  resource: "tags",
  allowedRoles: ["owner", "admin"],
  idMissingMessage: "태그 ID가 필요합니다.",
  autoTimestamp: true,
  validate: async (body, ctx) => {
    const { name, color } = body;
    const { data, error } = await ctx.supabase
      .from("StudentTags")
      .select("id")
      .eq("id", ctx.params?.id)
      .eq("workspace", ctx.session.workspace)
      .single();
    if (error || !data) return validationError("태그를 찾을 수 없습니다.", 404);
    if (name !== undefined) {
      if (typeof name !== "string" || (name as string).trim().length === 0)
        return validationError("태그 이름은 필수입니다.");
      if ((name as string).length > 20) return validationError("태그 이름은 20자 이하여야 합니다.");
    }
    if (color !== undefined && !VALID_COLORS.includes(color as TagColor))
      return validationError("유효한 색상을 선택해주세요.");
    return null;
  },
  buildPayload: ({ name, color, hiddenByDefault }) => {
    const payload: Record<string, unknown> = {};
    if (name !== undefined) payload.name = (name as string).trim();
    if (color !== undefined) payload.color = color as TagColor;
    if (hiddenByDefault !== undefined) payload.hidden_by_default = hiddenByDefault;
    return payload;
  },
  duplicateErrorMessage: "이미 존재하는 태그 이름입니다.",
});

export const DELETE = createDeleteHandler({
  table: "StudentTags",
  resource: "tags",
  allowedRoles: ["owner", "admin"],
  idMissingMessage: "태그 ID가 필요합니다.",
  preCheck: async (id, ctx) => {
    const { data, error } = await ctx.supabase
      .from("StudentTags")
      .select("id")
      .eq("id", id)
      .eq("workspace", ctx.session.workspace)
      .single();
    if (error || !data) return validationError("태그를 찾을 수 없습니다.", 404);
    return null;
  },
});
