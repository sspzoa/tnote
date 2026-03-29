import { createCreateHandler, createListHandler, validationError } from "@/shared/lib/api/createCrudRoute";

export const GET = createListHandler({
  table: "Clinics",
  resource: "clinics",
  allowedRoles: ["owner", "admin"],
  select: "id, name, operating_days, start_date, end_date, created_at",
});

export const POST = createCreateHandler({
  table: "Clinics",
  resource: "clinics",
  allowedRoles: ["owner", "admin"],
  validate: (body) => {
    const { name, operatingDays, startDate, endDate } = body;
    if (!name || !operatingDays || !Array.isArray(operatingDays) || (operatingDays as number[]).length === 0)
      return validationError("클리닉 이름과 운영 요일을 입력해주세요.");
    if (!startDate || !endDate) return validationError("시작 날짜와 종료 날짜를 입력해주세요.");
    if (new Date(startDate as string) > new Date(endDate as string))
      return validationError("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
    if (!(operatingDays as number[]).every((d) => d >= 0 && d <= 6))
      return validationError("올바른 요일을 선택해주세요.");
    return null;
  },
  buildPayload: ({ name, operatingDays, startDate, endDate }) => ({
    name,
    operating_days: operatingDays,
    start_date: startDate,
    end_date: endDate,
  }),
});
