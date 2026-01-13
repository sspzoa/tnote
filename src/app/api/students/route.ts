import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ request, supabase, session, logger }: ApiContext) => {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (courseId) {
    const { data: courseData, error: courseError } = await supabase
      .from("Courses")
      .select("workspace")
      .eq("id", courseId)
      .eq("workspace", session.workspace)
      .single();

    if (courseError || !courseData) {
      return NextResponse.json({ error: "코스를 찾을 수 없습니다." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("CourseEnrollments")
      .select(`
        student_id,
        enrolled_at,
        student:Users!CourseEnrollments_student_id_fkey!inner(
          id,
          phone_number,
          name,
          parent_phone_number,
          school,
          birth_year,
          is_favorite,
          workspace
        )
      `)
      .eq("course_id", courseId)
      .eq("student.workspace", session.workspace)
      .order("enrolled_at", { ascending: true });

    if (error) throw error;

    const students = data.map((enrollment) => ({
      ...enrollment.student,
      enrolled_at: enrollment.enrolled_at,
    }));

    await logger.info("read", "students", `Retrieved ${students.length} students for course ${courseId}`);
    return NextResponse.json({ data: students });
  }

  const { data, error } = await supabase
    .from("Users")
    .select("id, phone_number, name, parent_phone_number, school, birth_year, is_favorite, created_at")
    .eq("role", "student")
    .eq("workspace", session.workspace)
    .order("name", { ascending: true });

  if (error) throw error;

  await logger.info("read", "students", `Retrieved ${data.length} students`);
  return NextResponse.json({ data });
};

const handlePost = async ({ request, supabase, session, logger }: ApiContext) => {
  const { name, phoneNumber, parentPhoneNumber, school, birthYear } = await request.json();

  if (!name || !phoneNumber) {
    return NextResponse.json({ error: "이름과 전화번호는 필수입니다." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(phoneNumber, 10);

  const { data, error } = await supabase
    .from("Users")
    .insert({
      name,
      phone_number: phoneNumber,
      parent_phone_number: parentPhoneNumber || null,
      school: school || null,
      birth_year: birthYear ? Number.parseInt(birthYear) : null,
      password: hashedPassword,
      role: "student",
      workspace: session.workspace,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "이미 등록된 전화번호입니다." }, { status: 409 });
    }
    throw error;
  }

  await logger.logCreate("students", data.id, `Student created: ${name}`);
  return NextResponse.json({ success: true, data });
};

export const GET = withLogging(handleGet, { resource: "students", action: "read" });
export const POST = withLogging(handlePost, { resource: "students", action: "create" });
