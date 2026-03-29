"use client";

import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useToast } from "@/shared/hooks/useToast";
import type { AssignmentTask } from "@/shared/types";
import { openMenuIdAtom, selectedTaskAtom } from "../(atoms)/useAssignmentTaskStore";
import { editDateAtom, postponeDateAtom, postponeNoteAtom } from "../(atoms)/useFormStore";
import {
  selectedStudentIdAtom,
  showAssignModalAtom,
  showCompleteModalAtom,
  showEditDateModalAtom,
  showHistoryModalAtom,
  showManagementStatusModalAtom,
  showPostponeModalAtom,
  showStudentModalAtom,
} from "../(atoms)/useModalStore";
import { useAssignmentTaskDelete } from "./useAssignmentTaskDelete";

export const useAssignmentTaskHandlers = (refetch: () => void) => {
  const setSelectedTask = useSetAtom(selectedTaskAtom);
  const setOpenMenuId = useSetAtom(openMenuIdAtom);
  const setShowPostponeModal = useSetAtom(showPostponeModalAtom);
  const setShowCompleteModal = useSetAtom(showCompleteModalAtom);
  const setShowHistoryModal = useSetAtom(showHistoryModalAtom);
  const setShowAssignModal = useSetAtom(showAssignModalAtom);
  const setShowStudentModal = useSetAtom(showStudentModalAtom);
  const setShowManagementStatusModal = useSetAtom(showManagementStatusModalAtom);
  const setShowEditDateModal = useSetAtom(showEditDateModalAtom);
  const setSelectedStudentId = useSetAtom(selectedStudentIdAtom);
  const setPostponeDate = useSetAtom(postponeDateAtom);
  const setPostponeNote = useSetAtom(postponeNoteAtom);
  const setEditDate = useSetAtom(editDateAtom);
  const toast = useToast();

  const { deleteTask } = useAssignmentTaskDelete();

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
      if (
        !confirm(
          `${task.student.name} 학생의 ${task.assignment.course.name} - ${task.assignment.name} 과제를 삭제하시겠습니까?`,
        )
      ) {
        return;
      }

      try {
        await deleteTask(task.id);
        toast.success("과제가 삭제되었습니다.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "과제 삭제에 실패했습니다.");
      }
    },
    [deleteTask, setOpenMenuId, toast],
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

  const handleManagementStatusChange = useCallback(
    (task: AssignmentTask) => {
      setSelectedTask(task);
      setShowManagementStatusModal(true);
      setOpenMenuId(null);
    },
    [setSelectedTask, setShowManagementStatusModal, setOpenMenuId],
  );

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
    handleViewHistory,
    handleDelete,
    handleViewStudent,
    handleAssignClick,
    handleManagementStatusChange,
    handleEditDate,
    handleActionSuccess,
  };
};
