"use client";

import { useAtom } from "jotai";
import {
  CalendarClock,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  FileX,
  History as HistoryIcon,
  type LucideIcon,
  RefreshCw,
  StickyNote,
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
import type { AssignmentTaskHistory } from "@/shared/types";
import { selectedTaskAtom } from "../(atoms)/useAssignmentTaskStore";
import { showHistoryModalAtom } from "../(atoms)/useModalStore";
import { useAssignmentTaskHistory } from "../(hooks)/useAssignmentTaskHistory";
import { useAssignmentTaskUndo } from "../(hooks)/useAssignmentTaskUndo";
import { HistoryListSkeleton } from "./HistoryListSkeleton";

interface AssignmentTaskHistoryModalProps {
  onSuccess?: () => void;
}

const ACTION_CONFIG: Record<string, { label: string; variant: BadgeVariant; icon: LucideIcon; tone: FeatureTone }> = {
  assign: { label: "할당", variant: "info", icon: ClipboardList, tone: "assignments" },
  postpone: { label: "연기", variant: "warning", icon: CalendarClock, tone: "warning" },
  complete: { label: "완료", variant: "success", icon: CircleCheck, tone: "success" },
  insufficient: { label: "미흡", variant: "warning", icon: CircleAlert, tone: "warning" },
  not_submitted: { label: "미제출", variant: "danger", icon: FileX, tone: "destructive" },
  absent: { label: "결석", variant: "danger", icon: UserX, tone: "destructive" },
  status_change: { label: "상태 변경", variant: "info", icon: RefreshCw, tone: "primary" },
  note_update: { label: "메모 수정", variant: "neutral", icon: StickyNote, tone: "neutral" },
  date_edit: { label: "날짜 수정", variant: "info", icon: CalendarClock, tone: "neutral" },
};

const fallbackConfig = {
  label: "변경",
  variant: "neutral" as BadgeVariant,
  icon: HistoryIcon,
  tone: "neutral" as FeatureTone,
};

const statusLabel = (s: string | null) => (s === "completed" ? "완료" : "미완료");

export default function AssignmentTaskHistoryModal({ onSuccess }: AssignmentTaskHistoryModalProps) {
  const [isOpen, setIsOpen] = useAtom(showHistoryModalAtom);
  const [selectedTask] = useAtom(selectedTaskAtom);
  const { history, isLoading, refetch } = useAssignmentTaskHistory(selectedTask?.id || null);
  const { undoAction, isUndoing } = useAssignmentTaskUndo();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (isOpen && selectedTask?.id) {
      refetch();
    }
  }, [isOpen, selectedTask?.id, refetch]);

  const canUndo = (item: AssignmentTaskHistory, index: number) => {
    if (index !== 0) return false;
    if (item.action_type === "note_update") return false;
    if (item.action_type === "assign") return false;
    return true;
  };

  const handleUndo = async (item: AssignmentTaskHistory) => {
    if (!selectedTask) return;

    const label = (ACTION_CONFIG[item.action_type] ?? fallbackConfig).label;
    const ok = await confirm({
      title: "작업 되돌리기",
      message: `"${label}" 작업을 되돌리시겠습니까?`,
    });
    if (!ok) return;

    try {
      await undoAction({
        taskId: selectedTask.id,
        historyId: item.id,
      });
      toast.success("작업이 되돌려졌습니다.");
      await refetch();
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "되돌리기에 실패했습니다."));
    }
  };

  if (!selectedTask) return null;

  const subtitle = `${selectedTask.student.name} · ${selectedTask.assignment.course.name} · ${selectedTask.assignment.name}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="과제 이력"
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
