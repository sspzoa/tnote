"use client";

import { useAtom } from "jotai";
import { ChevronDown, ChevronUp, FileText, History, MessageSquare, Phone, RefreshCw, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import Container from "@/shared/components/common/Container";
import Header from "@/shared/components/common/Header";
import { SegmentedControl, Skeleton, SlidePanel } from "@/shared/components/ui";
import { activeTabAtom, type MessageTab, showHistoryModalAtom } from "./(atoms)/useMessageStore";
import ExamResultsTab from "./(components)/ExamResultsTab";
import GeneralTab from "./(components)/GeneralTab";
import RetakeNoticeTab from "./(components)/RetakeNoticeTab";
import SenderPhoneSettings from "./(components)/SenderPhoneSettings";
import { type MessageBatch, useMessageHistory } from "./(hooks)/useMessageHistory";
import { useSenderPhone } from "./(hooks)/useSenderPhone";

const TABS: { value: MessageTab; label: string; icon: typeof MessageSquare }[] = [
  { value: "general", label: "일반", icon: MessageSquare },
  { value: "exam-results", label: "시험결과", icon: FileText },
  { value: "retake-notice", label: "재시험안내", icon: RefreshCw },
];

const getMessageTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    general: "일반",
    exam: "시험결과",
    retake: "재시험안내",
  };
  return labels[type] || type;
};

const getMessageTypeBadgeStyle = (type: string) => {
  if (type === "general") return "bg-solid-translucent-blue text-solid-blue";
  if (type === "exam") return "bg-solid-translucent-purple text-solid-purple";
  if (type === "retake") return "bg-solid-translucent-yellow text-solid-yellow";
  return "bg-components-fill-standard-secondary text-content-standard-secondary";
};

const formatPhoneNumber = (phone: string) => {
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  }
  if (phone.length === 10) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  return phone;
};

