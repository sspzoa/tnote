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

export const hasActiveHiddenTag = (student: {
  tags?: { start_date: string; end_date: string | null; tag?: { hidden_by_default: boolean } }[];
}): boolean => {
  if (!student.tags || student.tags.length === 0) return false;
  return student.tags.some(
    (assignment) => assignment.tag?.hidden_by_default && isTagActive(assignment.start_date, assignment.end_date),
  );
};
