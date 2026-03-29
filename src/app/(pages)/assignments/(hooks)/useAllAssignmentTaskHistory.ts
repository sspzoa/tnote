import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowAllHistory } from "@/shared/lib/workflow";

export interface AssignmentTaskHistoryItem {
  id: string;
  action_type: string;
  previous_date: string | null;
  new_date: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  note: string | null;
  created_at: string;
  performed_by: { id: string; name: string } | null;
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
