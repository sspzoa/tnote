"use client";

import { Eye, Send } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { SearchInput } from "@/shared/components/ui/searchInput";
import { StudentListContainer, StudentListEmpty } from "@/shared/components/ui/studentList";
import type { RecipientType } from "@/shared/types";
import type { MessageTemplate } from "../../(hooks)/useMessageTemplates";
import type { TemplateVariable } from "../../(utils)/messageUtils";
import MessageComposer from "./MessageComposer";
import MessagePreviewModal from "./MessagePreviewModal";
import RecipientTypeSelector from "./RecipientTypeSelector";
import SelectAllCheckbox from "./SelectAllCheckbox";

interface PreviewVariable {
  label: string;
  value: string | number | null | undefined;
}

interface SelectionPanelProps {
  title: string;
  subtitle: string;
  selectedCount: number;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: () => void;
  emptyMessage: string;
  noResultsMessage: string;
  filteredCount: number;
  renderItems: () => ReactNode;
  unit?: string;
  headerContent?: ReactNode;
  placeholderIcon?: ReactNode;
  placeholderMessage?: string;
  showPlaceholder?: boolean;
}

interface MessagePanelProps {
  recipientType: RecipientType;
  onRecipientTypeChange: (type: RecipientType) => void;
  messageText: string;
  onMessageChange: (text: string) => void;
  templateVariables: TemplateVariable[];
  templates: MessageTemplate[];
  onSaveTemplate: (name: string, content: string) => Promise<unknown>;
  onDeleteTemplate: (id: string) => Promise<unknown>;
}

interface SendActionProps {
  buttonText: string;
  onSend: () => void;
  isSending: boolean;
  canSend: boolean;
}

interface PreviewProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  recipientName?: string;
  message: string;
  variables: PreviewVariable[];
}

interface MessageTabLayoutProps {
  selection: SelectionPanelProps;
  message: MessagePanelProps;
  send: SendActionProps;
  preview: PreviewProps;
  isLoading?: boolean;
}

export default function MessageTabLayout({ selection, message, send, preview, isLoading }: MessageTabLayoutProps) {
  return (
    <>
      <div className="flex h-[700px] flex-row items-stretch gap-7">
        <Card className="flex flex-1 flex-col gap-0 py-0">
          {selection.showPlaceholder ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
              {selection.placeholderIcon && (
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  {selection.placeholderIcon}
                </div>
              )}
              <span className="text-muted-foreground text-sm">{selection.placeholderMessage}</span>
            </div>
          ) : (
            <>
              <div className="border-border border-b px-4 py-2.5">
                <h3 className="font-semibold text-foreground text-sm">{selection.title}</h3>
                <p className="text-muted-foreground text-xs">
                  {selection.selectedCount > 0 ? (
                    <span className="text-primary">
                      {selection.selectedCount}
                      {selection.unit || "명"} 선택됨
                    </span>
                  ) : (
                    `총 ${selection.totalCount}${selection.unit || "명"}`
                  )}
                </p>
              </div>

              {selection.headerContent}

              <SelectAllCheckbox
                allSelected={selection.allSelected}
                someSelected={selection.someSelected}
                totalCount={selection.filteredCount}
                onToggle={selection.onSelectAll}
                unit={selection.unit || "명"}
              />

              <CardContent className="relative flex min-h-0 flex-1 flex-col gap-3 py-2.5">
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/60">
                    <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                <SearchInput
                  placeholder="학생 검색..."
                  value={selection.searchQuery}
                  onChange={(e) => selection.onSearchChange(e.target.value)}
                />
                <StudentListContainer className="h-0 flex-1">
                  {selection.filteredCount === 0 ? (
                    <StudentListEmpty
                      message={selection.totalCount === 0 ? selection.emptyMessage : selection.noResultsMessage}
                    />
                  ) : (
                    selection.renderItems()
                  )}
                </StudentListContainer>
              </CardContent>
            </>
          )}
        </Card>

        <Card className="flex flex-1 flex-col gap-0 py-0">
          <div className="border-border border-b px-4 py-2.5">
            <h3 className="font-semibold text-foreground text-sm">메시지 템플릿</h3>
            <p className="text-muted-foreground text-xs">학생별로 변수가 자동 치환됩니다</p>
          </div>

          <RecipientTypeSelector value={message.recipientType} onChange={message.onRecipientTypeChange} />

          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 py-2.5">
            <MessageComposer
              messageText={message.messageText}
              onMessageChange={message.onMessageChange}
              templateVariables={message.templateVariables}
              templates={message.templates}
              onSaveTemplate={message.onSaveTemplate}
              onDeleteTemplate={message.onDeleteTemplate}
              className="min-h-0 flex-1"
            />

            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-xs">
                {selection.selectedCount > 0 ? (
                  <span>
                    <span className="font-semibold text-primary">
                      {selection.selectedCount}
                      {selection.unit || "명"}
                    </span>
                    에게 발송
                  </span>
                ) : (
                  <span>{selection.subtitle}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={preview.onOpen} disabled={selection.totalCount === 0}>
                  <span className="flex items-center gap-2">
                    <Eye className="size-4" />
                    미리보기
                  </span>
                </Button>
                <Button
                  onClick={send.onSend}
                  disabled={!send.canSend}
                  isLoading={send.isSending}
                  loadingText="발송 중...">
                  <span className="flex items-center gap-2">
                    <Send className="size-4" />
                    {send.buttonText}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MessagePreviewModal
        isOpen={preview.isOpen}
        onClose={preview.onClose}
        recipientName={preview.recipientName}
        previewMessage={preview.message}
        variables={preview.variables}
      />
    </>
  );
}
