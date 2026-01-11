"use client";

import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { selectedClinicAtom } from "../(atoms)/useClinicsStore";
import { attendanceSearchQueryAtom, selectedDateAtom, selectedStudentIdsAtom } from "../(atoms)/useFormStore";
import { showAttendanceModalAtom } from "../(atoms)/useModalStore";
import { useAllStudents } from "../(hooks)/useAllStudents";
import { useAttendance } from "../(hooks)/useAttendance";
import { useAttendanceSave } from "../(hooks)/useAttendanceSave";

export default function AttendanceModal() {
  const [isOpen, setIsOpen] = useAtom(showAttendanceModalAtom);
  const [selectedClinic] = useAtom(selectedClinicAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [selectedStudentIds, setSelectedStudentIds] = useAtom(selectedStudentIdsAtom);
  const [searchQuery, setSearchQuery] = useAtom(attendanceSearchQueryAtom);

  const { students } = useAllStudents();
  const { attendance, isLoading: loadingAttendance } = useAttendance(selectedClinic?.id || null, selectedDate || null);
  const { saveAttendance, isSaving } = useAttendanceSave();

  useEffect(() => {
    if (isOpen && attendance.length > 0) {
      setSelectedStudentIds(attendance.map((record) => record.student.id));
    }
  }, [attendance, isOpen]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, searchQuery]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleSave = async () => {
    if (!selectedClinic || !selectedDate) {
      alert("날짜를 선택해주세요.");
      return;
    }

    try {
      await saveAttendance({
        clinicId: selectedClinic.id,
        studentIds: selectedStudentIds,
        date: selectedDate,
      });
      alert("출석이 저장되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "출석 저장에 실패했습니다.");
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  if (!isOpen || !selectedClinic) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
      onClick={handleClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
        onClick={(e) => e.stopPropagation()}>
        <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
          <h2 className="mb-spacing-100 font-bold text-content-standard-primary text-heading">출석 관리</h2>
          <p className="text-content-standard-secondary text-label">{selectedClinic.name}</p>
        </div>

        <div className="flex-1 space-y-spacing-500 overflow-y-auto p-spacing-600">
          <div>
            <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
              날짜 선택 <span className="text-core-status-negative">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
            />
          </div>

          <div>
            <h3 className="mb-spacing-300 font-bold text-body text-content-standard-primary">
              참석 학생 선택 ({students.length}명)
            </h3>
            {loadingAttendance ? (
              <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
            ) : students.length === 0 ? (
              <p className="text-content-standard-tertiary text-label">학생이 없습니다.</p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="이름 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-spacing-300 w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-content-standard-primary text-label transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                />
                {filteredStudents.length === 0 ? (
                  <p className="text-content-standard-tertiary text-label">검색 결과가 없습니다.</p>
                ) : (
                  <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary">
                    <div className="max-h-80 overflow-y-auto">
                      {filteredStudents.map((student) => (
                        <label
                          key={student.id}
                          className="flex cursor-pointer items-center gap-spacing-300 border-line-divider border-b px-spacing-400 py-spacing-300 transition-colors last:border-b-0 hover:bg-components-interactive-hover">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="h-4 w-4 cursor-pointer rounded border-line-outline text-core-accent focus:ring-2 focus:ring-core-accent-translucent"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                            <div className="text-content-standard-tertiary text-footnote">
                              {student.phone_number} {student.school && `· ${student.school}`}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
          <button
            onClick={handleClose}
            className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedDate}
            className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? "저장 중..." : "출석 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
