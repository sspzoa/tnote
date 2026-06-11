"use client";

import { useAtom } from "jotai";
import {
  CalendarClock,
  CircleCheck,
  ClipboardList,
  History as HistoryIcon,
  type LucideIcon,
  RefreshCw,
  StickyNote,
  Tag,
  Undo2,
  UserX,
} from "lucide-react";
import { useEffect } from "react";
import { FeedItem, TransitionChip } from "@/shared/components/common/FeedItem";
import { Badge, type BadgeVariant } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import type { FeatureTone } from "@/shared/components/ui/featureTone";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { formatLocaleMonthDayKorean, formatLocaleTimeKorean } from "@/shared/lib/utils/date";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { showHistoryModalAtom } from "../(atoms)/useModalStore";
import type { History } from "../(atoms)/useRetakesStore";
import { selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeHistory } from "../(hooks)/useRetakeHistory";
import { useRetakeUndo } from "../(hooks)/useRetakeUndo";
import { HistoryListSkeleton } from "./HistoryListSkeleton";

interface RetakeHistoryModalProps {
  onSuccess?: () => void;
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
  icon: HistoryIcon,
  tone: "neutral" as FeatureTone,
};

const statusLabel = (s: string | null) =>
  s === "pending" ? "대기중" : s === "completed" ? "완료" : s === "absent" ? "결석" : (s ?? "");

export default function RetakeHistoryModal({ onSuccess }: RetakeHistoryModalProps) {
  const [isOpen, setIsOpen] = useAtom(showHistoryModalAtom);
  const [selectedRetake] = useAtom(selectedRetakeAtom);
  const { history, isLoading, refetch } = useRetakeHistory(selectedRetake?.id || null);
  const { undoAction, isUndoing } = useRetakeUndo();
  const toast = useToast();
  const confirm = useConfirm();

  // 모달이 열릴 때마다 이력 새로고침
  useEffect(() => {
    if (isOpen && selectedRetake?.id) {
      refetch();
    }
  }, [isOpen, selectedRetake?.id, refetch]);

  const canUndo = (item: History, index: number) => {
    if (index !== 0) return false;
    if (item.action_type === "note_update") return false;
    return true;
  };

  const handleUndo = async (item: History) => {
    if (!selectedRetake) return;
    const label = (ACTION_CONFIG[item.action_type] ?? fallbackConfig).label;
    const ok = await confirm({ title: "작업 되돌리기", message: `"${label}" 작업을 되돌리시겠습니까?` });
    if (!ok) return;

    try {
      await undoAction({ retakeId: selectedRetake.id, historyId: item.id });
      toast.success("작업이 되돌려졌습니다.");
      await refetch();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "되돌리기에 실패했습니다."));
    }
  };

  if (!selectedRetake) return null;

  const subtitle = `${selectedRetake.student.name} · ${selectedRetake.exam.course.name} · ${selectedRetake.exam.name} ${selectedRetake.exam.exam_number}회차`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="재시험 이력"
      subtitle={subtitle}
      footer={
        <Button variant="secondary" onClick={() => setIsOpen(false)} className="w-full">
          닫기
        </Button>
      }>
      {isLoading ? (
        <HistoryListSkeleton count={4} />
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft">
            <HistoryIcon className="size-6 text-primary" />
          </div>
          <span className="text-muted-foreground text-sm">이력이 없습니다.</span>
        </div>
      ) : (
        <div className="pt-0.5">
          {history.map((item, index) => {
            const config = ACTION_CONFIG[item.action_type] ?? fallbackConfig;
            const createdAt = new Date(item.created_at);
            const undoable = canUndo(item, index);

            return (
              <FeedItem
                key={item.id}
                icon={config.icon}
                tone={config.tone}
                rail={index !== history.length - 1}
                title={
                  <Badge variant={config.variant} size="sm">
                    {config.label}
                  </Badge>
                }
                meta={
                  <>
                    {formatLocaleMonthDayKorean(createdAt)} {formatLocaleTimeKorean(createdAt)}
                    {item.performed_by && ` · ${item.performed_by.name}`}
                  </>
                }>
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
                {item.action_type === "status_change" && item.previous_status && item.new_status && (
                  <TransitionChip from={statusLabel(item.previous_status)} to={statusLabel(item.new_status)} />
                )}
                {item.action_type === "management_status_change" &&
                  item.previous_management_status &&
                  item.new_management_status && (
                    <TransitionChip
                      tone="warning"
                      from={item.previous_management_status}
                      to={item.new_management_status}
                    />
                  )}
                {item.note && (
                  <p className="border-border border-l-2 pl-2.5 text-muted-foreground text-xs italic">{item.note}</p>
                )}
                {undoable && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleUndo(item)}
                    disabled={isUndoing}
                    className="w-fit">
                    <Undo2 className="size-3" />
                    되돌리기
                  </Button>
                )}
              </FeedItem>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
