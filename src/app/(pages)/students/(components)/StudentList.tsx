import { useAtom } from "jotai";
import { Star } from "lucide-react";
import { useCallback } from "react";
import { DropdownMenu, type DropdownMenuItem, MoreOptionsButton } from "@/shared/components/ui/dropdownMenu";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import { editFormAtom } from "../(atoms)/useFormStore";
import {
  openMenuIdAtom,
  showConsultationModalAtom,
  showEditModalAtom,
  showInfoModalAtom,
} from "../(atoms)/useModalStore";
import type { Student } from "../(atoms)/useStudentsStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useStudentDelete } from "../(hooks)/useStudentDelete";
import { useStudentFavorite } from "../(hooks)/useStudentFavorite";
import { useStudentPasswordReset } from "../(hooks)/useStudentPasswordReset";

interface StudentListProps {
  students: Student[];
}

export default function StudentList({ students }: StudentListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [, setSelectedStudent] = useAtom(selectedStudentAtom);
  const [, setShowEditModal] = useAtom(showEditModalAtom);
  const [, setShowConsultationModal] = useAtom(showConsultationModalAtom);
  const [, setShowInfoModal] = useAtom(showInfoModalAtom);
  const [, setEditForm] = useAtom(editFormAtom);
  const { deleteStudent } = useStudentDelete();
  const { toggleFavorite } = useStudentFavorite();
  const { resetPassword } = useStudentPasswordReset();

  const handleEditClick = useCallback(
    (student: Student) => {
      setSelectedStudent(student);
      setEditForm({
        name: student.name,
        phoneNumber: student.phone_number,
        parentPhoneNumber: student.parent_phone_number || "",
        school: student.school || "",
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
        alert("비밀번호 재설정에 실패했습니다.");
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

  const handleToggleFavorite = useCallback(
    async (student: Student, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await toggleFavorite({
          studentId: student.id,
          isFavorite: !student.is_favorite,
        });
      } catch {
        alert("즐겨찾기 업데이트에 실패했습니다.");
      }
    },
    [toggleFavorite],
  );

  const getMenuItems = useCallback(
    (student: Student): DropdownMenuItem[] => [
      { label: "정보 보기", onClick: () => openInfoModal(student) },
      { label: "상담일지", onClick: () => openConsultationModal(student), dividerAfter: true },
      { label: "정보 수정", onClick: () => handleEditClick(student) },
      { label: "비밀번호 초기화", onClick: () => handleResetPassword(student), dividerAfter: true },
      { label: "학생 삭제", onClick: () => handleDelete(student), variant: "danger" },
    ],
    [openInfoModal, openConsultationModal, handleEditClick, handleResetPassword, handleDelete],
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
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              상담
            </th>
            <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
              <td className="px-spacing-500 py-spacing-400">
                <div className="flex items-center gap-spacing-200">
                  <button
                    onClick={(e) => handleToggleFavorite(student, e)}
                    className="transition-colors hover:scale-110"
                    aria-label={student.is_favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}>
                    <Star
                      className={`h-5 w-5 ${student.is_favorite ? "fill-solid-yellow text-solid-yellow" : "text-content-standard-tertiary"}`}
                    />
                  </button>
                  <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                </div>
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
              <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                {student.consultation_count !== undefined ? `${student.consultation_count}회` : "-"}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
