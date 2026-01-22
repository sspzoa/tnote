"use client";

import { useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  assignmentExamAtom,
  scoreExamAtom,
  selectedExamAtom,
  showAssignmentModalAtom,
  showCreateModalAtom,
  showEditModalAtom,
  showScoreModalAtom,
} from "../(atoms)/useExamStore";
import type { Exam } from "./useExams";

export const useCoursePageHandlers = () => {
  const setShowCreateModal = useSetAtom(showCreateModalAtom);
  const setShowEditModal = useSetAtom(showEditModalAtom);
  const setSelectedExam = useSetAtom(selectedExamAtom);
  const setShowScoreModal = useSetAtom(showScoreModalAtom);
  const setScoreExam = useSetAtom(scoreExamAtom);
  const setShowAssignmentModal = useSetAtom(showAssignmentModalAtom);
  const setAssignmentExam = useSetAtom(assignmentExamAtom);

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, [setShowCreateModal]);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, [setShowCreateModal]);

  const openEditModal = useCallback(
    (exam: Exam) => {
      setSelectedExam(exam);
      setShowEditModal(true);
    },
    [setSelectedExam, setShowEditModal],
  );

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedExam(null);
  }, [setShowEditModal, setSelectedExam]);

  const openScoreModal = useCallback(
    (exam: Exam) => {
      setScoreExam(exam);
      setShowScoreModal(true);
    },
    [setScoreExam, setShowScoreModal],
  );

  const closeScoreModal = useCallback(() => {
    setShowScoreModal(false);
    setScoreExam(null);
  }, [setShowScoreModal, setScoreExam]);

  const openAssignmentModal = useCallback(
    (exam: Exam) => {
      setAssignmentExam(exam);
      setShowAssignmentModal(true);
    },
    [setAssignmentExam, setShowAssignmentModal],
  );

  const closeAssignmentModal = useCallback(() => {
    setShowAssignmentModal(false);
    setAssignmentExam(null);
  }, [setShowAssignmentModal, setAssignmentExam]);

  return {
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openScoreModal,
    closeScoreModal,
    openAssignmentModal,
    closeAssignmentModal,
  };
};
