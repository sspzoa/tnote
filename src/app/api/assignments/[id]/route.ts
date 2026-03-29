import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

interface AssignmentWithCourseWorkspace {
  id: string;
  course_id: string;
  course: {
    workspace: string;
  };
}

const handleGet = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data, error } = await supabase
    .from("Assignments")
    .select(`
      *,
      course:Courses!inner(id, name, workspace)
    `)
    .eq("id", id)
    .eq("course.workspace", session.workspace)
    .single();

  if (error) throw error;
  return NextResponse.json({ data });
};

const handlePatch = async ({ request, supabase, session, params }: ApiContext) => {
  const id = params?.id;
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "과제 이름을 입력해주세요." }, { status: 400 });
  }

  const { data: assignment } = await supabase
    .from("Assignments")
    .select("id, course_id, course:Courses!inner(workspace)")
    .eq("id", id)
    .eq("course.workspace", session.workspace)
    .single();

  const typedAssignment = assignment as unknown as AssignmentWithCourseWorkspace | null;
  if (!typedAssignment) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("Assignments")
    .update({ name })
    .eq("id", id)
    .select(`
      *,
      course:Courses(id, name)
    `)
    .single();

  if (error) throw error;
  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, params }: ApiContext) => {
  const id = params?.id;

  const { data: assignment } = await supabase
    .from("Assignments")
    .select("id, course_id, course:Courses!inner(workspace)")
    .eq("id", id)
    .eq("course.workspace", session.workspace)
    .single();

  const typedAssignment = assignment as unknown as AssignmentWithCourseWorkspace | null;
  if (!typedAssignment) {
    return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 });
  }

  const { error } = await supabase.from("Assignments").delete().eq("id", id);

  if (error) throw error;
  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, {
  resource: "assignments",
  action: "read",
  allowedRoles: ["owner", "admin"],
});
export const PATCH = withLogging(handlePatch, {
  resource: "assignments",
  action: "update",
  allowedRoles: ["owner", "admin"],
});
export const DELETE = withLogging(handleDelete, {
  resource: "assignments",
  action: "delete",
  allowedRoles: ["owner", "admin"],
});
