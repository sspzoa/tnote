"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAtom } from "jotai";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input, Modal, Select, StatusBadge } from "@/shared/components/ui";
import {
  useManagementStatusCreate,
  useManagementStatusDelete,
  useManagementStatuses,
  useManagementStatusReorder,
  useManagementStatusUpdate,
} from "@/shared/hooks/useManagementStatuses";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import type { ManagementStatusItem, StatusColor } from "@/shared/types";
import { showManagementStatusSettingsModalAtom } from "../(atoms)/useModalStore";

const COLOR_OPTIONS: { value: StatusColor; label: string }[] = [
  { value: "success", label: "초록 (완료)" },
  { value: "warning", label: "노랑 (진행중)" },
  { value: "danger", label: "빨강 (필요)" },
  { value: "info", label: "파랑 (안내)" },
  { value: "neutral", label: "회색 (기본)" },
];

interface SortableItemProps {
  status: ManagementStatusItem;
  index: number;
  editingId: string | null;
  editName: string;
  editColor: StatusColor;
  isBusy: boolean;
  onStartEdit: (status: ManagementStatusItem) => void;
  onCancelEdit: () => void;
  onConfirmEdit: () => void;
  onDelete: (id: string) => void;
  onEditNameChange: (value: string) => void;
  onEditColorChange: (value: StatusColor) => void;
}

