"use client";

import { useAtom } from "jotai";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  History,
  Key,
  MessageSquare,
  Phone,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import Container from "@/shared/components/common/Container";
import Header from "@/shared/components/common/Header";
import { Button, SegmentedControl, Skeleton, SlidePanel } from "@/shared/components/ui";
import { formatLocaleDateKorean, formatLocaleTimeKorean } from "@/shared/lib/utils/date";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { activeTabAtom, type MessageTab, showHistoryModalAtom } from "./(atoms)/useMessageStore";
import ExamResultsTab from "./(components)/ExamResultsTab";
import GeneralTab from "./(components)/GeneralTab";
import RetakeNoticeTab from "./(components)/RetakeNoticeTab";
import SenderPhoneSettings from "./(components)/SenderPhoneSettings";
import SolapiSettings from "./(components)/SolapiSettings";
import { type MessageBatch, useMessageHistory } from "./(hooks)/useMessageHistory";
import { useSenderPhone } from "./(hooks)/useSenderPhone";
import { useSolapiSettings } from "./(hooks)/useSolapiSettings";

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
  return "bg-muted text-muted-foreground";
};

const HistoryItem = ({ batch }: { batch: MessageBatch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const createdAt = new Date(batch.created_at);
  const dateStr = formatLocaleDateKorean(createdAt);
  const timeStr = formatLocaleTimeKorean(createdAt);

  const title =
    batch.recipients.length === 1
      ? batch.recipients[0].recipient_name
      : `${batch.recipients[0].recipient_name} 외 ${batch.recipients.length - 1}건`;

  return (
    <div className="border-border border-b">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full flex-col gap-1 px-7 py-4 text-left transition-all duration-150 hover:bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-base text-foreground">{title}</span>
            <span
              className={`rounded-sm px-1.5 py-0.5 font-semibold text-[10px] leading-4 ${getMessageTypeBadgeStyle(batch.message_type)}`}>
              {getMessageTypeLabel(batch.message_type)}
            </span>
            {batch.fail_count > 0 && (
              <span className="rounded-sm bg-solid-translucent-red px-1.5 py-0.5 font-semibold text-[10px] text-destructive leading-4">
                {batch.fail_count}건 실패
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-sm border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary text-xs">
              {dateStr}
            </span>
            {batch.recipients.length > 1 &&
              (isExpanded ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              ))}
          </div>
        </div>
        <div className="line-clamp-2 text-base text-muted-foreground">{batch.message_content}</div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
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
        <div className="border-border border-t bg-muted/50 px-7 py-3">
          <div className="flex flex-col gap-2">
            {batch.recipients.map((recipient) => (
              <div key={recipient.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-foreground">{recipient.recipient_name}</span>
                  <span className="text-muted-foreground">
                    ({recipient.recipient_type === "student" ? "학생" : "학부모"})
                  </span>
                  <span className="text-muted-foreground/60">{formatPhoneNumber(recipient.recipient_phone)}</span>
                </div>
                {recipient.is_success ? (
                  <span className="text-success">성공</span>
                ) : (
                  <span className="text-destructive" title={recipient.error_message || undefined}>
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

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const [showHistoryPanel, setShowHistoryPanel] = useAtom(showHistoryModalAtom);
  const [showSenderPhoneSettings, setShowSenderPhoneSettings] = useState(false);
  const [showSolapiSettings, setShowSolapiSettings] = useState(false);
  const { history, isLoading, refetch } = useMessageHistory();
  const { senderPhoneNumber, isLoading: isSenderPhoneLoading } = useSenderPhone();
  const { isConfigured: isSolapiConfigured, isLoading: isSolapiLoading } = useSolapiSettings();

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
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setShowSolapiSettings(true)} className="flex items-center gap-2">
              <Key className="size-4" />
              <span className="hidden sm:inline">SOLAPI:</span>
              {isSolapiLoading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <span className={isSolapiConfigured ? "text-primary" : "text-destructive"}>
                  {isSolapiConfigured ? "설정됨" : "미설정"}
                </span>
              )}
              <Settings className="size-3 text-muted-foreground" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowSenderPhoneSettings(true)}
              className="flex items-center gap-2">
              <Phone className="size-4" />
              <span className="hidden sm:inline">발신번호:</span>
              {isSenderPhoneLoading ? (
                <Skeleton className="h-5 w-28" />
              ) : (
                <span className={senderPhoneNumber ? "text-primary" : "text-destructive"}>
                  {senderPhoneNumber ? formatPhoneNumber(senderPhoneNumber) : "미설정"}
                </span>
              )}
              <Settings className="size-3 text-muted-foreground" />
            </Button>
            <Button variant="secondary" onClick={() => setShowHistoryPanel(true)} className="flex items-center gap-2">
              <History className="size-4" />
              발송 이력
            </Button>
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
          <div className="flex flex-col gap-3 p-7">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 border-border border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-14 rounded-sm" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-sm" />
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <History className="size-6 text-primary" />
            </div>
            <span className="text-muted-foreground text-sm">발송 이력이 없습니다.</span>
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
      <SolapiSettings isOpen={showSolapiSettings} onClose={() => setShowSolapiSettings(false)} />
    </Container>
  );
}
