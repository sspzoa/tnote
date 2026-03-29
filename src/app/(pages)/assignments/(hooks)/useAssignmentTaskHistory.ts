import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowHistory } from "@/shared/lib/workflow";
import type { RetakeHistory } from "@/shared/types";

const useWorkflowHistory = createWorkflowHistory<RetakeHistory>({
  baseEndpoint: "/api/assignment-tasks",
  historyQueryKeyFn: QUERY_KEYS.assignmentTasks.history,
  fallbackKey: ["assignment-task-history", null],
  errorMessage: "이력을 불러오는데 실패했습니다.",
});

export const useAssignmentTaskHistory = (taskId: string | null) => {
  return useWorkflowHistory(taskId);
};
