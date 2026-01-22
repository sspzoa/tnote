import { useAtom } from "jotai";
import { useCallback } from "react";
import { DropdownMenu, type DropdownMenuItem, MoreOptionsButton } from "@/shared/components/ui/dropdownMenu";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import type { TagColor } from "@/shared/types";
import { editFormAtom } from "../(atoms)/useFormStore";
import {
  openMenuIdAtom,
  showAddTagModalAtom,
  showConsultationModalAtom,
  showEditModalAtom,
  showInfoModalAtom,
} from "../(atoms)/useModalStore";
import type { Student } from "../(atoms)/useStudentsStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useStudentDelete } from "../(hooks)/useStudentDelete";
import { useStudentPasswordReset } from "../(hooks)/useStudentPasswordReset";
import { useRemoveTag } from "../(hooks)/useStudentTags";

interface StudentListProps {
  students: Student[];
}

const TAG_COLOR_CLASSES: Record<TagColor, { bg: string; text: string }> = {
  red: { bg: "bg-solid-translucent-red", text: "text-solid-red" },
  orange: { bg: "bg-solid-translucent-orange", text: "text-solid-orange" },
  yellow: { bg: "bg-solid-translucent-yellow", text: "text-solid-yellow" },
  green: { bg: "bg-solid-translucent-green", text: "text-solid-green" },
  blue: { bg: "bg-solid-translucent-blue", text: "text-solid-blue" },
  indigo: { bg: "bg-solid-translucent-indigo", text: "text-solid-indigo" },
  purple: { bg: "bg-solid-translucent-purple", text: "text-solid-purple" },
  pink: { bg: "bg-solid-translucent-pink", text: "text-solid-pink" },
  brown: { bg: "bg-solid-translucent-brown", text: "text-solid-brown" },
  black: { bg: "bg-solid-translucent-black", text: "text-solid-black" },
  white: { bg: "bg-components-fill-standard-secondary", text: "text-content-standard-primary" },
};

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

export default function StudentList({ students }: StudentListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [, setSelectedStudent] = useAtom(selectedStudentAtom);
  const [, setShowEditModal] = useAtom(showEditModalAtom);
  const [, setShowConsultationModal] = useAtom(showConsultationModalAtom);
  const [, setShowInfoModal] = useAtom(showInfoModalAtom);
  const [, setShowAddTagModal] = useAtom(showAddTagModalAtom);
  const [, setEditForm] = useAtom(editFormAtom);
  const { deleteStudent } = useStudentDelete();
  const { resetPassword } = useStudentPasswordReset();
  const { mutateAsync: removeTag } = useRemoveTag();

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
        alert("비밀번호가 전화번호로 초기화되었습니다.");
      } catch {
        alert("비밀번호 초기화에 실패했습니다.");
      }
    },
    [resetPassword],
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
        alert("학생이 삭제되었습니다.");
      } catch (error) {
        alert(error instanceof Error ? error.message : "학생 삭제에 실패했습니다.");
      }
    },
    [deleteStudent],
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

  const handleRemoveTag = useCallback(
    async (student: Student, tagId: string, tagName: string) => {
      if (!confirm(`"${tagName}" 태그를 제거하시겠습니까?`)) return;
      try {
        await removeTag({ studentId: student.id, tagId });
      } catch {
        alert("태그 제거에 실패했습니다.");
      }
    },
    [removeTag],
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
    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
          <tr>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              이름
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              태그
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              지점
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              학년
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              전화번호
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              학부모 번호
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              학교
            </th>

            <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const activeTags = (student.tags || []).filter((assignment) =>
              isTagActive(assignment.start_date, assignment.end_date),
            );

            return (
              <tr
                key={student.id}
                className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                <td className="px-spacing-500 py-spacing-400">
                  <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                </td>
                <td className="px-spacing-500 py-spacing-400">
                  <div className="flex flex-wrap items-center gap-spacing-100">
                    {activeTags.map((assignment) => {
                      const tag = assignment.tag;
                      if (!tag) return null;
                      const colorClasses = TAG_COLOR_CLASSES[tag.color];
                      return (
                        <button
                          key={assignment.id}
                          onClick={() => handleRemoveTag(student, tag.id, tag.name)}
                          className={`group flex items-center gap-spacing-50 rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote transition-opacity hover:opacity-70 ${colorClasses.bg} ${colorClasses.text}`}
                          title="클릭하여 제거">
                          {tag.name}
                          <span className="hidden text-current opacity-60 group-hover:inline">×</span>
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {student.branch || "-"}
                </td>
                <td className="px-spacing-500 py-spacing-400">
                  {student.birth_year && getGrade(student.birth_year) && (
                    <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                      {getGrade(student.birth_year)}
                    </span>
                  )}
                </td>
                <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {formatPhoneNumber(student.phone_number)}
                </td>
                <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {student.parent_phone_number ? formatPhoneNumber(student.parent_phone_number) : "-"}
                </td>
                <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                  {student.school || "-"}
                </td>

                <td className="relative px-spacing-500 py-spacing-400">
                  <MoreOptionsButton onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)} />
                  <DropdownMenu
                    isOpen={openMenuId === student.id}
                    onClose={() => setOpenMenuId(null)}
                    items={getMenuItems(student)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
