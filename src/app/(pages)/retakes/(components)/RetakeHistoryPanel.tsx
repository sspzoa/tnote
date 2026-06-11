"use client";

import {
  CalendarClock,
  CircleCheck,
  ClipboardList,
  History,
  type LucideIcon,
  RefreshCw,
  StickyNote,
  Tag,
  UserX,
} from "lucide-react";
import { FeedItem, TransitionChip } from "@/shared/components/common/FeedItem";
import { Badge, type BadgeVariant, SkeletonSpinner, SlidePanel } from "@/shared/components/ui";
import type { FeatureTone } from "@/shared/components/ui/featureTone";
import { formatLocaleMonthDayKorean, formatLocaleTimeKorean } from "@/shared/lib/utils/date";

interface HistoryItem {
  id: string;
  action_type: string;
  created_at: string;
  note: string | null;
  previous_date: string | null;
  new_date: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  performed_by: { name: string } | null;
  retake: {
    student: { name: string };
    exam: {
      name: string;
      exam_number: number;
      course: { name: string };
    };
  };
}

interface RetakeHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  isLoading: boolean;
}

const ACTION_CONFIG: Record<string, { label: string; variant: BadgeVariant; icon: LucideIcon; tone: FeatureTone }> = {
  assign: { label: "할당", variant: "info", icon: ClipboardList, tone: "retakes" },
  postpone: { label: "연기", variant: "warning", icon: CalendarClock, tone: "warning" },
  absent: { label: "결석", variant: "danger", icon: UserX, tone: "destructive" },
  complete: { label: "완료", variant: "success", icon: CircleCheck, tone: "success" },
  status_change: { label: "상태 변경", variant: "info", icon: RefreshCw, tone: "primary" },
  management_status_change: { label: "관리 상태 변경", variant: "warning", icon: Tag, tone: "warning" },
  note_update: { label: "메모 수정", variant: "neutral", icon: StickyNote, tone: "neutral" },
  date_edit: { label: "날짜 수정", variant: "info", icon: CalendarClock, tone: "neutral" },
};

const fallbackConfig = {
  label: "변경",
  variant: "neutral" as BadgeVariant,
  icon: History,
  tone: "neutral" as FeatureTone,
};

export default function RetakeHistoryPanel({ isOpen, onClose, history, isLoading }: RetakeHistoryPanelProps) {
  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title="최근 이력" subtitle="최근 50건">
      {isLoading ? (
        <SkeletonSpinner className="py-16" size="md" />
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft">
            <History className="size-6 text-primary" />
          </div>
          <span className="text-muted-foreground text-sm">이력이 없습니다.</span>
        </div>
      ) : (
        <div className="px-4 py-4">
          {history.map((item, index) => {
            const config = ACTION_CONFIG[item.action_type] ?? fallbackConfig;
            const createdAt = new Date(item.created_at);
            const meta = (
              <>
                {formatLocaleMonthDayKorean(createdAt)} {formatLocaleTimeKorean(createdAt)}
                {item.performed_by && ` · ${item.performed_by.name}`}
              </>
            );

            return (
              <FeedItem
                key={item.id}
                icon={config.icon}
                tone={config.tone}
                rail={index !== history.length - 1}
                title={
                  <>
                    <span className="font-semibold text-foreground text-sm">{item.retake.student.name}</span>
                    <Badge variant={config.variant} size="xs">
                      {config.label}
                    </Badge>
                  </>
                }
                meta={meta}
                description={`${item.retake.exam.course.name} · ${item.retake.exam.name} ${item.retake.exam.exam_number}회차`}>
                {item.action_type === "assign" && (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary-soft px-2.5 py-1 text-primary text-xs">
                    <CalendarClock className="size-3" />
                    {item.new_date ? `예정일 ${item.new_date}` : "예정일 미지정"}
                  </span>
                )}
                {(item.action_type === "postpone" ||
                  item.action_type === "date_edit" ||
                  item.action_type === "complete") &&
                  item.new_date && <TransitionChip from={item.previous_date || "미지정"} to={item.new_date} />}
                {item.action_type === "management_status_change" && item.new_management_status && (
                  <TransitionChip
                    tone="warning"
                    from={item.previous_management_status || "미지정"}
                    to={item.new_management_status}
                  />
                )}
                {item.note && (
                  <p className="truncate border-border border-l-2 pl-2.5 text-muted-foreground text-xs italic">
                    {item.note}
                  </p>
                )}
              </FeedItem>
            );
          })}
        </div>
      )}
    </SlidePanel>
  );
}
