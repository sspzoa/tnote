"use client";

import { useAtom } from "jotai";
import { Check, Eye, Info, Minus, Send } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { StudentListContainer, StudentListEmpty, StudentListItem } from "@/shared/components/ui/studentList";
import type { RecipientType } from "@/shared/types";
import {
  messageTextAtom,
  recipientTypeAtom,
  searchQueryAtom,
  selectedStudentIdsAtom,
} from "../(atoms)/useMessageStore";
import { useMessageTemplates } from "../(hooks)/useMessageTemplates";
import { useSendMessage } from "../(hooks)/useSendMessage";
import { useStudents } from "../(hooks)/useStudents";
import TemplateSelector from "./TemplateSelector";

const RECIPIENT_OPTIONS: { value: RecipientType; label: string }[] = [
  { value: "student", label: "학생" },
  { value: "parent", label: "학부모" },
  { value: "both", label: "둘 다" },
];

const TEMPLATE_VARIABLES = [
  { key: "{오늘날짜}", description: "오늘 날짜" },
  { key: "{이름}", description: "학생 이름" },
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

const getTodayFormatted = (): string => {
  const today = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${today.getMonth() + 1}/${today.getDate()}(${days[today.getDay()]})`;
};

export default function GeneralTab() {
  const { students, isLoading } = useStudents();
  const { sendMessage, isSending } = useSendMessage();
  const { templates, addTemplate, deleteTemplate } = useMessageTemplates("general");

  const [selectedIds, setSelectedIds] = useAtom(selectedStudentIdsAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [recipientType, setRecipientType] = useAtom(recipientTypeAtom);
  const [messageText, setMessageText] = useAtom(messageTextAtom);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const byteLength = useMemo(() => getByteLength(messageText), [messageText]);
  const isLMS = byteLength > 90;
  const maxBytes = isLMS ? 2000 : 90;

  const previewStudent = useMemo(() => {
    if (students.length === 0) return null;
    const firstSelectedId = Array.from(selectedIds)[0];
    return students.find((s) => s.id === firstSelectedId) || students[0];
  }, [students, selectedIds]);

  const previewMessage = useMemo(() => {
    if (!previewStudent) return messageText;
    return messageText.replace(/{이름}/g, previewStudent.name).replace(/{오늘날짜}/g, getTodayFormatted());
  }, [messageText, previewStudent]);

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
    if (selectedIds.size === 0) {
      alert("수신자를 선택하세요.");
      return;
    }
    if (!messageText.trim()) {
      alert("메시지를 입력하세요.");
      return;
    }

    try {
      const result = await sendMessage({
        recipientType,
        recipientIds: Array.from(selectedIds),
        text: messageText.trim(),
      });

      if (result.success && result.data) {
        alert(
          `${result.data.successCount}건 발송 완료${result.data.failCount > 0 ? `, ${result.data.failCount}건 실패` : ""}`,
        );
        setMessageText("");
        setSelectedIds(new Set<string>());
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "문자 발송에 실패했습니다.");
    }
  }, [selectedIds, messageText, recipientType, sendMessage, setMessageText, setSelectedIds]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-spacing-900">
        <div className="size-8 animate-spin rounded-full border-2 border-core-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-row items-start gap-spacing-600">
      <div className="flex-1 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
        <div className="border-line-divider border-b px-spacing-500 py-spacing-400">
          <h3 className="font-semibold text-body text-content-standard-primary">수신자 선택</h3>
          <p className="text-content-standard-tertiary text-footnote">
            {selectedIds.size > 0 ? (
              <span className="text-core-accent">{selectedIds.size}명 선택됨</span>
            ) : (
              `총 ${students.length}명`
            )}
          </p>
        </div>

        <div className="border-line-divider border-b bg-components-fill-standard-secondary/50 px-spacing-500 py-spacing-300">
          <button
            onClick={handleSelectAll}
            className="group flex w-full items-center gap-spacing-300 rounded-radius-200 transition-colors">
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
              <StudentListEmpty message={students.length === 0 ? "등록된 학생이 없습니다" : "검색 결과가 없습니다"} />
            ) : (
              filteredStudents.map((student) => (
                <StudentListItem
                  key={student.id}
                  student={student}
                  selected={selectedIds.has(student.id)}
                  onToggle={() => handleToggleStudent(student.id)}
                />
              ))
            )}
          </StudentListContainer>
        </div>
      </div>

      <div className="flex-1 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
        <div className="border-line-divider border-b px-spacing-500 py-spacing-400">
          <h3 className="font-semibold text-body text-content-standard-primary">메시지 작성</h3>
          <p className="text-content-standard-tertiary text-footnote">발송할 메시지를 입력하세요</p>
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

        <div className="flex flex-1 flex-col px-spacing-500 py-spacing-400">
          <div className="mb-spacing-300 flex items-center justify-between">
            <label className="font-semibold text-content-standard-primary text-label">메시지 내용</label>
            <div className="flex items-center gap-spacing-300">
              <span
                className={`rounded-radius-200 px-spacing-200 py-spacing-100 font-semibold text-footnote ${
                  isLMS ? "bg-solid-translucent-yellow text-solid-yellow" : "bg-solid-translucent-blue text-solid-blue"
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
            currentContent={messageText}
            onSelect={setMessageText}
            onSave={addTemplate}
            onDelete={deleteTemplate}
          />

          <textarea
            value={messageText}
            onChange={(e) => {
              if (getByteLength(e.target.value) <= 2000) {
                setMessageText(e.target.value);
              }
            }}
            placeholder="메시지를 입력하세요..."
            className="mt-spacing-300 h-64 resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
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
                  onClick={() => setMessageText((prev) => prev + variable.key)}
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
                <span>수신자를 선택하세요</span>
              )}
            </div>
            <div className="flex gap-spacing-200">
              <Button variant="secondary" onClick={() => setIsPreviewOpen(true)} disabled={students.length === 0}>
                <span className="flex items-center gap-spacing-200">
                  <Eye className="size-4" />
                  미리보기
                </span>
              </Button>
              <Button
                onClick={handleSend}
                disabled={selectedIds.size === 0 || !messageText.trim()}
                isLoading={isSending}
                loadingText="발송 중...">
                <span className="flex items-center gap-spacing-200">
                  <Send className="size-4" />
                  문자 발송
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

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
              <span>오늘날짜: {getTodayFormatted()}</span>
              <span>이름: {previewStudent.name}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
