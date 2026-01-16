export const getTodayKST = (): string => {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
};
