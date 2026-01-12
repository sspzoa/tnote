import { useAtom, useSetAtom } from "jotai";
import Link from "next/link";
import { type Course, selectedCourseAtom } from "../(atoms)/useCoursesStore";
import { courseDaysOfWeekAtom, courseEndDateAtom, courseNameAtom, courseStartDateAtom } from "../(atoms)/useFormStore";
import { openMenuIdAtom, showEditModalAtom, showEnrollModalAtom } from "../(atoms)/useModalStore";
import { useCourseDelete } from "../(hooks)/useCourseDelete";

interface CourseListProps {
  courses: Course[];
}

export default function CourseList({ courses }: CourseListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const setSelectedCourse = useSetAtom(selectedCourseAtom);
  const setShowEditModal = useSetAtom(showEditModalAtom);
  const setShowEnrollModal = useSetAtom(showEnrollModalAtom);
  const setCourseName = useSetAtom(courseNameAtom);
  const setStartDate = useSetAtom(courseStartDateAtom);
  const setEndDate = useSetAtom(courseEndDateAtom);
  const setDaysOfWeek = useSetAtom(courseDaysOfWeekAtom);
  const { deleteCourse } = useCourseDelete();

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setCourseName(course.name);
    setStartDate(course.start_date || "");
    setEndDate(course.end_date || "");
    setDaysOfWeek(course.days_of_week || []);
    setShowEditModal(true);
  };

  const openEnrollModal = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`"${course.name}" 수업을 삭제하시겠습니까?\n등록된 학생 정보는 유지되지만 수강 기록이 삭제됩니다.`)) {
      return;
    }

    try {
      await deleteCourse(course.id);
      alert("수업이 삭제되었습니다.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("수업 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
          <tr>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              수업명
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              학생 수
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              관리
            </th>
            <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
              <td className="px-spacing-500 py-spacing-400">
                <Link href={`/courses/${course.id}`}>
                  <div className="cursor-pointer font-medium text-body text-content-standard-primary transition-colors hover:text-core-accent">
                    {course.name}
                  </div>
                </Link>
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                  {course.student_count || 0}명
                </span>
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <div className="flex gap-spacing-200">
                  <Link href={`/courses/${course.id}`}>
                    <button className="rounded-radius-300 bg-core-accent px-spacing-400 py-spacing-200 font-medium text-footnote text-solid-white transition-opacity hover:opacity-90">
                      시험 관리
                    </button>
                  </Link>
                  <button
                    onClick={() => openEnrollModal(course)}
                    className="rounded-radius-300 bg-solid-translucent-blue px-spacing-400 py-spacing-200 font-medium text-footnote text-solid-blue transition-colors hover:bg-solid-translucent-indigo">
                    학생 관리
                  </button>
                </div>
              </td>
              <td className="relative px-spacing-500 py-spacing-400">
                <button
                  onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                  className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
                  <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {openMenuId === course.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[120px] rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200 shadow-lg">
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          openEditModal(course);
                        }}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                        수정
                      </button>
                      <div className="my-spacing-100 border-line-divider border-t" />
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          handleDelete(course);
                        }}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative transition-colors hover:bg-solid-translucent-red">
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