const SortableItem = ({
  status,
  index,
  editingId,
  editName,
  editColor,
  isBusy,
  onStartEdit,
  onCancelEdit,
  onConfirmEdit,
  onDelete,
  onEditNameChange,
  onEditColorChange,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 border-border border-b px-4 py-3 last:border-b-0 ${isDragging ? "z-10 bg-muted opacity-90 shadow-lg" : "bg-background"}`}>
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}>
        <GripVertical className="size-4" />
      </button>

      <span className="w-6 text-center text-[10px] leading-4 text-muted-foreground/60">{index + 1}</span>

      {editingId === status.id ? (
        <>
          <Input
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            disabled={isBusy}
            className="flex-1"
          />
          <Select
            value={editColor}
            onValueChange={(value) => onEditColorChange(value as StatusColor)}
            disabled={isBusy}
            options={COLOR_OPTIONS}
            className="w-32"
          />
          <Button size="sm" onClick={onConfirmEdit} disabled={isBusy || !editName.trim()}>
            확인
          </Button>
          <Button variant="secondary" size="sm" onClick={onCancelEdit} disabled={isBusy}>
            취소
          </Button>
        </>
      ) : (
        <>
          <div className="flex-1">
            <StatusBadge variant={status.color}>{status.name}</StatusBadge>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onStartEdit(status)}
            disabled={isBusy || editingId !== null}>
            수정
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(status.id)}
            disabled={isBusy || editingId !== null}>
            삭제
          </Button>
        </>
      )}
    </div>
  );
};

export default function ManagementStatusSettingsModal() {
  const [showModal, setShowModal] = useAtom(showManagementStatusSettingsModalAtom);
  const { statuses, isLoading } = useManagementStatuses();
  const { mutateAsync: createStatus, isPending: isCreating } = useManagementStatusCreate();
  const { mutateAsync: updateStatus } = useManagementStatusUpdate();
  const { mutateAsync: deleteStatus } = useManagementStatusDelete();
  const { mutateAsync: reorderStatuses } = useManagementStatusReorder();
  const toast = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<StatusColor>("neutral");

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<StatusColor>("neutral");

  const [localStatuses, setLocalStatuses] = useState<ManagementStatusItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setLocalStatuses(statuses);
    setDeletedIds([]);
  }, [statuses]);

  const isBusy = isCreating || isSaving;

  const handleStartEdit = (status: ManagementStatusItem) => {
    setEditingId(status.id);
    setEditName(status.name);
    setEditColor(status.color);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("neutral");
  };

  const handleClose = () => {
    setLocalStatuses(statuses);
    setDeletedIds([]);
    setEditingId(null);
    setEditName("");
    setEditColor("neutral");
    setShowModal(false);
  };

  const handleConfirmEdit = () => {
    if (!editingId || !editName.trim()) return;

    setLocalStatuses((prev) =>
      prev.map((s) => (s.id === editingId ? { ...s, name: editName.trim(), color: editColor } : s)),
    );
    handleCancelEdit();
  };

  const handleDelete = (id: string) => {
    setLocalStatuses((prev) => prev.filter((s) => s.id !== id));
    setDeletedIds((prev) => [...prev, id]);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      await createStatus({ name: newName.trim(), color: newColor });
      setNewName("");
      setNewColor("neutral");
    } catch (error) {
      toast.error(getErrorMessage(error, "추가에 실패했습니다."));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localStatuses.findIndex((s) => s.id === active.id);
      const newIndex = localStatuses.findIndex((s) => s.id === over.id);

      const newList = [...localStatuses];
      const [removed] = newList.splice(oldIndex, 1);
      newList.splice(newIndex, 0, removed);

      setLocalStatuses(newList);
    }
  };

  const hasOrderChanged = localStatuses.some((s, i) => s.id !== statuses[i]?.id);
  const hasUpdates = localStatuses.some((local) => {
    const original = statuses.find((s) => s.id === local.id);
    return original && (original.name !== local.name || original.color !== local.color);
  });
  const hasDeletes = deletedIds.length > 0;
  const hasChanges = hasOrderChanged || hasUpdates || hasDeletes;

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // 1. 삭제 처리
      for (const id of deletedIds) {
        await deleteStatus(id);
      }

      // 2. 수정 처리
      for (const local of localStatuses) {
        const original = statuses.find((s) => s.id === local.id);
        if (original && (original.name !== local.name || original.color !== local.color)) {
          await updateStatus({ id: local.id, name: local.name, color: local.color });
        }
      }

      // 3. 순서 변경 처리
      if (hasOrderChanged) {
        await reorderStatuses(localStatuses.map((s) => s.id));
      }

      setDeletedIds([]);
      toast.success("관리 상태가 저장되었습니다.");
      setShowModal(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "저장에 실패했습니다."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      onSubmit={handleSaveAll}
      title="관리 상태 설정"
      subtitle="관리 상태 목록을 추가, 수정, 삭제하고 순서를 변경할 수 있습니다"
      footer={
        <div className="flex w-full gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={isBusy} className="flex-1">
            닫기
          </Button>
          <Button onClick={handleSaveAll} disabled={isBusy || !hasChanges} isLoading={isSaving} className="flex-1">
            저장
          </Button>
        </div>
      }>
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="text-muted-foreground">로딩 중...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-muted-foreground text-sm">새 상태 추가</span>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                size="md"
                placeholder="상태 이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isBusy}
                className="flex-1"
              />
              <Select
                size="md"
                value={newColor}
                onValueChange={(value) => setNewColor(value as StatusColor)}
                disabled={isBusy}
                options={COLOR_OPTIONS}
                className="w-36"
              />
              <Button onClick={handleCreate} disabled={isBusy || !newName.trim()} isLoading={isCreating}>
                추가
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-semibold text-muted-foreground text-sm">상태 목록</span>
            <div className="max-h-80 overflow-y-auto rounded-md border border-border">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={localStatuses.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {localStatuses.map((status, index) => (
                    <SortableItem
                      key={status.id}
                      status={status}
                      index={index}
                      editingId={editingId}
                      editName={editName}
                      editColor={editColor}
                      isBusy={isBusy}
                      onStartEdit={handleStartEdit}
                      onCancelEdit={handleCancelEdit}
                      onConfirmEdit={handleConfirmEdit}
                      onDelete={handleDelete}
                      onEditNameChange={setEditName}
                      onEditColorChange={setEditColor}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {localStatuses.length === 0 && (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  등록된 관리 상태가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
