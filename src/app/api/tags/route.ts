import { createCreateHandler, createListHandler, validationError } from "@/shared/lib/api/createCrudRoute";
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

export const GET = createListHandler({
  table: "StudentTags",
  resource: "tags",
  allowedRoles: ["owner", "admin"],
  orderBy: { column: "name", ascending: true },
});

export const POST = createCreateHandler({
  table: "StudentTags",
  resource: "tags",
  allowedRoles: ["owner", "admin"],
  validate: (body) => {
    const { name, color } = body;
    if (!name || typeof name !== "string" || (name as string).trim().length === 0)
      return validationError("태그 이름은 필수입니다.");
    if ((name as string).length > 20) return validationError("태그 이름은 20자 이하여야 합니다.");
    if (!color || !VALID_COLORS.includes(color as TagColor)) return validationError("유효한 색상을 선택해주세요.");
    return null;
  },
  buildPayload: ({ name, color, hiddenByDefault }) => ({
    name: (name as string).trim(),
    color: color as TagColor,
    hidden_by_default: (hiddenByDefault as boolean) ?? false,
  }),
  duplicateErrorMessage: "이미 존재하는 태그 이름입니다.",
});
