"use client";

import { useAtom } from "jotai";
import { Check, Eye, Info, Minus, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterSelect } from "@/shared/components/ui/filterSelect";
import { Modal } from "@/shared/components/ui/modal";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { StudentListContainer, StudentListEmpty } from "@/shared/components/ui/studentList";
import type { RecipientType } from "@/shared/types";
import {
  recipientTypeAtom,
  retakeManagementFilterAtom,
  retakeMessageTemplateAtom,
  retakeStatusFilterAtom,
  selectedRetakeIdsAtom,
} from "../(atoms)/useMessageStore";
import { useMessageTemplates } from "../(hooks)/useMessageTemplates";
import { useSendRetakeNotice } from "../(hooks)/useSendMessage";
import { useRetakes } from "../(hooks)/useStudents";
import TemplateSelector from "./TemplateSelector";

const RECIPIENT_OPTIONS: { value: RecipientType; label: string }[] = [
  { value: "student", label: "학생" },
  { value: "parent", label: "학부모" },
  { value: "both", label: "둘 다" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "대기중" },
  { value: "absent", label: "결석" },
];

const MANAGEMENT_STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "재시 안내 예정", label: "재시 안내 예정" },
  { value: "재시 안내 완료", label: "재시 안내 완료" },
  { value: "클리닉 1회 불참 연락 필요", label: "클리닉 1회 불참 연락 필요" },
  { value: "클리닉 1회 불참 연락 완료", label: "클리닉 1회 불참 연락 완료" },
  { value: "클리닉 2회 불참 연락 필요", label: "클리닉 2회 불참 연락 필요" },
  { value: "클리닉 2회 불참 연락 완료", label: "클리닉 2회 불참 연락 완료" },
  { value: "실장 집중 상담 필요", label: "실장 집중 상담 필요" },
  { value: "실장 집중 상담 진행 중", label: "실장 집중 상담 진행 중" },
  { value: "실장 집중 상담 완료", label: "실장 집중 상담 완료" },
];

