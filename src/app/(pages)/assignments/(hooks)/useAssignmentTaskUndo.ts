import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowUndo } from "@/shared/lib/workflow";

const useWorkflowUndo = createWorkflowUndo({
  baseEndpoint: "/api/assignment-tasks",
  invalidateKeys: [
    QUERY_KEYS.assignmentTasks.all,
    QUERY_KEYS.assignmentTasks.historyAll,
    QUERY_KEYS.calendar.all,
    QUERY_KEYS.home.stats,
    QUERY_KEYS.my.assignments,
    ["my", "calendarEvents"],
    ["students", "detail"],
  ],
});

export const useAssignmentTaskUndo = () => {
  const { mutate, isPending } = useWorkflowUndo();
  return {
    undoAction: ({ taskId, historyId }: { taskId: string; historyId: string }) => mutate({ id: taskId, historyId }),
    isUndoing: isPending,
  };
};
