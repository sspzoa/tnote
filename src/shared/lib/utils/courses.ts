/**
 * 종료일이 오늘 이후인 활성 코스만 필터링
 */
export const filterActiveCourses = <T extends { end_date?: string | null }>(courses: T[]): T[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return courses.filter((course) => {
    if (!course.end_date) return true;
    const endDate = new Date(course.end_date);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });
};
