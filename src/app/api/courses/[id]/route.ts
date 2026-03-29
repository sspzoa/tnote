import {
  createDeleteHandler,
  createDetailHandler,
  createUpdateHandler,
  validationError,
} from "@/shared/lib/api/createCrudRoute";

export const GET = createDetailHandler({
  table: "Courses",
  resource: "courses",
  allowedRoles: ["owner", "admin"],
  select: "*, student_count:CourseEnrollments(count)",
  idMissingMessage: "수업 ID가 필요합니다.",
  transformResult: (data) => {
    const course = data as Record<string, unknown>;
    return {
      ...course,
      student_count: (course.student_count as Array<{ count: number }>)?.[0]?.count || 0,
    };
  },
});

export const PATCH = createUpdateHandler({
  table: "Courses",
  resource: "courses",
  allowedRoles: ["owner", "admin"],
  idMissingMessage: "수업 ID가 필요합니다.",
  validate: (body) => {
    const { name, startDate, endDate, daysOfWeek } = body;
    if (name !== undefined) {
      if (typeof name !== "string" || (name as string).trim().length === 0)
        return validationError("수업 이름을 입력해주세요.");
      if ((name as string).length > 100) return validationError("수업 이름은 100자 이하여야 합니다.");
    }
    if (startDate && endDate && new Date(startDate as string) > new Date(endDate as string))
      return validationError("시작일은 종료일보다 앞서야 합니다.");
    if (
      daysOfWeek !== undefined &&
      daysOfWeek !== null &&
      (!Array.isArray(daysOfWeek) || !(daysOfWeek as number[]).every((d) => Number.isInteger(d) && d >= 0 && d <= 6))
    )
      return validationError("올바른 요일을 선택해주세요.");
    return null;
  },
  buildPayload: ({ name, startDate, endDate, daysOfWeek }) => {
    const payload: Record<string, unknown> = {};
    if (name !== undefined) payload.name = (name as string).trim();
    if (startDate !== undefined) payload.start_date = (startDate as string) || null;
    if (endDate !== undefined) payload.end_date = (endDate as string) || null;
    if (daysOfWeek !== undefined) payload.days_of_week = (daysOfWeek as number[]) || null;
    return payload;
  },
});

export const DELETE = createDeleteHandler({
  table: "Courses",
  resource: "courses",
  allowedRoles: ["owner", "admin"],
  idMissingMessage: "수업 ID가 필요합니다.",
});
