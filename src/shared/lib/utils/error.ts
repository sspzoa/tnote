export function getErrorMessage(error: unknown, fallback = "작업에 실패했습니다."): string {
  if (error instanceof Error) return error.message;
  return fallback;
}
