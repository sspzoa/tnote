"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { StatStrip } from "@/shared/components/ui/statStrip";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListSkeleton,
} from "@/shared/components/ui/studentList";
import { useToast } from "@/shared/hooks/useToast";
import { cn } from "@/shared/lib/utils/cn";
import { getErrorMessage } from "@/shared/lib/utils/error";
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

/**
 * The row's primary action — a single segmented 참석 / 결석 control with the refined chip
 * language. Lives inside the StudentListItem label, so each segment stops the event from
 * also flipping the row checkbox and sets its state explicitly instead.
 */
function AttendanceSegmentedControl({
  isSelected,
  isAbsent,
  onPresent,
  onAbsent,
}: {
  isSelected: boolean;
  isAbsent: boolean;
  onPresent: () => void;
  onAbsent: () => void;
}) {
  const segment =
    "h-9 px-3 font-medium text-xs outline-none transition-[color,background-color,box-shadow] duration-[--motion-fast] focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50";

  const handle = (run: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    run();
  };

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-input">
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={handle(onPresent)}
        className={cn(
          segment,
          isSelected ? "bg-primary-soft text-primary" : "bg-muted/50 text-muted-foreground hover:bg-card",
        )}>
        참석
      </button>
      <button
        type="button"
        aria-pressed={isAbsent}
        onClick={handle(onAbsent)}
        className={cn(
          segment,
          "border-input border-l",
          isAbsent ? "bg-destructive-soft text-destructive" : "bg-muted/50 text-muted-foreground hover:bg-card",
        )}>
        결석
      </button>
    </div>
  );
}

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
      toast.error(getErrorMessage(error, "출석 저장에 실패했습니다."));
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

  const uncheckedRequiredStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          !hasActiveHiddenTag(s) &&
          isRequiredDay(s) &&
          !selectedStudentIds.includes(s.id) &&
          !absentStudentIds.includes(s.id),
      ),
    [students, isRequiredDay, selectedStudentIds, absentStudentIds],
  );

  const handleBulkAbsent = () => {
    setAbsentStudentIds((prev) => [...prev, ...uncheckedRequiredStudents.map((s) => s.id)]);
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
      <div className="flex flex-col gap-4">
        {/* Header band: date · live tally ribbon · toolbar */}
        <div className="flex flex-col gap-3">
          <FormInput
            label="날짜 선택"
            required
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <StatStrip
            items={[
              { label: "전체", value: visibleStudentCount },
              { label: "참석", value: selectedStudentIds.length, emphasis: selectedStudentIds.length > 0 },
              { label: "결석", value: absentStudentIds.length },
              { label: "필참 미체크", value: uncheckedRequiredStudents.length },
            ]}
          />

          {!loadingAttendance && students.length > 0 && (
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="학생 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {uncheckedRequiredStudents.length > 0 && (
                <Button variant="secondary" className="shrink-0" onClick={handleBulkAbsent}>
                  필참 미체크 일괄 결석 ({uncheckedRequiredStudents.length}명)
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Roster scroll body */}
        {loadingAttendance ? (
          <StudentListContainer>
            <StudentListSkeleton count={6} showCheckbox showRightContent />
          </StudentListContainer>
        ) : students.length === 0 ? (
          <StudentListContainer>
            <StudentListEmpty />
          </StudentListContainer>
        ) : (
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
                  <div key={student.id} className="border-border border-b last:border-b-0">
                    <StudentListItem
                      student={student}
                      selected={isSelected}
                      onToggle={() => toggleStudent(student.id)}
                      badge={
                        required ? (
                          <Badge variant="blue" size="xs">
                            필참
                          </Badge>
                        ) : undefined
                      }
                      highlighted={isAbsent}
                      rightContent={
                        <AttendanceSegmentedControl
                          isSelected={isSelected}
                          isAbsent={isAbsent}
                          onPresent={() => {
                            if (!isSelected) toggleStudent(student.id);
                          }}
                          onAbsent={() => {
                            if (!isAbsent) toggleAbsent(student.id);
                          }}
                        />
                      }
                    />
                    {isSelected && (
                      <div className="flex flex-wrap items-center gap-2 bg-card px-4 pt-0.5 pb-3 pl-[5.5rem]">
                        <span className="text-muted-foreground text-xs">활동</span>
                        {ACTIVITY_LABELS.map(({ key, label }) => {
                          const on = !!studentActivity?.[key];
                          return (
                            <button
                              key={key}
                              type="button"
                              aria-pressed={on}
                              onClick={() => toggleActivity(student.id, key)}
                              className={cn(
                                "h-7 rounded-md px-2.5 font-medium text-xs outline-none transition-[color,background-color,box-shadow] duration-[--motion-fast] focus-visible:ring-[3px] focus-visible:ring-ring/50",
                                on
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
                              )}>
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </StudentListContainer>
        )}
      </div>
    </Modal>
  );
}
