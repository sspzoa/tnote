"use client";

import { useAtom } from "jotai";
import { Check, Eye, FileText, Info, Minus, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterSelect } from "@/shared/components/ui/filterSelect";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { StudentListContainer, StudentListEmpty, StudentListItem } from "@/shared/components/ui/studentList";
import type { RecipientType } from "@/shared/types";
import {
  examMessageTemplateAtom,
  recipientTypeAtom,
  selectedCourseIdAtom,
  selectedExamIdAtom,
  selectedStudentIdsAtom,
} from "../(atoms)/useMessageStore";
import { useMessageTemplates } from "../(hooks)/useMessageTemplates";
import { useSendExamResults } from "../(hooks)/useSendMessage";
import { useCourses, useExamExport, useExams } from "../(hooks)/useStudents";
import TemplateSelector from "./TemplateSelector";

const RECIPIENT_OPTIONS: { value: RecipientType; label: string }[] = [
  { value: "student", label: "학생" },
  { value: "parent", label: "학부모" },
  { value: "both", label: "둘 다" },
];

const TEMPLATE_VARIABLES = [
  { key: "{오늘날짜}", description: "오늘 날짜" },
  { key: "{이름}", description: "학생 이름" },
  { key: "{수업명}", description: "수업명" },
  { key: "{시험명}", description: "시험명" },
  { key: "{과제검사}", description: "과제검사 결과" },
  { key: "{점수}", description: "점수" },
  { key: "{만점}", description: "만점" },
  { key: "{석차}", description: "석차" },
  { key: "{전체인원}", description: "전체 인원" },
];

const getByteLength = (str: string): number => {
  let byteLength = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode <= 0x7f) {
      byteLength += 1;
    } else {
      byteLength += 2;
    }
  }
  return byteLength;
};

