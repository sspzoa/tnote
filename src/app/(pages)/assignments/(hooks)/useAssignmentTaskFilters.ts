"use client";

import { useAtomValue } from "jotai";
import { useMemo } from "react";
import {
  filterAtom,
  minAbsentCountAtom,
  minIncompleteCountAtom,
  minPostponeAbsentCountAtom,
  minPostponeCountAtom,
  minTotalCountAtom,
  searchQueryAtom,
  selectedAssignmentIdAtom,
  selectedCourseAtom,
  selectedDateAtom,
  selectedManagementStatusAtom,
  showCompletedAtom,
} from "../(atoms)/useAssignmentTaskStore";
import { useAssignmentTasks } from "./useAssignmentTasks";

export const useAssignmentTaskFilters = () => {
  const filter = useAtomValue(filterAtom);
  const selectedCourse = useAtomValue(selectedCourseAtom);
  const selectedAssignmentId = useAtomValue(selectedAssignmentIdAtom);
  const selectedManagementStatus = useAtomValue(selectedManagementStatusAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const showCompleted = useAtomValue(showCompletedAtom);
  const selectedDate = useAtomValue(selectedDateAtom);
  const minIncompleteCount = useAtomValue(minIncompleteCountAtom);
  const minTotalCount = useAtomValue(minTotalCountAtom);
  const minPostponeCount = useAtomValue(minPostponeCountAtom);
  const minAbsentCount = useAtomValue(minAbsentCountAtom);
  const minPostponeAbsentCount = useAtomValue(minPostponeAbsentCountAtom);

  const { tasks: fetchedTasks, isLoading, error, refetch } = useAssignmentTasks();

  // States that are considered "done" and hidden from the default list
  const HIDDEN_STATUSES = ["completed", "insufficient", "not_submitted"] as const;
  const isHiddenStatus = (status: string) =>
    (HIDDEN_STATUSES as readonly string[]).includes(status);

  const incompleteCountByStudent = useMemo(
    () =>
      fetchedTasks.reduce(
        (acc, task) => {
          if (!isHiddenStatus(task.status)) {
            acc[task.student.id] = (acc[task.student.id] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedTasks],
  );

  const totalCountByStudent = useMemo(
    () =>
      fetchedTasks.reduce(
        (acc, task) => {
          acc[task.student.id] = (acc[task.student.id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedTasks],
  );

  const postponeCountByStudent = useMemo(
    () =>
      fetchedTasks.reduce(
        (acc, task) => {
          acc[task.student.id] = (acc[task.student.id] || 0) + task.postpone_count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedTasks],
  );

  const absentCountByStudent = useMemo(
    () =>
      fetchedTasks.reduce(
        (acc, task) => {
          acc[task.student.id] = (acc[task.student.id] || 0) + task.absent_count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedTasks],
  );

  const postponeAbsentCountByStudent = useMemo(
    () =>
      fetchedTasks.reduce(
        (acc, task) => {
          acc[task.student.id] = (acc[task.student.id] || 0) + task.postpone_count + task.absent_count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [fetchedTasks],
  );

  const filteredTasks = useMemo(
    () =>
      fetchedTasks
        .filter((task) => showCompleted || !isHiddenStatus(task.status))
        .filter((task) => filter === "all" || task.status === filter)
        .filter((task) => selectedCourse === "all" || task.assignment.course.id === selectedCourse)
        .filter((task) => selectedAssignmentId === "all" || task.assignment.id === selectedAssignmentId)
        .filter((task) => selectedManagementStatus === "all" || task.management_status === selectedManagementStatus)
        .filter((task) => selectedDate === "all" || task.current_scheduled_date === selectedDate)
        .filter((task) => task.student.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(
          (task) => minIncompleteCount === 0 || (incompleteCountByStudent[task.student.id] || 0) >= minIncompleteCount,
        )
        .filter((task) => minTotalCount === 0 || (totalCountByStudent[task.student.id] || 0) >= minTotalCount)
        .filter((task) => minPostponeCount === 0 || (postponeCountByStudent[task.student.id] || 0) >= minPostponeCount)
        .filter((task) => minAbsentCount === 0 || (absentCountByStudent[task.student.id] || 0) >= minAbsentCount)
        .filter(
          (task) =>
            minPostponeAbsentCount === 0 ||
            (postponeAbsentCountByStudent[task.student.id] || 0) >= minPostponeAbsentCount,
        ),
    [
      fetchedTasks,
      filter,
      showCompleted,
      selectedCourse,
      selectedAssignmentId,
      selectedManagementStatus,
      selectedDate,
      searchQuery,
      minIncompleteCount,
      minTotalCount,
      minPostponeCount,
      minAbsentCount,
      minPostponeAbsentCount,
      incompleteCountByStudent,
      totalCountByStudent,
      postponeCountByStudent,
      absentCountByStudent,
      postponeAbsentCountByStudent,
    ],
  );

  return {
    fetchedTasks,
    filteredTasks,
    isLoading,
    error,
    refetch,
  };
};
