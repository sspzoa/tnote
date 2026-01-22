"use client";

import { useSetAtom } from "jotai";
import { useCallback } from "react";
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
      if (!confirm(`${retake.student.name} 학생의 ${retake.exam.course.name} 재시험을 삭제하시겠습니까?`)) {
        return;
      }

      try {
        await deleteRetake(retake.id);
        alert("재시험이 삭제되었습니다.");
      } catch (err) {
        alert(err instanceof Error ? err.message : "재시험 삭제에 실패했습니다.");
      }
    },
    [deleteRetake, setOpenMenuId],
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
