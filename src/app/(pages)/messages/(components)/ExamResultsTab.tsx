"use client";

import { useAtom } from "jotai";
import { Eye, FileText, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { FilterSelect } from "@/shared/components/ui/filterSelect";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { StudentListContainer, StudentListEmpty, StudentListItem } from "@/shared/components/ui/studentList";
import {
  examMessageTemplateAtom,
  recipientTypeAtom,
  selectedCourseIdAtom,
  selectedExamIdAtom,
} from "../(atoms)/useMessageStore";
import { useMessageTemplates } from "../(hooks)/useMessageTemplates";
import { useSelectionList } from "../(hooks)/useSelectionList";
import { useSendExamResults } from "../(hooks)/useSendMessage";
import { useCourses, useExamExport, useExams } from "../(hooks)/useStudents";
import { EXAM_TEMPLATE_VARIABLES } from "../(utils)/messageUtils";
import { MessageComposer, MessagePreviewModal, RecipientTypeSelector, SelectAllCheckbox } from "./shared";

export default function ExamResultsTab() {
  const { courses, isLoading: coursesLoading } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useAtom(selectedCourseIdAtom);
  const [selectedExamId, setSelectedExamId] = useAtom(selectedExamIdAtom);
  const { exams, isLoading: examsLoading } = useExams(selectedCourseId);
  const { exportData, isLoading: exportLoading } = useExamExport(selectedExamId);
  const { sendExamResults, isSending } = useSendExamResults();
  const { templates, addTemplate, deleteTemplate } = useMessageTemplates("exam");

  const [recipientType, setRecipientType] = useAtom(recipientTypeAtom);
  const [messageTemplate, setMessageTemplate] = useAtom(examMessageTemplateAtom);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const {
    selectedIds,
    searchQuery,
    setSearchQuery,
    filteredItems: filteredStudents,
    allSelected,
    someSelected,
    handleToggle: handleToggleStudent,
    handleSelectAll,
    resetSelection,
    selectedCount,
  } = useSelectionList({
    items: students,
    getSearchableText: (student) => student.name,
  });

  useEffect(() => {
    resetSelection();
  }, [selectedExamId, resetSelection]);

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

  const handleSend = useCallback(async () => {
    if (!selectedExamId) {
      alert("시험을 선택하세요.");
      return;
    }
    if (selectedCount === 0) {
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
        resetSelection();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "문자 발송에 실패했습니다.");
    }
  }, [selectedExamId, selectedIds, selectedCount, recipientType, messageTemplate, sendExamResults, resetSelection]);

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
        <LoadingComponent />
      ) : (
        <div className="flex h-[700px] flex-row items-stretch gap-spacing-600">
          <div className="flex flex-1 flex-col rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
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
                  <h3 className="font-semibold text-body text-content-standard-primary">학생 선택</h3>
                  <p className="text-content-standard-tertiary text-footnote">
                    {selectedCount > 0 ? (
                      <span className="text-core-accent">{selectedCount}명 선택됨</span>
                    ) : (
                      `총 ${students.length}명`
                    )}
                  </p>
                </div>

                <SelectAllCheckbox
                  allSelected={allSelected}
                  someSelected={someSelected}
                  totalCount={filteredStudents.length}
                  onToggle={handleSelectAll}
                />

                <div className="flex min-h-0 flex-1 flex-col p-spacing-500">
                  <SearchInput
                    placeholder="학생 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-spacing-300"
                  />
                  <StudentListContainer className="h-0 flex-1">
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

          <div className="flex flex-1 flex-col rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <div className="border-line-divider border-b px-spacing-500 py-spacing-400">
              <h3 className="font-semibold text-body text-content-standard-primary">메시지 템플릿</h3>
              <p className="text-content-standard-tertiary text-footnote">학생별로 변수가 자동 치환됩니다</p>
            </div>

            <RecipientTypeSelector value={recipientType} onChange={setRecipientType} />

            <div className="flex min-h-0 flex-1 flex-col px-spacing-500 py-spacing-400">
              <MessageComposer
                messageText={messageTemplate}
                onMessageChange={setMessageTemplate}
                templateVariables={EXAM_TEMPLATE_VARIABLES}
                templates={templates}
                onSaveTemplate={addTemplate}
                onDeleteTemplate={deleteTemplate}
                className="min-h-0 flex-1"
              />

              <div className="mt-spacing-400 flex items-center justify-between">
                <div className="text-content-standard-tertiary text-footnote">
                  {selectedCount > 0 ? (
                    <span>
                      <span className="font-semibold text-core-accent">{selectedCount}명</span>에게 발송
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
                    disabled={!selectedExamId || selectedCount === 0}
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

      <MessagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        recipientName={previewStudent?.name}
        previewMessage={previewMessage}
        variables={[
          { label: "이름", value: previewStudent?.name },
          { label: "코스", value: selectedCourse?.name },
          { label: "시험", value: selectedExam?.name },
          { label: "과제", value: previewStudent?.assignmentStatus },
          { label: "점수", value: previewStudent?.score },
          { label: "만점", value: exportData?.exam?.maxScore || 100 },
          { label: "석차", value: previewStudent?.rank },
          { label: "전체", value: `${students.length}명` },
        ]}
      />
    </div>
  );
}
