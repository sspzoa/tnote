"use client";

import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import type { AssignmentTask } from "@/shared/types";
import { openMenuIdAtom, selectedTaskAtom } from "../(atoms)/useAssignmentTaskStore";
import { editDateAtom, postponeDateAtom, postponeNoteAtom } from "../(atoms)/useFormStore";
import {
  selectedStudentIdAtom,
  showAssignModalAtom,
  showCompleteModalAtom,
  showEditDateModalAtom,
  showHistoryModalAtom,
  showPostponeModalAtom,
  showStudentModalAtom,
} from "../(atoms)/useModalStore";
import { useAssignmentTaskDelete } from "./useAssignmentTaskDelete";
import { useAssignmentTaskSetStatus } from "./useAssignmentTaskSetStatus";

export const useAssignmentTaskHandlers = (refetch: () => void) => {
  const setSelectedTask = useSetAtom(selectedTaskAtom);
  const setOpenMenuId = useSetAtom(openMenuIdAtom);
  const setShowPostponeModal = useSetAtom(showPostponeModalAtom);
  const setShowCompleteModal = useSetAtom(showCompleteModalAtom);
  const setShowHistoryModal = useSetAtom(showHistoryModalAtom);
  const setShowAssignModal = useSetAtom(showAssignModalAtom);
  const setShowStudentModal = useSetAtom(showStudentModalAtom);
  const setShowEditDateModal = useSetAtom(showEditDateModalAtom);
  const setSelectedStudentId = useSetAtom(selectedStudentIdAtom);
  const setPostponeDate = useSetAtom(postponeDateAtom);
  const setPostponeNote = useSetAtom(postponeNoteAtom);
  const setEditDate = useSetAtom(editDateAtom);
  const toast = useToast();
  const confirm = useConfirm();

  const { deleteTask } = useAssignmentTaskDelete();
  const { setStatus } = useAssignmentTaskSetStatus();

  const handlePostpone = useCallback(
    (task: AssignmentTask) => {
      setSelectedTask(task);
      setPostponeDate("");
      setPostponeNote("");
      setShowPostponeModal(true);
      setOpenMenuId(null);
    },
    [setSelectedTask, setPostponeDate, setPostponeNote, setShowPostponeModal, setOpenMenuId],
  );

  const handleComplete = useCallback(
    (task: AssignmentTask) => {
      setSelectedTask(task);
      setShowCompleteModal(true);
      setOpenMenuId(null);
    },
    [setSelectedTask, setShowCompleteModal, setOpenMenuId],
  );

  const handleMarkInsufficient = useCallback(
    async (task: AssignmentTask) => {
      setOpenMenuId(null);
      const ok = await confirm({
        title: "미흡 처리",
        message: `${task.student.name} 학생의 ${task.assignment.name} 과제를 '미흡'으로 처리하시겠습니까?`,
      });
      if (!ok) return;
      try {
        await setStatus({ taskId: task.id, endpoint: "insufficient" });
        toast.success("미흡 처리되었습니다.");
        refetch();
      } catch (err) {
        toast.error(getErrorMessage(err, "미흡 처리에 실패했습니다."));
      }
    },
    [setStatus, setOpenMenuId, toast, refetch, confirm],
  );

  const handleMarkNotSubmitted = useCallback(
    async (task: AssignmentTask) => {
      setOpenMenuId(null);
      const ok = await confirm({
        title: "미제출 처리",
        message: `${task.student.name} 학생의 ${task.assignment.name} 과제를 '미제출'로 처리하시겠습니까?`,
      });
      if (!ok) return;
      try {
        await setStatus({ taskId: task.id, endpoint: "not-submitted" });
        toast.success("미제출 처리되었습니다.");
        refetch();
      } catch (err) {
        toast.error(getErrorMessage(err, "미제출 처리에 실패했습니다."));
      }
    },
    [setStatus, setOpenMenuId, toast, refetch, confirm],
  );

  const handleMarkAbsent = useCallback(
    async (task: AssignmentTask) => {
      setOpenMenuId(null);
      const ok = await confirm({
        title: "결석 처리",
        message: `${task.student.name} 학생의 ${task.assignment.name} 과제를 '결석'으로 처리하시겠습니까?`,
      });
      if (!ok) return;
      try {
        await setStatus({ taskId: task.id, endpoint: "absent" });
        toast.success("결석 처리되었습니다.");
        refetch();
      } catch (err) {
        toast.error(getErrorMessage(err, "결석 처리에 실패했습니다."));
      }
    },
    [setStatus, setOpenMenuId, toast, refetch, confirm],
  );

  const handleViewHistory = useCallback(
    (task: AssignmentTask) => {
      setSelectedTask(task);
      setShowHistoryModal(true);
      setOpenMenuId(null);
    },
    [setSelectedTask, setShowHistoryModal, setOpenMenuId],
  );

  const handleDelete = useCallback(
    async (task: AssignmentTask) => {
      setOpenMenuId(null);
      const ok = await confirm({
        title: "과제 삭제",
        message: `${task.student.name} 학생의 ${task.assignment.course.name} - ${task.assignment.name} 과제를 삭제하시겠습니까?`,
        variant: "danger",
        confirmLabel: "삭제",
      });
      if (!ok) return;

      try {
        await deleteTask(task.id);
        toast.success("과제가 삭제되었습니다.");
      } catch (err) {
        toast.error(getErrorMessage(err, "과제 삭제에 실패했습니다."));
      }
    },
    [deleteTask, setOpenMenuId, toast, confirm],
  );

  const handleViewStudent = useCallback(
    (studentId: string) => {
      setSelectedStudentId(studentId);
      setShowStudentModal(true);
    },
    [setSelectedStudentId, setShowStudentModal],
  );

  const handleAssignClick = useCallback(() => {
    setShowAssignModal(true);
  }, [setShowAssignModal]);

  const handleEditDate = useCallback(
    (task: AssignmentTask) => {
      setSelectedTask(task);
      setEditDate("");
      setShowEditDateModal(true);
      setOpenMenuId(null);
    },
    [setSelectedTask, setEditDate, setShowEditDateModal, setOpenMenuId],
  );

  const handleActionSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    handlePostpone,
    handleComplete,
    handleMarkInsufficient,
    handleMarkNotSubmitted,
    handleMarkAbsent,
    handleViewHistory,
    handleDelete,
    handleViewStudent,
    handleAssignClick,
    handleEditDate,
    handleActionSuccess,
  };
};
