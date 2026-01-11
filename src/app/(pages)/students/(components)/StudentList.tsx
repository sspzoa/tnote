import { useAtom } from "jotai";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { editFormAtom } from "../(atoms)/useFormStore";
import { openMenuIdAtom, showConsultationModalAtom, showEditModalAtom } from "../(atoms)/useModalStore";
import type { Student } from "../(atoms)/useStudentsStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useStudentDelete } from "../(hooks)/useStudentDelete";
import { useStudentPasswordReset } from "../(hooks)/useStudentPasswordReset";

interface StudentListProps {
  students: Student[];
}

const getAge = (birthYear: number | null) => {
  if (!birthYear) return 0;
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear + 1;
};

const getGrade = (birthYear: number | null) => {
  if (!birthYear) return null;
  const age = getAge(birthYear);
  const gradeNumber = age - 7;

  if (gradeNumber <= 0) return "미취학";
  if (gradeNumber <= 6) return `초${gradeNumber}`;
  if (gradeNumber <= 9) return `중${gradeNumber - 6}`;
  if (gradeNumber <= 12) return `고${gradeNumber - 9}`;
  return "졸업";
};

export default function StudentList({ students }: StudentListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [, setSelectedStudent] = useAtom(selectedStudentAtom);
  const [, setShowEditModal] = useAtom(showEditModalAtom);
  const [, setShowConsultationModal] = useAtom(showConsultationModalAtom);
  const [, setEditForm] = useAtom(editFormAtom);
  const { deleteStudent } = useStudentDelete();
  const { resetPassword } = useStudentPasswordReset();

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name,
      phoneNumber: student.phone_number,
      parentPhoneNumber: student.parent_phone_number || "",
      school: student.school || "",
      birthYear: student.birth_year?.toString() || "",
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleResetPassword = async (student: Student) => {
    setOpenMenuId(null);
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
    } catch (error) {
      console.error("Password reset error:", error);
      alert("비밀번호 재설정에 실패했습니다.");
    }
  };

  const handleDelete = async (student: Student) => {
    setOpenMenuId(null);
    if (
      !confirm(`${student.name} 학생을 삭제하시겠습니까?\n관련된 모든 데이터(수강 정보, 재시험 등)가 함께 삭제됩니다.`)
    ) {
      return;
    }

    try {
      await deleteStudent(student.id);
      alert("학생이 삭제되었습니다.");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error instanceof Error ? error.message : "학생 삭제에 실패했습니다.");
    }
  };

  const openConsultationModal = (student: Student) => {
    setSelectedStudent(student);
    setShowConsultationModal(true);
    setOpenMenuId(null);
  };

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
            <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
              <td className="px-spacing-500 py-spacing-400">
                <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
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
                <button
                  onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                  className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
                  <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {openMenuId === student.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[160px] rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200 shadow-lg">
                      <button
                        onClick={() => openConsultationModal(student)}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                        상담일지
                      </button>
                      <div className="my-spacing-100 border-line-divider border-t" />
                      <button
                        onClick={() => handleEditClick(student)}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                        정보 수정
                      </button>
                      <button
                        onClick={() => handleResetPassword(student)}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                        비밀번호 초기화
                      </button>
                      <div className="my-spacing-100 border-line-divider border-t" />
                      <button
                        onClick={() => handleDelete(student)}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative transition-colors hover:bg-solid-translucent-red">
                        학생 삭제
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
