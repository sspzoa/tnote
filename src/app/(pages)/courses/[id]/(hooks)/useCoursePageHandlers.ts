"use client";

import { useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  scoreExamAtom,
  selectedExamAtom,
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

  return {
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openScoreModal,
    closeScoreModal,
  };
};
