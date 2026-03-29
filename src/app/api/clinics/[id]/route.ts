import { createDeleteHandler, createUpdateHandler, validationError } from "@/shared/lib/api/createCrudRoute";

export const PATCH = createUpdateHandler({
  table: "Clinics",
  resource: "clinics",
  allowedRoles: ["owner", "admin"],
  idMissingMessage: "클리닉 ID가 필요합니다.",
  autoTimestamp: true,
  validate: (body) => {
    const { name, operatingDays, startDate, endDate } = body;
    if (name !== undefined) {
      if (typeof name !== "string" || (name as string).trim().length === 0)
        return validationError("클리닉 이름을 입력해주세요.");
      if ((name as string).length > 100) return validationError("클리닉 이름은 100자 이하여야 합니다.");
    }
    if (operatingDays !== undefined && operatingDays !== null) {
      if (
        !Array.isArray(operatingDays) ||
        !(operatingDays as number[]).every((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      )
        return validationError("올바른 요일을 선택해주세요.");
    }
    const effectiveStart = startDate !== undefined ? startDate : null;
    const effectiveEnd = endDate !== undefined ? endDate : null;
    if (effectiveStart && effectiveEnd && new Date(effectiveStart as string) > new Date(effectiveEnd as string))
      return validationError("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
    return null;
  },
  buildPayload: ({ name, operatingDays, startDate, endDate }) => {
    const payload: Record<string, unknown> = {};
    if (name !== undefined) payload.name = (name as string).trim();
    if (operatingDays !== undefined) payload.operating_days = operatingDays;
    if (startDate !== undefined) payload.start_date = (startDate as string) || null;
    if (endDate !== undefined) payload.end_date = (endDate as string) || null;
    return payload;
  },
});

export const DELETE = createDeleteHandler({
  table: "Clinics",
  resource: "clinics",
  allowedRoles: ["owner", "admin"],
  idMissingMessage: "클리닉 ID가 필요합니다.",
});
