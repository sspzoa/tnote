"use client";

import { useAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { StudentListItem } from "@/shared/components/ui/studentList";
import { messageTextAtom, recipientTypeAtom } from "../(atoms)/useMessageStore";
import { useMessageTemplates } from "../(hooks)/useMessageTemplates";
import { useSelectionList } from "../(hooks)/useSelectionList";
import { useSendMessage } from "../(hooks)/useSendMessage";
import { useStudents } from "../(hooks)/useStudents";
import { GENERAL_TEMPLATE_VARIABLES, getTodayFormatted } from "../(utils)/messageUtils";
import { MessageTabLayout, MessageTabSkeleton } from "./shared";

export default function GeneralTab() {
  const { students, isLoading } = useStudents();
  const { sendMessage, isSending } = useSendMessage();
  const { templates, addTemplate, deleteTemplate } = useMessageTemplates("general");

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

  const [recipientType, setRecipientType] = useAtom(recipientTypeAtom);
  const [messageText, setMessageText] = useAtom(messageTextAtom);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const previewStudent = useMemo(() => {
    if (students.length === 0) return null;
    const firstSelectedId = Array.from(selectedIds)[0];
    return students.find((s) => s.id === firstSelectedId) || students[0];
  }, [students, selectedIds]);

  const previewMessage = useMemo(() => {
    if (!previewStudent) return messageText;
    return messageText.replace(/{이름}/g, previewStudent.name).replace(/{오늘날짜}/g, getTodayFormatted());
  }, [messageText, previewStudent]);

  const handleSend = useCallback(async () => {
    if (selectedCount === 0) {
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
        resetSelection();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "문자 발송에 실패했습니다.");
    }
  }, [selectedIds, selectedCount, messageText, recipientType, sendMessage, setMessageText, resetSelection]);

  if (isLoading) {
    return <MessageTabSkeleton />;
  }

  return (
    <MessageTabLayout
      selection={{
        title: "수신자 선택",
        subtitle: "수신자를 선택하세요",
        selectedCount,
        totalCount: students.length,
        searchQuery,
        onSearchChange: setSearchQuery,
        allSelected,
        someSelected,
        onSelectAll: handleSelectAll,
        emptyMessage: "등록된 학생이 없습니다",
        noResultsMessage: "검색 결과가 없습니다",
        filteredCount: filteredStudents.length,
        renderItems: () =>
          filteredStudents.map((student) => (
            <StudentListItem
              key={student.id}
              student={student}
              selected={selectedIds.has(student.id)}
              onToggle={() => handleToggleStudent(student.id)}
            />
          )),
      }}
      message={{
        recipientType,
        onRecipientTypeChange: setRecipientType,
        messageText,
        onMessageChange: setMessageText,
        templateVariables: GENERAL_TEMPLATE_VARIABLES,
        templates,
        onSaveTemplate: addTemplate,
        onDeleteTemplate: deleteTemplate,
      }}
      send={{
        buttonText: "문자 발송",
        onSend: handleSend,
        isSending,
        canSend: selectedCount > 0 && messageText.trim().length > 0,
      }}
      preview={{
        isOpen: isPreviewOpen,
        onOpen: () => setIsPreviewOpen(true),
        onClose: () => setIsPreviewOpen(false),
        recipientName: previewStudent?.name,
        message: previewMessage,
        variables: [
          { label: "오늘날짜", value: getTodayFormatted() },
          { label: "이름", value: previewStudent?.name },
        ],
      }}
    />
  );
}
