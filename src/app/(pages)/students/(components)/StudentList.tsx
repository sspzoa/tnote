import { useAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  type DropdownMenuItem,
  type MenuPosition,
  MoreOptionsButton,
} from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { useToast } from "@/shared/hooks/useToast";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";

import type { StudentTagAssignment } from "@/shared/types";
import { editFormAtom } from "../(atoms)/useFormStore";
import {
  editTagAssignmentDataAtom,
  openMenuIdAtom,
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
}

const isTagActive = (startDate: string, endDate: string | null): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (today < start) return false;
  if (endDate === null) return true;

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return today <= end;
};

type StudentSortKey = "name" | "branch" | "grade" | "phone" | "parentPhone" | "school";

export default function StudentList({ students }: StudentListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
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

  const { sortedData, sortState, toggleSort } = useTableSort<Student, StudentSortKey>({
    data: students,
    comparators,
    defaultSort: { key: "name", direction: "asc" },
  });

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
      });
      setShowEditModal(true);
    },
    [setSelectedStudent, setEditForm, setShowEditModal],
  );

  const handleResetPassword = useCallback(
    async (student: Student) => {
      if (
        !confirm(
          `${student.name} 학생의 비밀번호를 전화번호(${formatPhoneNumber(student.phone_number)})로 초기화하시겠습니까?`,
        )
      ) {
        return;
      }

      try {
        await resetPassword(student.id);
        toast.success("비밀번호가 전화번호로 초기화되었습니다.");
      } catch {
        toast.error("비밀번호 초기화에 실패했습니다.");
      }
    },
    [resetPassword, toast],
  );

  const handleDelete = useCallback(
    async (student: Student) => {
      if (
        !confirm(
          `${student.name} 학생을 삭제하시겠습니까?\n관련된 모든 데이터(수강 정보, 재시험 등)가 함께 삭제됩니다.`,
        )
      ) {
        return;
      }

      try {
        await deleteStudent(student.id);
        toast.success("학생이 삭제되었습니다.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "학생 삭제에 실패했습니다.");
      }
    },
    [deleteStudent, toast],
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

  return (
    <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
          <tr>
            <SortableHeader
              label="이름"
              sortKey="name"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              태그
            </th>
            <SortableHeader
              label="지점"
              sortKey="branch"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="학년"
              sortKey="grade"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="전화번호"
              sortKey="phone"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="학부모 번호"
              sortKey="parentPhone"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="학교"
              sortKey="school"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <th className="w-24 whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((student) => {
            const activeTags = (student.tags || []).filter((assignment) =>
              isTagActive(assignment.start_date, assignment.end_date),
            );

            return (
              <tr
                key={student.id}
                className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                  <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                </td>
                <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {activeTags.length > 0 ? (
                    <div className="flex items-center gap-spacing-100">
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
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {student.branch || "-"}
                </td>
                <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {student.birth_year && getGrade(student.birth_year) ? (
                    <Badge variant="blue" size="sm">
                      {getGrade(student.birth_year)}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {formatPhoneNumber(student.phone_number)}
                </td>
                <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {student.parent_phone_number ? formatPhoneNumber(student.parent_phone_number) : "-"}
                </td>
                <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {student.school || "-"}
                </td>

                <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                  <MoreOptionsButton
                    onClick={(pos) => {
                      if (openMenuId === student.id) {
                        setOpenMenuId(null);
                        setMenuPosition(null);
                      } else {
                        setOpenMenuId(student.id);
                        setMenuPosition(pos);
                      }
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {openMenuId && (
        <DropdownMenu
          isOpen={true}
          onClose={() => {
            setOpenMenuId(null);
            setMenuPosition(null);
          }}
          items={getMenuItems(sortedData.find((s) => s.id === openMenuId)!)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
