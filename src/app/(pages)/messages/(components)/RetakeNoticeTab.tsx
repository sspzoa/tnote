"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FilterSelect } from "@/shared/components/ui/filterSelect";
import { useManagementStatuses } from "@/shared/hooks/useManagementStatuses";
import type { StatusColor } from "@/shared/types";
import {
  recipientTypeAtom,
  retakeManagementFilterAtom,
  retakeMessageTemplateAtom,
  retakeStatusFilterAtom,
} from "../(atoms)/useMessageStore";
import { useMessageTemplates } from "../(hooks)/useMessageTemplates";
import { useSelectionList } from "../(hooks)/useSelectionList";
import { useSendRetakeNotice } from "../(hooks)/useSendMessage";
import { useRetakes } from "../(hooks)/useStudents";
import { formatDate, RETAKE_TEMPLATE_VARIABLES } from "../(utils)/messageUtils";
import { MessageTabLayout } from "./shared";

const STATUS_OPTIONS = [
  { value: "pending", label: "대기중" },
  { value: "absent", label: "결석" },
];

const STATUS_COLOR_CLASSES: Record<StatusColor, string> = {
  success: "bg-solid-translucent-green text-core-status-positive",
  warning: "bg-solid-translucent-yellow text-core-status-warning",
  danger: "bg-solid-translucent-red text-core-status-negative",
  info: "bg-core-accent-translucent text-core-accent",
  neutral: "bg-components-fill-standard-secondary text-content-standard-secondary",
};

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

export default function RetakeNoticeTab() {
  const [statusFilter, setStatusFilter] = useAtom(retakeStatusFilterAtom);
  const [managementFilter, setManagementFilter] = useAtom(retakeManagementFilterAtom);
  const { retakes, isFetching } = useRetakes(statusFilter, managementFilter);
  const { statuses: managementStatuses } = useManagementStatuses();
  const { sendRetakeNotice, isSending } = useSendRetakeNotice();
  const { templates, addTemplate, deleteTemplate } = useMessageTemplates("retake");

  const [recipientType, setRecipientType] = useAtom(recipientTypeAtom);
  const [messageTemplate, setMessageTemplate] = useAtom(retakeMessageTemplateAtom);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    selectedIds,
    searchQuery,
    setSearchQuery,
    filteredItems: filteredRetakes,
    allSelected,
    someSelected,
    handleToggle: handleToggleRetake,
    handleSelectAll,
    resetSelection,
    selectedCount,
  } = useSelectionList({
    items: retakes,
    getSearchableText: (retake) => retake.student.name,
  });

  useEffect(() => {
    resetSelection();
  }, [statusFilter, managementFilter, resetSelection]);

  const previewRetake = useMemo(() => {
    if (retakes.length === 0) return null;
    const firstSelectedId = Array.from(selectedIds)[0];
    return retakes.find((r) => r.id === firstSelectedId) || retakes[0];
  }, [retakes, selectedIds]);

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

  const handleSend = useCallback(async () => {
    if (selectedCount === 0) {
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
        resetSelection();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "문자 발송에 실패했습니다.");
    }
  }, [selectedIds, selectedCount, recipientType, messageTemplate, sendRetakeNotice, resetSelection]);

  const filterHeader = (
    <div className="border-line-divider border-b px-spacing-500 py-spacing-400">
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
            <option value="all">전체</option>
            {managementStatuses.map((status) => (
              <option key={status.id} value={status.name}>
                {status.name}
              </option>
            ))}
          </FilterSelect>
        </div>
      </div>
    </div>
  );

  return (
    <MessageTabLayout
      isLoading={isFetching}
      selection={{
        title: "재시험 목록",
        subtitle: "재시험을 선택하세요",
        selectedCount,
        totalCount: retakes.length,
        searchQuery,
        onSearchChange: setSearchQuery,
        allSelected,
        someSelected,
        onSelectAll: handleSelectAll,
        emptyMessage: "해당 상태의 재시험이 없습니다",
        noResultsMessage: "검색 결과가 없습니다",
        filteredCount: filteredRetakes.length,
        unit: "건",
        headerContent: filterHeader,
        renderItems: () =>
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
                      {retake.student.name} - {formatDate(retake.current_scheduled_date)}
                    </span>
                    {retake.management_status &&
                      (() => {
                        const statusItem = managementStatuses.find((s) => s.name === retake.management_status);
                        const colorClass = statusItem
                          ? STATUS_COLOR_CLASSES[statusItem.color as StatusColor]
                          : STATUS_COLOR_CLASSES.neutral;
                        return (
                          <span
                            className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-semibold text-footnote ${colorClass}`}>
                            {retake.management_status}
                          </span>
                        );
                      })()}
                  </div>
                  <div className="truncate text-content-standard-tertiary text-footnote">
                    {retake.exam.course.name} - {retake.exam.exam_number}회 {retake.exam.name}
                  </div>
                </div>
              </label>
            );
          }),
      }}
      message={{
        recipientType,
        onRecipientTypeChange: setRecipientType,
        messageText: messageTemplate,
        onMessageChange: setMessageTemplate,
        templateVariables: RETAKE_TEMPLATE_VARIABLES,
        templates,
        onSaveTemplate: addTemplate,
        onDeleteTemplate: deleteTemplate,
      }}
      send={{
        buttonText: "재시험 안내 발송",
        onSend: handleSend,
        isSending,
        canSend: selectedCount > 0,
      }}
      preview={{
        isOpen: isPreviewOpen,
        onOpen: () => setIsPreviewOpen(true),
        onClose: () => setIsPreviewOpen(false),
        recipientName: previewRetake?.student.name,
        message: previewMessage,
        variables: [
          { label: "이름", value: previewRetake?.student.name },
          { label: "수업", value: previewRetake?.exam.course.name },
          { label: "시험", value: previewRetake?.exam.name },
          { label: "회차", value: previewRetake ? `${previewRetake.exam.exam_number}회` : undefined },
          { label: "예정일", value: previewRetake ? formatDate(previewRetake.current_scheduled_date) : undefined },
          { label: "상태", value: previewRetake ? formatStatusLabel(previewRetake.status) : undefined },
        ],
      }}
    />
  );
}
