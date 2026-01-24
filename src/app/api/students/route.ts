import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { isValidBirthYear, isValidPhoneNumber, removePhoneHyphens } from "@/shared/lib/utils/phone";

const handleGet = async ({ request, supabase, session }: ApiContext) => {
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

    const [enrollmentResult, consultationResult] = await Promise.all([
      supabase
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
            branch,
            birth_year,
            workspace
          )
        `)
        .eq("course_id", courseId)
        .eq("student.workspace", session.workspace),
      supabase.from("ConsultationLogs").select("student_id").eq("workspace", session.workspace),
    ]);

    if (enrollmentResult.error) throw enrollmentResult.error;
    if (consultationResult.error) throw consultationResult.error;

    const enrolledStudentIds = new Set(enrollmentResult.data.map((e) => e.student_id));
    const countMap = new Map<string, number>();
    for (const log of consultationResult.data) {
      if (enrolledStudentIds.has(log.student_id)) {
        countMap.set(log.student_id, (countMap.get(log.student_id) || 0) + 1);
      }
    }

    const students = enrollmentResult.data.map((enrollment) => {
      const student = enrollment.student as unknown as { id: string; name: string; [key: string]: unknown };
      return {
        ...student,
        enrolled_at: enrollment.enrolled_at,
        consultation_count: countMap.get(enrollment.student_id) || 0,
      };
    });
    return NextResponse.json({ data: students });
  }

  const { data, error } = await supabase
    .from("Users")
    .select("id, phone_number, name, parent_phone_number, school, branch, birth_year, created_at")
    .eq("role", "student")
    .eq("workspace", session.workspace);

  if (error) throw error;

  const studentIds = data.map((student) => student.id);

  const [consultationResult, tagsResult] = await Promise.all([
    supabase
      .from("ConsultationLogs")
      .select("student_id")
      .eq("workspace", session.workspace)
      .in("student_id", studentIds),
    supabase
      .from("StudentTagAssignments")
      .select(`
        student_id,
        id,
        tag_id,
        start_date,
        end_date,
        created_at,
        tag:StudentTags!inner(id, name, color, workspace)
      `)
      .in("student_id", studentIds)
      .eq("tag.workspace", session.workspace),
  ]);

  if (consultationResult.error) throw consultationResult.error;
  if (tagsResult.error) throw tagsResult.error;

  const countMap = new Map<string, number>();
  for (const log of consultationResult.data) {
    countMap.set(log.student_id, (countMap.get(log.student_id) || 0) + 1);
  }

  const tagsMap = new Map<string, typeof tagsResult.data>();
  for (const assignment of tagsResult.data) {
    const existing = tagsMap.get(assignment.student_id) || [];
    existing.push(assignment);
    tagsMap.set(assignment.student_id, existing);
  }

  const studentsWithData = data.map((student) => ({
    ...student,
    consultation_count: countMap.get(student.id) || 0,
    tags: tagsMap.get(student.id) || [],
  }));
  return NextResponse.json({ data: studentsWithData });
};

const handlePost = async ({ request, supabase, session }: ApiContext) => {
  const { name, phoneNumber, parentPhoneNumber, school, branch, birthYear } = await request.json();

  if (!name || !phoneNumber) {
    return NextResponse.json({ error: "이름과 전화번호는 필수입니다." }, { status: 400 });
  }

  if (typeof name !== "string" || name.trim().length === 0 || name.length > 50) {
    return NextResponse.json({ error: "이름은 1~50자 사이여야 합니다." }, { status: 400 });
  }

  const cleanedPhoneNumber = removePhoneHyphens(phoneNumber);
  if (!isValidPhoneNumber(cleanedPhoneNumber)) {
    return NextResponse.json({ error: "올바른 전화번호 형식이 아닙니다." }, { status: 400 });
  }

  if (parentPhoneNumber) {
    const cleanedParentPhone = removePhoneHyphens(parentPhoneNumber);
    if (!isValidPhoneNumber(cleanedParentPhone)) {
      return NextResponse.json({ error: "올바른 학부모 전화번호 형식이 아닙니다." }, { status: 400 });
    }
  }

  if (birthYear) {
    const year = Number.parseInt(birthYear);
    if (Number.isNaN(year) || !isValidBirthYear(year)) {
      return NextResponse.json({ error: "올바른 출생연도가 아닙니다." }, { status: 400 });
    }
  }

  const hashedPassword = await bcrypt.hash(cleanedPhoneNumber, 10);

  const { data, error } = await supabase
    .from("Users")
    .insert({
      name: name.trim(),
      phone_number: cleanedPhoneNumber,
      parent_phone_number: parentPhoneNumber ? removePhoneHyphens(parentPhoneNumber) : null,
      school: school?.trim() || null,
      branch: branch?.trim() || null,
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
  return NextResponse.json({ success: true, data }, { status: 201 });
};

export const GET = withLogging(handleGet, { resource: "students", action: "read", allowedRoles: ["owner", "admin"] });
export const POST = withLogging(handlePost, {
  resource: "students",
  action: "create",
  allowedRoles: ["owner", "admin"],
});