export default function ExamResultsTab() {
  const { courses, isLoading: coursesLoading } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useAtom(selectedCourseIdAtom);
  const [selectedExamId, setSelectedExamId] = useAtom(selectedExamIdAtom);
  const { exams, isLoading: examsLoading } = useExams(selectedCourseId);
  const { exportData, isLoading: exportLoading } = useExamExport(selectedExamId);
  const { sendExamResults, isSending } = useSendExamResults();
  const { templates, addTemplate, deleteTemplate } = useMessageTemplates("exam");

  const [selectedIds, setSelectedIds] = useAtom(selectedStudentIdsAtom);
  const [recipientType, setRecipientType] = useAtom(recipientTypeAtom);
  const [messageTemplate, setMessageTemplate] = useAtom(examMessageTemplateAtom);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSelectedIds(new Set<string>());
    setSearchQuery("");
  }, [selectedExamId, setSelectedIds]);

  const students = useMemo(() => {
    if (!exportData?.rows) return [];
    return exportData.rows.map((row) => ({
      id: row.studentId,
      name: row.name,
      phone_number: row.parentPhone || "",
      assignmentStatus: row.assignmentStatus,
      score: row.score,
      rank: row.rank,
    }));
  }, [exportData]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter((student) => student.name.toLowerCase().includes(query));
  }, [students, searchQuery]);

  const allSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every((s) => selectedIds.has(s.id));
  }, [filteredStudents, selectedIds]);

  const someSelected = useMemo(() => {
    return filteredStudents.some((s) => selectedIds.has(s.id)) && !allSelected;
  }, [filteredStudents, selectedIds, allSelected]);

  const byteLength = useMemo(() => getByteLength(messageTemplate), [messageTemplate]);
  const isLMS = byteLength > 90;
  const maxBytes = isLMS ? 2000 : 90;

  const selectedExam = useMemo(() => exams.find((e) => e.id === selectedExamId), [exams, selectedExamId]);
  const selectedCourse = useMemo(() => courses.find((c) => c.id === selectedCourseId), [courses, selectedCourseId]);

  const previewStudent = useMemo(() => {
    if (students.length === 0) return null;
    const firstSelectedId = Array.from(selectedIds)[0];
    return students.find((s) => s.id === firstSelectedId) || students[0];
  }, [students, selectedIds]);

  const previewMessage = useMemo(() => {
    if (!previewStudent || !selectedExam || !selectedCourse) return messageTemplate;
    return messageTemplate
      .replace(/{이름}/g, previewStudent.name)
      .replace(/{수업명}/g, selectedCourse.name)
      .replace(/{시험명}/g, selectedExam.name)
      .replace(/{과제검사}/g, previewStudent.assignmentStatus || "-")
      .replace(/{점수}/g, previewStudent.score?.toString() || "-")
      .replace(/{만점}/g, exportData?.exam?.maxScore?.toString() || "100")
      .replace(/{석차}/g, previewStudent.rank?.toString() || "-")
      .replace(/{전체인원}/g, students.length.toString());
  }, [messageTemplate, previewStudent, selectedExam, selectedCourse, exportData, students.length]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedExamId("");
  };

  const handleToggleStudent = useCallback(
    (studentId: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(studentId)) {
          next.delete(studentId);
        } else {
          next.add(studentId);
        }
        return next;
      });
    },
    [setSelectedIds],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const student of filteredStudents) {
          next.delete(student.id);
        }
      } else {
        for (const student of filteredStudents) {
          next.add(student.id);
        }
      }
      return next;
    });
  }, [setSelectedIds, filteredStudents, allSelected]);

  const handleSend = useCallback(async () => {
    if (!selectedExamId) {
      alert("시험을 선택하세요.");
      return;
    }
    if (selectedIds.size === 0) {
      alert("수신자를 선택하세요.");
      return;
    }

    try {
      const result = await sendExamResults({
        examId: selectedExamId,
        recipientType,
        studentIds: Array.from(selectedIds),
        messageTemplate: messageTemplate.trim(),
      });

      if (result.success && result.data) {
        alert(
          `${result.data.successCount}건 발송 완료${result.data.failCount > 0 ? `, ${result.data.failCount}건 실패` : ""}`,
        );
        setSelectedIds(new Set<string>());
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "문자 발송에 실패했습니다.");
    }
  }, [selectedExamId, selectedIds, recipientType, messageTemplate, sendExamResults, setSelectedIds]);

  return (
    <div className="flex flex-col gap-spacing-600">
      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
        <div className="mb-spacing-400">
          <h3 className="font-semibold text-body text-content-standard-primary">시험 선택</h3>
          <p className="text-content-standard-tertiary text-footnote">결과를 발송할 시험을 선택하세요</p>
        </div>

        <div className="grid grid-cols-2 gap-spacing-400">
          <div className="flex flex-col gap-spacing-200">
            <label className="font-semibold text-content-standard-secondary text-label">수업</label>
            <FilterSelect
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={coursesLoading}
              className="w-full">
              <option value="">수업을 선택하세요</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </FilterSelect>
          </div>

          <div className="flex flex-col gap-spacing-200">
            <label className="font-semibold text-content-standard-secondary text-label">시험</label>
            <FilterSelect
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              disabled={!selectedCourseId || examsLoading}
              className="w-full">
              <option value="">{selectedCourseId ? "시험을 선택하세요" : "먼저 수업을 선택하세요"}</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam_number}회 - {exam.name}
                </option>
              ))}
            </FilterSelect>
          </div>
        </div>
      </div>

      {exportLoading && selectedExamId ? (
        <div className="flex items-center justify-center py-spacing-900">
          <div className="size-8 animate-spin rounded-full border-2 border-core-accent border-t-solid-transparent" />
        </div>
      ) : (
        <div className="flex flex-row items-start gap-spacing-600">
          <div className="flex-1 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            {!selectedExamId ? (
              <div className="flex flex-1 flex-col items-center justify-center py-spacing-900">
                <div className="mb-spacing-300 flex size-12 items-center justify-center rounded-full bg-core-accent-translucent">
                  <FileText className="size-6 text-core-accent" />
                </div>
                <span className="text-content-standard-tertiary text-label">먼저 시험을 선택하세요</span>
              </div>
            ) : (
              <>
                <div className="border-line-divider border-b px-spacing-500 py-spacing-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-body text-content-standard-primary">학생 선택</h3>
                      <p className="text-content-standard-tertiary text-footnote">
                        {selectedIds.size > 0 ? (
                          <span className="text-core-accent">{selectedIds.size}명 선택됨</span>
                        ) : (
                          `총 ${students.length}명`
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-line-divider border-b bg-components-fill-standard-secondary/50 px-spacing-500 py-spacing-300">
                  <button
                    onClick={handleSelectAll}
                    className="group flex w-full items-center gap-spacing-300 rounded-radius-200">
                    <div
                      className={`flex size-5 items-center justify-center rounded-radius-100 border transition-all ${
                        allSelected
                          ? "border-core-accent bg-core-accent"
                          : someSelected
                            ? "border-core-accent bg-core-accent/50"
                            : "border-line-outline bg-components-fill-standard-secondary group-hover:border-core-accent/50"
                      }`}>
                      {allSelected ? (
                        <Check className="size-3 text-solid-white" />
                      ) : someSelected ? (
                        <Minus className="size-3 text-solid-white" />
                      ) : null}
                    </div>
                    <span className="font-medium text-body text-content-standard-primary">
                      {allSelected ? "전체 해제" : "전체 선택"}{" "}
                      <span className="text-content-standard-tertiary">({filteredStudents.length}명)</span>
                    </span>
                  </button>
                </div>

                <div className="p-spacing-500">
                  <SearchInput
                    placeholder="학생 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-spacing-300"
                  />
                  <StudentListContainer>
                    {filteredStudents.length === 0 ? (
                      <StudentListEmpty
                        message={students.length === 0 ? "점수 데이터가 없습니다" : "검색 결과가 없습니다"}
                      />
                    ) : (
                      filteredStudents.map((student) => (
                        <StudentListItem
                          key={student.id}
                          student={student}
                          selected={selectedIds.has(student.id)}
                          onToggle={() => handleToggleStudent(student.id)}
                          badge={
                            <span
                              className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-semibold text-footnote ${
                                student.assignmentStatus === "완료"
                                  ? "bg-solid-translucent-green text-solid-green"
                                  : student.assignmentStatus === "미흡"
                                    ? "bg-solid-translucent-yellow text-solid-yellow"
                                    : "bg-solid-translucent-red text-solid-red"
                              }`}>
                              {student.assignmentStatus || "-"}
                            </span>
                          }
                          extraInfo={` · ${student.score !== null ? `${student.score}점` : "-"} / ${student.rank !== null ? `${student.rank}등` : "-"}`}
                        />
                      ))
                    )}
                  </StudentListContainer>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <div className="border-line-divider border-b px-spacing-500 py-spacing-400">
              <h3 className="font-semibold text-body text-content-standard-primary">메시지 템플릿</h3>
              <p className="text-content-standard-tertiary text-footnote">학생별로 변수가 자동 치환됩니다</p>
            </div>

            <div className="border-line-divider border-b px-spacing-500 py-spacing-400">
              <label className="mb-spacing-300 block font-semibold text-content-standard-primary text-label">
                수신자 유형
              </label>
              <div className="flex flex-wrap gap-spacing-200">
                {RECIPIENT_OPTIONS.map((option) => (
                  <FilterButton
                    key={option.value}
                    active={recipientType === option.value}
                    onClick={() => setRecipientType(option.value)}>
                    {option.label}
                  </FilterButton>
                ))}
              </div>
            </div>

            <div className="flex flex-col px-spacing-500 py-spacing-400">
              <div className="mb-spacing-300 flex items-center justify-between">
                <label className="font-semibold text-content-standard-primary text-label">메시지 내용</label>
                <div className="flex items-center gap-spacing-300">
                  <span
                    className={`rounded-radius-200 px-spacing-200 py-spacing-100 font-semibold text-footnote ${
                      isLMS
                        ? "bg-solid-translucent-yellow text-solid-yellow"
                        : "bg-solid-translucent-blue text-solid-blue"
                    }`}>
                    {isLMS ? "LMS" : "SMS"}
                  </span>
                  <span className="text-content-standard-tertiary text-footnote">
                    {byteLength} / {maxBytes} bytes
                  </span>
                </div>
              </div>

              <TemplateSelector
                templates={templates}
                currentContent={messageTemplate}
                onSelect={setMessageTemplate}
                onSave={addTemplate}
                onDelete={deleteTemplate}
              />

              <textarea
                value={messageTemplate}
                onChange={(e) => {
                  if (getByteLength(e.target.value) <= 2000) {
                    setMessageTemplate(e.target.value);
                  }
                }}
                className="mt-spacing-300 h-64 resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary focus:border-core-accent focus:outline-none"
              />

              <div className="mt-spacing-300 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-300">
                <div className="mb-spacing-200 flex items-center gap-spacing-200">
                  <Info className="size-4 text-content-standard-tertiary" />
                  <span className="font-semibold text-content-standard-secondary text-footnote">사용 가능한 변수</span>
                </div>
                <div className="flex flex-wrap gap-spacing-200">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => setMessageTemplate((prev) => prev + variable.key)}
                      className="rounded-radius-200 bg-components-fill-standard-primary px-spacing-200 py-spacing-100 text-content-standard-secondary text-footnote transition-all hover:bg-core-accent-translucent hover:text-core-accent"
                      title={variable.description}>
                      {variable.key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-spacing-400 flex items-center justify-between">
                <div className="text-content-standard-tertiary text-footnote">
                  {selectedIds.size > 0 ? (
                    <span>
                      <span className="font-semibold text-core-accent">{selectedIds.size}명</span>에게 발송
                    </span>
                  ) : (
                    <span>학생을 선택하세요</span>
                  )}
                </div>
                <div className="flex gap-spacing-200">
                  <Button
                    variant="secondary"
                    onClick={() => setIsPreviewOpen(true)}
                    disabled={!selectedExamId || students.length === 0}>
                    <span className="flex items-center gap-spacing-200">
                      <Eye className="size-4" />
                      미리보기
                    </span>
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={!selectedExamId || selectedIds.size === 0}
                    isLoading={isSending}
                    loadingText="발송 중...">
                    <span className="flex items-center gap-spacing-200">
                      <Send className="size-4" />
                      시험결과 발송
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="메시지 미리보기"
        subtitle={previewStudent ? `${previewStudent.name} 학생에게 발송될 메시지입니다` : undefined}
        maxWidth="md"
        footer={
          <Button className="ml-auto" onClick={() => setIsPreviewOpen(false)}>
            확인
          </Button>
        }>
        <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-400">
          <p className="whitespace-pre-wrap text-body text-content-standard-primary">{previewMessage}</p>
        </div>
        {previewStudent && (
          <div className="mt-spacing-400 rounded-radius-300 bg-solid-translucent-blue p-spacing-400">
            <p className="font-semibold text-label text-solid-blue">적용된 변수</p>
            <div className="mt-spacing-200 grid grid-cols-2 gap-spacing-200 text-content-standard-secondary text-footnote">
              <span>이름: {previewStudent.name}</span>
              <span>코스: {selectedCourse?.name || "-"}</span>
              <span>시험: {selectedExam?.name || "-"}</span>
              <span>과제: {previewStudent.assignmentStatus || "-"}</span>
              <span>점수: {previewStudent.score ?? "-"}</span>
              <span>만점: {exportData?.exam?.maxScore || 100}</span>
              <span>석차: {previewStudent.rank ?? "-"}</span>
              <span>전체: {students.length}명</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
