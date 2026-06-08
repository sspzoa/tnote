import { useSetAtom } from "jotai";
import Link from "next/link";
import { useMemo } from "react";
import { Badge, Button } from "@/shared/components/ui";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { useToast } from "@/shared/hooks/useToast";
import { formatDateDotYMD } from "@/shared/lib/utils/date";
import { type Course, selectedCourseAtom } from "../(atoms)/useCoursesStore";
import { courseDaysOfWeekAtom, courseEndDateAtom, courseNameAtom, courseStartDateAtom } from "../(atoms)/useFormStore";
import { showEditModalAtom, showEnrollModalAtom } from "../(atoms)/useModalStore";
import { useCourseDelete } from "../(hooks)/useCourseDelete";

interface CourseListProps {
  courses: Course[];
}

type CourseSortKey = "name" | "studentCount";

export default function CourseList({ courses }: CourseListProps) {
  const setSelectedCourse = useSetAtom(selectedCourseAtom);
  const setShowEditModal = useSetAtom(showEditModalAtom);
  const setShowEnrollModal = useSetAtom(showEnrollModalAtom);
  const setCourseName = useSetAtom(courseNameAtom);
  const setStartDate = useSetAtom(courseStartDateAtom);
  const setEndDate = useSetAtom(courseEndDateAtom);
  const setDaysOfWeek = useSetAtom(courseDaysOfWeekAtom);
  const { deleteCourse } = useCourseDelete();
  const toast = useToast();
  const confirm = useConfirm();

  const comparators = useMemo(
    () => ({
      name: (a: Course, b: Course) => a.name.localeCompare(b.name, "ko"),
      studentCount: (a: Course, b: Course) => (a.student_count || 0) - (b.student_count || 0),
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<Course, CourseSortKey>({
    data: courses,
    comparators,
    defaultSort: { key: "name", direction: "asc" },
  });

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
    const ok = await confirm({
      title: "수업 삭제",
      message: `"${course.name}" 수업을 삭제하시겠습니까?`,
      description: "등록된 학생 정보는 유지되지만 수강 기록이 삭제됩니다.",
      variant: "danger",
      confirmLabel: "삭제",
    });
    if (!ok) return;

    try {
      await deleteCourse(course.id);
      toast.success("수업이 삭제되었습니다.");
    } catch {
      toast.error("수업 삭제에 실패했습니다.");
    }
  };

  const getMenuItems = (course: Course): DropdownMenuItem[] => [
    { label: "수정", onClick: () => openEditModal(course), dividerAfter: true },
    { label: "삭제", onClick: () => handleDelete(course), variant: "danger" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full rounded-lg">
        <thead className="bg-muted">
          <tr>
            <SortableHeader
              label="수업명"
              sortKey="name"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="학생 수"
              sortKey="studentCount"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <th className="whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground">기간</th>
            <th className="whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground">관리</th>
            <th className="w-24 whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground" />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((course) => (
            <tr key={course.id} className="border-border border-t transition-colors hover:bg-accent">
              <td className="whitespace-nowrap px-5 py-4">
                <Link href={`/courses/${course.id}`}>
                  <div className="cursor-pointer font-medium text-base text-foreground transition-colors hover:text-primary">
                    {course.name}
                  </div>
                </Link>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <Badge variant="blue" size="sm">
                  {course.student_count || 0}명
                </Badge>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <span className="text-base text-muted-foreground">
                  {formatDateDotYMD(course.start_date)} ~ {formatDateDotYMD(course.end_date)}
                </span>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <div className="flex gap-2">
                  <Link href={`/courses/${course.id}`}>
                    <Button size="xs" className="font-medium">
                      시험 및 과제 관리
                    </Button>
                  </Link>
                  <Button
                    variant="translucent"
                    size="xs"
                    className="font-medium"
                    onClick={() => openEnrollModal(course)}>
                    학생 관리
                  </Button>
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <DropdownMenu items={getMenuItems(course)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
