import { useSetAtom } from "jotai";
import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import { Badge, Button } from "@/shared/components/ui";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { useToast } from "@/shared/hooks/useToast";
import { formatDateDotYMD } from "@/shared/lib/utils/date";
import { type Course, selectedCourseAtom } from "../(atoms)/useCoursesStore";
import { courseDaysOfWeekAtom, courseEndDateAtom, courseNameAtom, courseStartDateAtom } from "../(atoms)/useFormStore";
import { showEditModalAtom, showEnrollModalAtom } from "../(atoms)/useModalStore";
import { useCourseDelete } from "../(hooks)/useCourseDelete";

interface CourseListProps {
  courses: Course[];
  isLoading?: boolean;
  empty?: ReactNode;
}

type CourseSortKey = "name" | "studentCount";

export default function CourseList({ courses, isLoading, empty }: CourseListProps) {
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

  const columns: DataTableColumn<Course, CourseSortKey>[] = [
    {
      id: "name",
      header: "수업명",
      sortKey: "name",
      cell: (course) => {
        const hasPeriod = course.start_date || course.end_date;
        return (
          <Link href={`/courses/${course.id}`} className="group flex min-w-0 flex-col gap-0.5 text-left">
            <span className="font-medium text-foreground transition-colors group-hover:text-primary">
              {course.name}
            </span>
            {hasPeriod && (
              <span className="text-muted-foreground text-xs">
                {formatDateDotYMD(course.start_date)} ~ {formatDateDotYMD(course.end_date)}
              </span>
            )}
          </Link>
        );
      },
    },
    {
      id: "studentCount",
      header: "학생 수",
      sortKey: "studentCount",
      cell: (course) => (
        <Badge variant="blue" size="sm">
          {course.student_count || 0}명
        </Badge>
      ),
    },
    {
      id: "period",
      header: "기간",
      cell: (course) => (
        <span className="text-muted-foreground">
          {formatDateDotYMD(course.start_date)} ~ {formatDateDotYMD(course.end_date)}
        </span>
      ),
    },
    {
      id: "manage",
      header: "관리",
      cell: (course) => (
        <div className="flex gap-2">
          <Link href={`/courses/${course.id}`}>
            <Button size="xs" className="font-medium">
              시험 및 과제 관리
            </Button>
          </Link>
          <Button variant="translucent" size="xs" className="font-medium" onClick={() => openEnrollModal(course)}>
            학생 관리
          </Button>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (course) => <DropdownMenu items={getMenuItems(course)} />,
    },
  ];

  return (
    <DataTable
      flush
      isLoading={isLoading}
      skeletonRows={8}
      empty={empty}
      columns={columns}
      data={courses}
      getRowId={(course) => course.id}
      comparators={comparators}
      defaultSort={{ key: "name", direction: "asc" }}
    />
  );
}