const HistoryItem = ({ batch }: { batch: MessageBatch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const createdAt = new Date(batch.created_at);
  const dateStr = createdAt.toLocaleDateString("ko-KR");
  const timeStr = createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  const title =
    batch.recipients.length === 1
      ? batch.recipients[0].recipient_name
      : `${batch.recipients[0].recipient_name} 외 ${batch.recipients.length - 1}건`;

  return (
    <div className="border-line-divider border-b">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full flex-col gap-spacing-100 px-spacing-600 py-spacing-400 text-left transition-all duration-150 hover:bg-core-accent-translucent/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-spacing-200">
            <span className="font-medium text-body text-content-standard-primary">{title}</span>
            <span
              className={`rounded-radius-200 px-spacing-150 py-spacing-50 font-semibold text-caption ${getMessageTypeBadgeStyle(batch.message_type)}`}>
              {getMessageTypeLabel(batch.message_type)}
            </span>
            {batch.fail_count > 0 && (
              <span className="rounded-radius-200 bg-solid-translucent-red px-spacing-150 py-spacing-50 font-semibold text-caption text-core-status-negative">
                {batch.fail_count}건 실패
              </span>
            )}
          </div>
          <div className="flex items-center gap-spacing-200">
            <span className="rounded-radius-200 border border-core-accent/20 bg-core-accent-translucent px-spacing-200 py-spacing-50 text-core-accent text-footnote">
              {dateStr}
            </span>
            {batch.recipients.length > 1 &&
              (isExpanded ? (
                <ChevronUp className="size-4 text-content-standard-tertiary" />
              ) : (
                <ChevronDown className="size-4 text-content-standard-tertiary" />
              ))}
          </div>
        </div>
        <div className="line-clamp-2 text-body text-content-standard-secondary">{batch.message_content}</div>
        <div className="flex items-center gap-spacing-200 text-content-standard-tertiary text-footnote">
          <span>{timeStr}</span>
          <span>·</span>
          <span>
            {batch.success_count}건 성공{batch.fail_count > 0 && ` / ${batch.fail_count}건 실패`}
          </span>
          {batch.sender?.name && (
            <>
              <span>·</span>
              <span>{batch.sender.name}</span>
            </>
          )}
        </div>
      </button>

      {isExpanded && batch.recipients.length > 1 && (
        <div className="border-line-divider border-t bg-components-fill-standard-secondary/50 px-spacing-600 py-spacing-300">
          <div className="flex flex-col gap-spacing-200">
            {batch.recipients.map((recipient) => (
              <div key={recipient.id} className="flex items-center justify-between text-footnote">
                <div className="flex items-center gap-spacing-200">
                  <span className="text-content-standard-primary">{recipient.recipient_name}</span>
                  <span className="text-content-standard-tertiary">
                    ({recipient.recipient_type === "student" ? "학생" : "학부모"})
                  </span>
                  <span className="text-content-standard-quaternary">
                    {formatPhoneNumber(recipient.recipient_phone)}
                  </span>
                </div>
                {recipient.is_success ? (
                  <span className="text-core-status-positive">성공</span>
                ) : (
                  <span className="text-core-status-negative" title={recipient.error_message || undefined}>
                    실패
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const formatPhoneNumberDisplay = (phone: string | null): string => {
  if (!phone) return "미설정";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const [showHistoryPanel, setShowHistoryPanel] = useAtom(showHistoryModalAtom);
  const [showSenderPhoneSettings, setShowSenderPhoneSettings] = useState(false);
  const { history, isLoading, refetch } = useMessageHistory();
  const { senderPhoneNumber, isLoading: isSenderPhoneLoading } = useSenderPhone();

  useEffect(() => {
    if (showHistoryPanel) {
      refetch();
    }
  }, [showHistoryPanel, refetch]);

  return (
    <Container>
      <Header
        title="문자 관리"
        subtitle="학생 및 학부모에게 문자를 발송합니다"
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={
          <div className="flex items-center gap-spacing-300">
            <button
              onClick={() => setShowSenderPhoneSettings(true)}
              className="flex items-center gap-spacing-200 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 font-medium text-body text-content-standard-secondary transition-colors hover:bg-components-interactive-hover hover:text-content-standard-primary">
              <Phone className="size-4" />
              <span className="hidden sm:inline">발신번호:</span>
              {isSenderPhoneLoading ? (
                <Skeleton className="h-5 w-28" />
              ) : (
                <span className={senderPhoneNumber ? "text-core-accent" : "text-core-status-negative"}>
                  {formatPhoneNumberDisplay(senderPhoneNumber)}
                </span>
              )}
              <Settings className="size-3 text-content-standard-tertiary" />
            </button>
            <button
              onClick={() => setShowHistoryPanel(true)}
              className="flex items-center gap-spacing-200 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 font-medium text-body text-content-standard-secondary transition-colors hover:bg-components-interactive-hover hover:text-content-standard-primary">
              <History className="size-4" />
              발송 이력
            </button>
          </div>
        }
      />

      <SegmentedControl items={TABS} value={activeTab} onChange={setActiveTab} />

      {activeTab === "general" && <GeneralTab />}
      {activeTab === "exam-results" && <ExamResultsTab />}
      {activeTab === "retake-notice" && <RetakeNoticeTab />}

      <SlidePanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        title="발송 이력"
        subtitle="최근 50건">
        {isLoading ? (
          <div className="flex flex-col gap-spacing-300 p-spacing-600">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-spacing-200 border-line-divider border-b pb-spacing-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-spacing-200">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-12 rounded-radius-200" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-radius-200" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-spacing-300 py-spacing-900">
            <div className="flex size-12 items-center justify-center rounded-full bg-core-accent-translucent">
              <History className="size-6 text-core-accent" />
            </div>
            <span className="text-content-standard-tertiary text-label">발송 이력이 없습니다.</span>
          </div>
        ) : (
          <div>
            {history.map((batch) => (
              <HistoryItem key={batch.batch_id} batch={batch} />
            ))}
          </div>
        )}
      </SlidePanel>

      <SenderPhoneSettings isOpen={showSenderPhoneSettings} onClose={() => setShowSenderPhoneSettings(false)} />
    </Container>
  );
}
