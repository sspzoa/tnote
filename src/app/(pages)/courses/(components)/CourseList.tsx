import { useAtom, useSetAtom } from "jotai";
import Link from "next/link";
import { DropdownMenu, type DropdownMenuItem, MoreOptionsButton } from "@/shared/components/ui/dropdownMenu";
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

  const getMenuItems = (course: Course): DropdownMenuItem[] => [
    { label: "수정", onClick: () => openEditModal(course), dividerAfter: true },
    { label: "삭제", onClick: () => handleDelete(course), variant: "danger" },
  ];

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <div className="space-y-spacing-300 md:hidden">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-400">
            <div className="mb-spacing-300 flex items-start justify-between">
              <Link href={`/courses/${course.id}`}>
                <div className="font-medium text-body text-content-standard-primary transition-colors hover:text-core-accent">
                  {course.name}
                </div>
              </Link>
              <div className="relative">
                <MoreOptionsButton onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)} />
                <DropdownMenu
                  isOpen={openMenuId === course.id}
                  onClose={() => setOpenMenuId(null)}
                  items={getMenuItems(course)}
                />
              </div>
            </div>

            <div className="mb-spacing-300">
              <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                {course.student_count || 0}명
              </span>
            </div>

            <div className="flex flex-wrap gap-spacing-200">
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
          </div>
        ))}
      </div>

      {/* 데스크탑 테이블 뷰 */}
      <div className="hidden rounded-radius-400 border border-line-outline bg-components-fill-standard-primary md:block">
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
              <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
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
                  <MoreOptionsButton onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)} />
                  <DropdownMenu
                    isOpen={openMenuId === course.id}
                    onClose={() => setOpenMenuId(null)}
                    items={getMenuItems(course)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
