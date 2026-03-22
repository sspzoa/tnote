"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListSkeleton,
} from "@/shared/components/ui/studentList";
import { useToast } from "@/shared/hooks/useToast";
import { hasActiveHiddenTag } from "@/shared/lib/utils/tags";
import type { Student } from "@/shared/types";
import { selectedClinicAtom } from "../(atoms)/useClinicsStore";
import {
  absentStudentIdsAtom,
  attendanceSearchQueryAtom,
  type StudentActivity,
  selectedDateAtom,
  selectedStudentIdsAtom,
  studentActivitiesAtom,
} from "../(atoms)/useFormStore";
import { showAttendanceModalAtom } from "../(atoms)/useModalStore";
import { useAllStudents } from "../(hooks)/useAllStudents";
import { useAttendance } from "../(hooks)/useAttendance";
import { useAttendanceSave } from "../(hooks)/useAttendanceSave";

const ACTIVITY_LABELS = [
  { key: "retakeExam" as const, label: "재시험" },
  { key: "homeworkCheck" as const, label: "숙제검사" },
  { key: "qa" as const, label: "질의응답" },
];

export default function AttendanceModal() {
  const [isOpen, setIsOpen] = useAtom(showAttendanceModalAtom);
  const [selectedClinic] = useAtom(selectedClinicAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [selectedStudentIds, setSelectedStudentIds] = useAtom(selectedStudentIdsAtom);
  const [absentStudentIds, setAbsentStudentIds] = useAtom(absentStudentIdsAtom);
  const [searchQuery, setSearchQuery] = useAtom(attendanceSearchQueryAtom);
  const [activities, setActivities] = useAtom(studentActivitiesAtom);
  const toast = useToast();

  const { students } = useAllStudents();
  const { attendance, isLoading: loadingAttendance } = useAttendance(selectedClinic?.id || null, selectedDate || null);
  const { saveAttendance, isSaving } = useAttendanceSave();

  const selectedWeekday = useMemo(() => {
    if (!selectedDate) return null;
    return new Date(selectedDate).getDay();
  }, [selectedDate]);

  const isRequiredDay = useCallback(
    (student: Student) => {
      if (selectedWeekday === null || !student.required_clinic_weekdays) return false;
      return student.required_clinic_weekdays.includes(selectedWeekday);
    },
    [selectedWeekday],
  );

  useEffect(() => {
    if (!isOpen || loadingAttendance) return;

    if (attendance.length > 0) {
      const attendedIds: string[] = [];
      const absentIds: string[] = [];
      const loaded: Record<string, StudentActivity> = {};

      for (const record of attendance) {
        if (record.status === "absent") {
          absentIds.push(record.student.id);
        } else {
          attendedIds.push(record.student.id);
        }
        loaded[record.student.id] = {
          retakeExam: record.did_retake_exam,
          homeworkCheck: record.did_homework_check,
          qa: record.did_qa,
        };
      }

      setSelectedStudentIds(attendedIds);
      setAbsentStudentIds(absentIds);
      setActivities(loaded);
    } else {
      setSelectedStudentIds([]);
      setAbsentStudentIds([]);
      setActivities({});
    }
  }, [attendance, isOpen, loadingAttendance, selectedDate, students, isRequiredDay]);

  const filteredStudents = useMemo(() => {
    const visible = students
      .filter((student) => !hasActiveHiddenTag(student))
      .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return visible.sort((a, b) => {
      const aRequired = isRequiredDay(a);
      const bRequired = isRequiredDay(b);
      if (aRequired !== bRequired) return aRequired ? -1 : 1;
      return a.name.localeCompare(b.name, "ko");
    });
  }, [students, searchQuery, isRequiredDay]);

  const visibleStudentCount = useMemo(() => students.filter((s) => !hasActiveHiddenTag(s)).length, [students]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleSave = async () => {
    if (!selectedClinic || !selectedDate) {
      toast.info("날짜를 선택해 주세요.");
      return;
    }

    try {
      const requiredIds = new Set(students.filter((s) => isRequiredDay(s)).map((s) => s.id));
      await saveAttendance(
        selectedClinic.id,
        selectedStudentIds,
        absentStudentIds,
        activities,
        selectedDate,
        requiredIds,
      );
      toast.success("출석이 저장되었습니다.");
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "출석 저장에 실패했습니다.");
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      setAbsentStudentIds((abs) => abs.filter((id) => id !== studentId));
      return [...prev, studentId];
    });
  };

  const toggleAbsent = (studentId: string) => {
    setAbsentStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      setSelectedStudentIds((sel) => sel.filter((id) => id !== studentId));
      return [...prev, studentId];
    });
  };

  const toggleActivity = (studentId: string, key: keyof StudentActivity) => {
    setActivities((prev) => {
      const current = prev[studentId] ?? { retakeExam: false, homeworkCheck: false, qa: false };
      return {
        ...prev,
        [studentId]: {
          ...current,
          [key]: !current[key],
        },
      };
    });
  };

  if (!selectedClinic) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSave}
      title="출석 관리"
      subtitle={selectedClinic.name}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !selectedDate} className="flex-1">
            {isSaving ? "저장 중..." : "출석 저장"}
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-500">
        <FormInput
          label="날짜 선택"
          required
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <div className="flex flex-col gap-spacing-300">
          <h3 className="font-bold text-body text-content-standard-primary">
            참석 학생 선택 ({visibleStudentCount}명)
          </h3>
          {loadingAttendance ? (
            <div className="flex flex-col gap-spacing-300">
              <div className="h-12 animate-pulse rounded-radius-300 bg-components-fill-standard-secondary" />
              <StudentListContainer>
                <StudentListSkeleton count={6} showCheckbox />
              </StudentListContainer>
            </div>
          ) : students.length === 0 ? (
            <StudentListContainer>
              <StudentListEmpty />
            </StudentListContainer>
          ) : (
            <div className="flex flex-col gap-spacing-300">
              <SearchInput
                placeholder="학생 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <StudentListContainer>
                {filteredStudents.length === 0 ? (
                  <StudentListEmpty message="검색 결과가 없습니다." />
                ) : (
                  filteredStudents.map((student) => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    const isAbsent = absentStudentIds.includes(student.id);
                    const required = isRequiredDay(student);
                    const studentActivity = activities[student.id];

                    return (
                      <div key={student.id} className="flex flex-col border-line-divider border-b last:border-b-0">
                        <StudentListItem
                          student={student}
                          selected={isSelected}
                          onToggle={() => toggleStudent(student.id)}
                          badge={
                            <>
                              {required && (
                                <Badge variant="blue" size="xs">
                                  필참
                                </Badge>
                              )}
                              {isAbsent && (
                                <Badge variant="danger" size="xs">
                                  결석
                                </Badge>
                              )}
                            </>
                          }
                          highlighted={isAbsent}
                          rightContent={
                            required && !isSelected ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleAbsent(student.id);
                                }}
                                className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-footnote transition-colors ${
                                  isAbsent
                                    ? "bg-solid-translucent-red text-solid-red"
                                    : "bg-components-fill-standard-secondary text-content-standard-tertiary hover:bg-components-fill-standard-tertiary"
                                }`}>
                                결석
                              </button>
                            ) : undefined
                          }
                        />
                        {isSelected && (
                          <div className="flex items-center gap-spacing-200 bg-components-fill-standard-primary px-spacing-400 py-spacing-200 pl-spacing-900">
                            {ACTIVITY_LABELS.map(({ key, label }) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => toggleActivity(student.id, key)}
                                className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-footnote transition-colors ${
                                  studentActivity?.[key]
                                    ? "bg-core-accent text-solid-white"
                                    : "bg-components-fill-standard-secondary text-content-standard-tertiary hover:bg-components-fill-standard-tertiary"
                                }`}>
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </StudentListContainer>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
