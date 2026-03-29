import { createCreateHandler, createListHandler, validationError } from "@/shared/lib/api/createCrudRoute";

export const GET = createListHandler({
  table: "Courses",
  resource: "courses",
  allowedRoles: ["owner", "admin"],
  select: "*, enrollments:CourseEnrollments(count)",
  transformResults: (data) =>
    (data as Array<Record<string, unknown>>).map((course) => ({
      ...course,
      student_count: (course.enrollments as Array<{ count: number }>)[0]?.count || 0,
      enrollments: undefined,
    })),
});

export const POST = createCreateHandler({
  table: "Courses",
  resource: "courses",
  allowedRoles: ["owner", "admin"],
  validate: (body) => {
    const { name, startDate, endDate, daysOfWeek } = body;
    if (!name) return validationError("수업 이름을 입력해주세요.");
    if (startDate && endDate && new Date(startDate as string) > new Date(endDate as string))
      return validationError("시작일은 종료일보다 앞서야 합니다.");
    if (daysOfWeek && (!Array.isArray(daysOfWeek) || !(daysOfWeek as number[]).every((d) => d >= 0 && d <= 6)))
      return validationError("올바른 요일을 선택해주세요.");
    return null;
  },
  buildPayload: ({ name, startDate, endDate, daysOfWeek }) => ({
    name,
    start_date: (startDate as string) || null,
    end_date: (endDate as string) || null,
    days_of_week: (daysOfWeek as number[]) || null,
  }),
});
