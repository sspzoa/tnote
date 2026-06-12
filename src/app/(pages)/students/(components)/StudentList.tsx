import { useAtom } from "jotai";
import { Users } from "lucide-react";
import { type ReactNode, useCallback, useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { IconBadge } from "@/shared/components/ui/iconBadge";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import { isTagActive } from "@/shared/lib/utils/tags";

import type { StudentTagAssignment } from "@/shared/types";
import { editFormAtom } from "../(atoms)/useFormStore";
import {
  editTagAssignmentDataAtom,
  showAddTagModalAtom,
  showConsultationModalAtom,
  showEditModalAtom,
  showEditTagAssignmentModalAtom,
  showInfoModalAtom,
} from "../(atoms)/useModalStore";
import type { Student } from "../(atoms)/useStudentsStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useStudentDelete } from "../(hooks)/useStudentDelete";
import { useStudentPasswordReset } from "../(hooks)/useStudentPasswordReset";

interface StudentListProps {
  students: Student[];
  isLoading?: boolean;
  empty?: ReactNode;
}

type StudentSortKey = "name" | "branch" | "grade" | "phone" | "parentPhone" | "school";

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export default function StudentList({ students, isLoading, empty }: StudentListProps) {
  const [, setSelectedStudent] = useAtom(selectedStudentAtom);
  const [, setShowEditModal] = useAtom(showEditModalAtom);
  const [, setShowConsultationModal] = useAtom(showConsultationModalAtom);
  const [, setShowInfoModal] = useAtom(showInfoModalAtom);
  const [, setShowAddTagModal] = useAtom(showAddTagModalAtom);
  const [, setEditForm] = useAtom(editFormAtom);
  const [, setShowEditTagAssignmentModal] = useAtom(showEditTagAssignmentModalAtom);
  const [, setEditTagAssignmentData] = useAtom(editTagAssignmentDataAtom);
  const { deleteStudent } = useStudentDelete();
  const { resetPassword } = useStudentPasswordReset();
  const toast = useToast();
  const confirm = useConfirm();

  const comparators = useMemo(
    () => ({
      name: (a: Student, b: Student) => a.name.localeCompare(b.name, "ko"),
      branch: (a: Student, b: Student) => (a.branch || "").localeCompare(b.branch || "", "ko"),
      grade: (a: Student, b: Student) => (a.birth_year || 0) - (b.birth_year || 0),
      phone: (a: Student, b: Student) => a.phone_number.localeCompare(b.phone_number),
      parentPhone: (a: Student, b: Student) => (a.parent_phone_number || "").localeCompare(b.parent_phone_number || ""),
      school: (a: Student, b: Student) => (a.school || "").localeCompare(b.school || "", "ko"),
    }),
    [],
  );

  const handleEditClick = useCallback(
    (student: Student) => {
      setSelectedStudent(student);
      setEditForm({
        name: student.name,
        phoneNumber: student.phone_number,
        parentPhoneNumber: student.parent_phone_number || "",
        school: student.school || "",
        branch: student.branch || "",
        birthYear: student.birth_year?.toString() || "",
        requiredClinicWeekdays: student.required_clinic_weekdays || [],
      });
      setShowEditModal(true);
    },
    [setSelectedStudent, setEditForm, setShowEditModal],
  );

  const handleResetPassword = useCallback(
    async (student: Student) => {
      const ok = await confirm({
        title: "비밀번호 초기화",
        message: `${student.name} 학생의 비밀번호를 전화번호(${formatPhoneNumber(student.phone_number)})로 초기화하시겠습니까?`,
      });
      if (!ok) return;

      try {
        await resetPassword(student.id);
        toast.success("비밀번호가 전화번호로 초기화되었습니다.");
      } catch {
        toast.error("비밀번호 초기화에 실패했습니다.");
      }
    },
    [resetPassword, toast, confirm],
  );

  const handleDelete = useCallback(
    async (student: Student) => {
      const ok = await confirm({
        title: "학생 삭제",
        message: `${student.name} 학생을 삭제하시겠습니까?`,
        description: "관련된 모든 데이터(수강 정보, 재시험 등)가 함께 삭제됩니다.",
        variant: "danger",
        confirmLabel: "삭제",
      });
      if (!ok) return;

      try {
        await deleteStudent(student.id);
        toast.success("학생이 삭제되었습니다.");
      } catch (error) {
        toast.error(getErrorMessage(error, "학생 삭제에 실패했습니다."));
      }
    },
    [deleteStudent, toast, confirm],
  );

  const openConsultationModal = useCallback(
    (student: Student) => {
      setSelectedStudent(student);
      setShowConsultationModal(true);
    },
    [setSelectedStudent, setShowConsultationModal],
  );

  const openInfoModal = useCallback(
    (student: Student) => {
      setSelectedStudent(student);
      setShowInfoModal(true);
    },
    [setSelectedStudent, setShowInfoModal],
  );

  const openAddTagModal = useCallback(
    (student: Student) => {
      setSelectedStudent(student);
      setShowAddTagModal(true);
    },
    [setSelectedStudent, setShowAddTagModal],
  );

  const openEditTagAssignmentModal = useCallback(
    (student: Student, assignment: StudentTagAssignment) => {
      setEditTagAssignmentData({
        studentId: student.id,
        studentName: student.name,
        assignment,
      });
      setShowEditTagAssignmentModal(true);
    },
    [setEditTagAssignmentData, setShowEditTagAssignmentModal],
  );

  const getMenuItems = useCallback(
    (student: Student): DropdownMenuItem[] => [
      { label: "정보 보기", onClick: () => openInfoModal(student) },
      { label: "상담일지", onClick: () => openConsultationModal(student) },
      { label: "태그 추가", onClick: () => openAddTagModal(student), dividerAfter: true },
      { label: "정보 수정", onClick: () => handleEditClick(student) },
      { label: "비밀번호 초기화", onClick: () => handleResetPassword(student), dividerAfter: true },
      { label: "학생 삭제", onClick: () => handleDelete(student), variant: "danger" },
    ],
    [openInfoModal, openConsultationModal, openAddTagModal, handleEditClick, handleResetPassword, handleDelete],
  );

  const columns: DataTableColumn<Student, StudentSortKey>[] = [
    {
      id: "name",
      header: "이름",
      sortKey: "name",
      cell: (student) => {
        const grade = student.birth_year ? getGrade(student.birth_year) : null;
        const secondary = [student.school, grade].filter(Boolean).join(" · ");
        return (
          <button
            type="button"
            onClick={() => openInfoModal(student)}
            className="group flex min-w-0 items-center gap-3 text-left">
            <IconBadge icon={Users} tone="students" size="sm" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                {student.name}
              </span>
              {secondary && <span className="truncate text-muted-foreground text-xs">{secondary}</span>}
            </span>
          </button>
        );
      },
    },
    {
      id: "clinic",
      header: "클리닉",
      cell: (student) =>
        student.required_clinic_weekdays && student.required_clinic_weekdays.length > 0 ? (
          <div className="flex items-center gap-1">
            {student.required_clinic_weekdays.map((day) => (
              <Badge key={day} variant="blue" size="xs">
                {dayLabels[day]}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "tags",
      header: "태그",
      cell: (student) => {
        const activeTags = (student.tags || []).filter((assignment) =>
          isTagActive(assignment.start_date, assignment.end_date),
        );
        return activeTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            {activeTags.map((assignment) => {
              const tag = assignment.tag;
              if (!tag) return null;
              return (
                <Badge
                  key={assignment.id}
                  variant={tag.color}
                  size="xs"
                  interactive
                  onClick={() => openEditTagAssignmentModal(student, assignment)}
                  title="클릭하여 수정">
                  {tag.name}
                </Badge>
              );
            })}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "branch",
      header: "지점",
      sortKey: "branch",
      cell: (student) => <span className="text-muted-foreground">{student.branch || "-"}</span>,
    },
    {
      id: "grade",
      header: "학년",
      sortKey: "grade",
      cell: (student) =>
        student.birth_year && getGrade(student.birth_year) ? (
          <Badge variant="blue" size="sm">
            {getGrade(student.birth_year)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "phone",
      header: "전화번호",
      sortKey: "phone",
      cell: (student) => <span className="text-muted-foreground">{formatPhoneNumber(student.phone_number)}</span>,
    },
    {
      id: "parentPhone",
      header: "학부모 번호",
      sortKey: "parentPhone",
      cell: (student) => (
        <span className="text-muted-foreground">
          {student.parent_phone_number ? formatPhoneNumber(student.parent_phone_number) : "-"}
        </span>
      ),
    },
    {
      id: "school",
      header: "학교",
      sortKey: "school",
      cell: (student) => <span className="text-muted-foreground">{student.school || "-"}</span>,
    },
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (student) => <DropdownMenu items={getMenuItems(student)} />,
    },
  ];

  return (
    <DataTable
      flush
      isLoading={isLoading}
      skeletonRows={8}
      empty={empty}
      columns={columns}
      data={students}
      getRowId={(student) => student.id}
      comparators={comparators}
      defaultSort={{ key: "name", direction: "asc" }}
    />
  );
}
