"use client";

import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { useToast } from "@/shared/hooks/useToast";
import { getErrorMessage } from "@/shared/lib/utils/error";
import type { Retake } from "@/shared/types";
import { editDateAtom, postponeDateAtom, postponeNoteAtom } from "../(atoms)/useFormStore";
import {
  selectedStudentIdAtom,
  showAbsentModalAtom,
  showAssignModalAtom,
  showCompleteModalAtom,
  showEditDateModalAtom,
  showHistoryModalAtom,
  showManagementStatusModalAtom,
  showPostponeModalAtom,
  showStudentModalAtom,
} from "../(atoms)/useModalStore";
import { openMenuIdAtom, selectedRetakeAtom } from "../(atoms)/useRetakesStore";
import { useRetakeDelete } from "./useRetakeDelete";

export const useRetakeHandlers = (refetch: () => void) => {
  const setSelectedRetake = useSetAtom(selectedRetakeAtom);
  const setOpenMenuId = useSetAtom(openMenuIdAtom);
  const setShowPostponeModal = useSetAtom(showPostponeModalAtom);
  const setShowAbsentModal = useSetAtom(showAbsentModalAtom);
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
  const confirm = useConfirm();

  const { deleteRetake } = useRetakeDelete();

  const handlePostpone = useCallback(
    (retake: Retake) => {
      setSelectedRetake(retake);
      setPostponeDate("");
      setPostponeNote("");
      setShowPostponeModal(true);
      setOpenMenuId(null);
    },
    [setSelectedRetake, setPostponeDate, setPostponeNote, setShowPostponeModal, setOpenMenuId],
  );

  const handleAbsent = useCallback(
    (retake: Retake) => {
      setSelectedRetake(retake);
      setShowAbsentModal(true);
      setOpenMenuId(null);
    },
    [setSelectedRetake, setShowAbsentModal, setOpenMenuId],
  );

  const handleComplete = useCallback(
    (retake: Retake) => {
      setSelectedRetake(retake);
      setShowCompleteModal(true);
      setOpenMenuId(null);
    },
    [setSelectedRetake, setShowCompleteModal, setOpenMenuId],
  );

  const handleViewHistory = useCallback(
    (retake: Retake) => {
      setSelectedRetake(retake);
      setShowHistoryModal(true);
      setOpenMenuId(null);
    },
    [setSelectedRetake, setShowHistoryModal, setOpenMenuId],
  );

  const handleDelete = useCallback(
    async (retake: Retake) => {
      setOpenMenuId(null);
      const ok = await confirm({
        title: "재시험 삭제",
        message: `${retake.student.name} 학생의 ${retake.exam.course.name} 재시험 항목을 삭제하시겠습니까?`,
        variant: "danger",
        confirmLabel: "삭제",
      });
      if (!ok) return;

      try {
        await deleteRetake(retake.id);
        toast.success("재시험이 삭제되었습니다.");
      } catch (err) {
        toast.error(getErrorMessage(err, "재시험 삭제에 실패했습니다."));
      }
    },
    [deleteRetake, setOpenMenuId, toast, confirm],
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
    (retake: Retake) => {
      setSelectedRetake(retake);
      setShowManagementStatusModal(true);
      setOpenMenuId(null);
    },
    [setSelectedRetake, setShowManagementStatusModal, setOpenMenuId],
  );

  const handleEditDate = useCallback(
    (retake: Retake) => {
      setSelectedRetake(retake);
      setEditDate("");
      setShowEditDateModal(true);
      setOpenMenuId(null);
    },
    [setSelectedRetake, setEditDate, setShowEditDateModal, setOpenMenuId],
  );

  const handleActionSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    handlePostpone,
    handleAbsent,
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
