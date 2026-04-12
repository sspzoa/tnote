import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowAllHistory } from "@/shared/lib/workflow";
import type { AssignmentTaskHistory } from "@/shared/types";

export interface AssignmentTaskHistoryItem extends AssignmentTaskHistory {
  task: {
    id: string;
    student: { id: string; name: string };
    assignment: {
      id: string;
      name: string;
      course: { id: string; name: string };
    };
  };
}

const useWorkflowAllHistory = createWorkflowAllHistory<AssignmentTaskHistoryItem>({
  baseEndpoint: "/api/assignment-tasks",
  historyAllQueryKey: QUERY_KEYS.assignmentTasks.historyAll,
});

export const useAllAssignmentTaskHistory = () => {
  return useWorkflowAllHistory();
};
