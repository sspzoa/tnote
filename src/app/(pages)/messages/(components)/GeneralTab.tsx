"use client";

import { useAtom } from "jotai";
import { Eye, Send } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { StudentListContainer, StudentListEmpty, StudentListItem } from "@/shared/components/ui/studentList";
import { messageTextAtom, recipientTypeAtom } from "../(atoms)/useMessageStore";
import { useMessageTemplates } from "../(hooks)/useMessageTemplates";
import { useSelectionList } from "../(hooks)/useSelectionList";
import { useSendMessage } from "../(hooks)/useSendMessage";
import { useStudents } from "../(hooks)/useStudents";
import { GENERAL_TEMPLATE_VARIABLES, getTodayFormatted } from "../(utils)/messageUtils";
import { MessageComposer, MessagePreviewModal, RecipientTypeSelector, SelectAllCheckbox } from "./shared";

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
    return <LoadingComponent />;
  }

  return (
    <div className="flex flex-row items-start gap-spacing-600">
      <div className="flex-1 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
        <div className="border-line-divider border-b px-spacing-500 py-spacing-400">
          <h3 className="font-semibold text-body text-content-standard-primary">수신자 선택</h3>
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

        <RecipientTypeSelector value={recipientType} onChange={setRecipientType} />

        <div className="flex flex-1 flex-col px-spacing-500 py-spacing-400">
          <MessageComposer
            messageText={messageText}
            onMessageChange={setMessageText}
            templateVariables={GENERAL_TEMPLATE_VARIABLES}
            templates={templates}
            onSaveTemplate={addTemplate}
            onDeleteTemplate={deleteTemplate}
          />

          <div className="mt-spacing-400 flex items-center justify-between">
            <div className="text-content-standard-tertiary text-footnote">
              {selectedCount > 0 ? (
                <span>
                  <span className="font-semibold text-core-accent">{selectedCount}명</span>에게 발송
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
                disabled={selectedCount === 0 || !messageText.trim()}
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

      <MessagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        recipientName={previewStudent?.name}
        previewMessage={previewMessage}
        variables={[
          { label: "오늘날짜", value: getTodayFormatted() },
          { label: "이름", value: previewStudent?.name },
        ]}
      />
    </div>
  );
}
