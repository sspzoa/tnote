export const isTagActive = (startDate: string, endDate: string | null): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (start > today) return false;

  if (!endDate) return true;

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return end >= today;
};