const TEMPLATE_VARIABLES = [
  { key: "{오늘날짜}", description: "오늘 날짜" },
  { key: "{이름}", description: "학생 이름" },
  { key: "{수업명}", description: "수업명" },
  { key: "{시험명}", description: "시험명" },
  { key: "{회차}", description: "시험 회차" },
  { key: "{예정일}", description: "예정일" },
  { key: "{상태}", description: "상태" },
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

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "미정";
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export default function RetakeNoticeTab() {
  const [statusFilter, setStatusFilter] = useAtom(retakeStatusFilterAtom);
  const [managementFilter, setManagementFilter] = useAtom(retakeManagementFilterAtom);
  const { retakes, isLoading } = useRetakes(statusFilter, managementFilter);
  const { sendRetakeNotice, isSending } = useSendRetakeNotice();
  const { templates, addTemplate, deleteTemplate } = useMessageTemplates("retake");

  const [selectedIds, setSelectedIds] = useAtom(selectedRetakeIdsAtom);
  const [recipientType, setRecipientType] = useAtom(recipientTypeAtom);
  const [messageTemplate, setMessageTemplate] = useAtom(retakeMessageTemplateAtom);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSelectedIds(new Set<string>());
    setSearchQuery("");
  }, [statusFilter, managementFilter, setSelectedIds]);

  const filteredRetakes = useMemo(() => {
    if (!searchQuery.trim()) return retakes;
    const query = searchQuery.toLowerCase();
    return retakes.filter((retake) => retake.student.name.toLowerCase().includes(query));
  }, [retakes, searchQuery]);

  const allSelected = useMemo(() => {
    if (filteredRetakes.length === 0) return false;
    return filteredRetakes.every((r) => selectedIds.has(r.id));
  }, [filteredRetakes, selectedIds]);

  const someSelected = useMemo(() => {
    return filteredRetakes.some((r) => selectedIds.has(r.id)) && !allSelected;
  }, [filteredRetakes, selectedIds, allSelected]);

  const byteLength = useMemo(() => getByteLength(messageTemplate), [messageTemplate]);
  const isLMS = byteLength > 90;
  const maxBytes = isLMS ? 2000 : 90;

  const previewRetake = useMemo(() => {
    if (retakes.length === 0) return null;
    const firstSelectedId = Array.from(selectedIds)[0];
    return retakes.find((r) => r.id === firstSelectedId) || retakes[0];
  }, [retakes, selectedIds]);

  const formatStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "예정";
      case "completed":
        return "완료";
      case "absent":
        return "불참";
      default:
        return status;
    }
  };

  const previewMessage = useMemo(() => {
    if (!previewRetake) return messageTemplate;
    return messageTemplate
      .replace(/{이름}/g, previewRetake.student.name)
      .replace(/{수업명}/g, previewRetake.exam.course.name)
      .replace(/{시험명}/g, previewRetake.exam.name)
      .replace(/{회차}/g, previewRetake.exam.exam_number.toString())
      .replace(/{예정일}/g, formatDate(previewRetake.current_scheduled_date))
      .replace(/{상태}/g, formatStatusLabel(previewRetake.status));
  }, [messageTemplate, previewRetake]);

  const handleToggleRetake = useCallback(
    (retakeId: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(retakeId)) {
          next.delete(retakeId);
        } else {
          next.add(retakeId);
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
        for (const retake of filteredRetakes) {
          next.delete(retake.id);
        }
      } else {
        for (const retake of filteredRetakes) {
          next.add(retake.id);
        }
      }
      return next;
    });
  }, [setSelectedIds, filteredRetakes, allSelected]);

  const handleSend = useCallback(async () => {
    if (selectedIds.size === 0) {
      alert("수신자를 선택하세요.");
      return;
    }

    try {
      const result = await sendRetakeNotice({
        retakeIds: Array.from(selectedIds),
        recipientType,
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
  }, [selectedIds, recipientType, messageTemplate, sendRetakeNotice, setSelectedIds]);

  return (
    <div className="flex flex-col gap-spacing-600">
      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
        <div className="mb-spacing-400">
          <h3 className="font-semibold text-body text-content-standard-primary">재시험 필터</h3>
          <p className="text-content-standard-tertiary text-footnote">안내할 재시험 상태를 선택하세요</p>
        </div>

        <div className="grid grid-cols-2 gap-spacing-400">
          <div className="flex flex-col gap-spacing-200">
            <label className="font-semibold text-content-standard-secondary text-label">진행 상태</label>
            <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full">
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </div>

          <div className="flex flex-col gap-spacing-200">
            <label className="font-semibold text-content-standard-secondary text-label">관리 상태</label>
            <FilterSelect
              value={managementFilter}
              onChange={(e) => setManagementFilter(e.target.value)}
              className="w-full">
              {MANAGEMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-spacing-900">
          <div className="size-8 animate-spin rounded-full border-2 border-core-accent border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-row items-start gap-spacing-600">
          <div className="flex-1 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <div className="border-line-divider border-b px-spacing-500 py-spacing-400">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-body text-content-standard-primary">재시험 목록</h3>
                  <p className="text-content-standard-tertiary text-footnote">
                    {selectedIds.size > 0 ? (
                      <span className="text-core-accent">{selectedIds.size}건 선택됨</span>
                    ) : (
                      `총 ${retakes.length}건`
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
                  <span className="text-content-standard-tertiary">({filteredRetakes.length}건)</span>
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
                {filteredRetakes.length === 0 ? (
                  <StudentListEmpty
                    message={retakes.length === 0 ? "해당 상태의 재시험이 없습니다" : "검색 결과가 없습니다"}
                  />
                ) : (
                  filteredRetakes.map((retake) => {
                    const isSelected = selectedIds.has(retake.id);
                    return (
                      <label
                        key={retake.id}
                        className="flex cursor-pointer items-center gap-spacing-300 border-line-divider border-b px-spacing-400 py-spacing-300 transition-all duration-150 last:border-b-0 hover:bg-core-accent-translucent/50">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRetake(retake.id)}
                          className="size-4 shrink-0 cursor-pointer accent-core-accent"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-spacing-200">
                            <span className="truncate font-medium text-body text-content-standard-primary">
                              {retake.student.name}
                            </span>
                            <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-semibold text-footnote text-solid-blue">
                              {formatDate(retake.current_scheduled_date)}
                            </span>
                            {retake.management_status && (
                              <span className="rounded-radius-200 bg-solid-translucent-yellow px-spacing-200 py-spacing-50 font-semibold text-footnote text-solid-yellow">
                                {retake.management_status}
                              </span>
                            )}
                          </div>
                          <div className="truncate text-content-standard-tertiary text-footnote">
                            {retake.exam.course.name} - {retake.exam.exam_number}회 {retake.exam.name}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </StudentListContainer>
            </div>
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
                      <span className="font-semibold text-core-accent">{selectedIds.size}건</span> 발송
                    </span>
                  ) : (
                    <span>재시험을 선택하세요</span>
                  )}
                </div>
                <div className="flex gap-spacing-200">
                  <Button variant="secondary" onClick={() => setIsPreviewOpen(true)} disabled={retakes.length === 0}>
                    <span className="flex items-center gap-spacing-200">
                      <Eye className="size-4" />
                      미리보기
                    </span>
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={selectedIds.size === 0}
                    isLoading={isSending}
                    loadingText="발송 중...">
                    <span className="flex items-center gap-spacing-200">
                      <Send className="size-4" />
                      재시험 안내 발송
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
        subtitle={previewRetake ? `${previewRetake.student.name} 학생에게 발송될 메시지입니다` : undefined}
        maxWidth="md"
        footer={
          <Button className="ml-auto" onClick={() => setIsPreviewOpen(false)}>
            확인
          </Button>
        }>
        <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-400">
          <p className="whitespace-pre-wrap text-body text-content-standard-primary">{previewMessage}</p>
        </div>
        {previewRetake && (
          <div className="mt-spacing-400 rounded-radius-300 bg-solid-translucent-blue p-spacing-400">
            <p className="font-semibold text-label text-solid-blue">적용된 변수</p>
            <div className="mt-spacing-200 grid grid-cols-2 gap-spacing-200 text-content-standard-secondary text-footnote">
              <span>이름: {previewRetake.student.name}</span>
              <span>코스: {previewRetake.exam.course.name}</span>
              <span>시험: {previewRetake.exam.name}</span>
              <span>회차: {previewRetake.exam.exam_number}회</span>
              <span>예정일: {formatDate(previewRetake.current_scheduled_date)}</span>
              <span>상태: {formatStatusLabel(previewRetake.status)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
