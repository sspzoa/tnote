"use client";

import { useAtomValue } from "jotai";
import { useMemo } from "react";
import {
  filterAtom,
  minAbsentCountAtom,
  minIncompleteCountAtom,
  minPostponeAbsentCountAtom,
  minPostponeCountAtom,
  minTotalRetakeCountAtom,
  searchQueryAtom,
  selectedCourseAtom,
  selectedDateAtom,
  selectedExamAtom,
  selectedManagementStatusAtom,
  showCompletedAtom,
} from "../(atoms)/useRetakesStore";
import { useRetakes } from "./useRetakes";

export const useRetakeFilters = () => {
  const filter = useAtomValue(filterAtom);
  const selectedCourse = useAtomValue(selectedCourseAtom);
  const selectedExam = useAtomValue(selectedExamAtom);
  const selectedManagementStatus = useAtomValue(selectedManagementStatusAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const showCompleted = useAtomValue(showCompletedAtom);
  const selectedDate = useAtomValue(selectedDateAtom);
  const minIncompleteCount = useAtomValue(minIncompleteCountAtom);
  const minTotalRetakeCount = useAtomValue(minTotalRetakeCountAtom);
  const minPostponeCount = useAtomValue(minPostponeCountAtom);
  const minAbsentCount = useAtomValue(minAbsentCountAtom);
  const minPostponeAbsentCount = useAtomValue(minPostponeAbsentCountAtom);

  const { retakes: fetchedRetakes, isLoading, error, refetch } = useRetakes(filter);

  const incompleteCountByStudent = useMemo(
    () =>
      fetchedRetakes.reduce(
        (acc, retake) => {
          if (retake.status !== "completed") {
            acc[retake.student.id] = (acc[retake.student.id] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedRetakes],
  );

  const totalRetakeCountByStudent = useMemo(
    () =>
      fetchedRetakes.reduce(
        (acc, retake) => {
          acc[retake.student.id] = (acc[retake.student.id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedRetakes],
  );

  const postponeCountByStudent = useMemo(
    () =>
      fetchedRetakes.reduce(
        (acc, retake) => {
          acc[retake.student.id] = (acc[retake.student.id] || 0) + retake.postpone_count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedRetakes],
  );

  const absentCountByStudent = useMemo(
    () =>
      fetchedRetakes.reduce(
        (acc, retake) => {
          acc[retake.student.id] = (acc[retake.student.id] || 0) + retake.absent_count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedRetakes],
  );

  const postponeAbsentCountByStudent = useMemo(
    () =>
      fetchedRetakes.reduce(
        (acc, retake) => {
          acc[retake.student.id] = (acc[retake.student.id] || 0) + retake.postpone_count + retake.absent_count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedRetakes],
  );

  const filteredRetakes = useMemo(
    () =>
      fetchedRetakes
        .filter((retake) => showCompleted || retake.status !== "completed")
        .filter((retake) => selectedCourse === "all" || retake.exam.course.id === selectedCourse)
        .filter((retake) => selectedExam === "all" || retake.exam.id === selectedExam)
        .filter((retake) => selectedManagementStatus === "all" || retake.management_status === selectedManagementStatus)
        .filter((retake) => selectedDate === "all" || retake.current_scheduled_date === selectedDate)
        .filter((retake) => retake.student.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(
          (retake) =>
            minIncompleteCount === 0 || (incompleteCountByStudent[retake.student.id] || 0) >= minIncompleteCount,
        )
        .filter(
          (retake) =>
            minTotalRetakeCount === 0 || (totalRetakeCountByStudent[retake.student.id] || 0) >= minTotalRetakeCount,
        )
        .filter(
          (retake) => minPostponeCount === 0 || (postponeCountByStudent[retake.student.id] || 0) >= minPostponeCount,
        )
        .filter((retake) => minAbsentCount === 0 || (absentCountByStudent[retake.student.id] || 0) >= minAbsentCount)
        .filter(
          (retake) =>
            minPostponeAbsentCount === 0 ||
            (postponeAbsentCountByStudent[retake.student.id] || 0) >= minPostponeAbsentCount,
        )
        .sort((a, b) => {
          if (
            minIncompleteCount > 0 ||
            minTotalRetakeCount > 0 ||
            minPostponeCount > 0 ||
            minAbsentCount > 0 ||
            minPostponeAbsentCount > 0
          ) {
            const nameCompare = a.student.name.localeCompare(b.student.name, "ko");
            if (nameCompare !== 0) return nameCompare;
            const dateA = a.current_scheduled_date || "";
            const dateB = b.current_scheduled_date || "";
            return dateA.localeCompare(dateB);
          }
          const dateA = a.current_scheduled_date || "";
          const dateB = b.current_scheduled_date || "";
          return dateA.localeCompare(dateB);
        }),
    [
      fetchedRetakes,
      showCompleted,
      selectedCourse,
      selectedExam,
      selectedManagementStatus,
      selectedDate,
      searchQuery,
      minIncompleteCount,
      minTotalRetakeCount,
      minPostponeCount,
      minAbsentCount,
      minPostponeAbsentCount,
      incompleteCountByStudent,
      totalRetakeCountByStudent,
      postponeCountByStudent,
      absentCountByStudent,
      postponeAbsentCountByStudent,
    ],
  );

  return {
    fetchedRetakes,
    filteredRetakes,
    isLoading,
    error,
    refetch,
  };
};
