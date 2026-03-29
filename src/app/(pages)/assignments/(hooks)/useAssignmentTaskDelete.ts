import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowDelete } from "@/shared/lib/workflow";

const useWorkflowDelete = createWorkflowDelete({
  baseEndpoint: "/api/assignment-tasks",
  invalidateKeys: [
    QUERY_KEYS.assignmentTasks.all,
    QUERY_KEYS.assignmentTasks.historyAll,
    QUERY_KEYS.calendar.all,
    QUERY_KEYS.home.stats,
    ["students", "detail"],
  ],
});

export const useAssignmentTaskDelete = () => {
  const { mutate, isPending } = useWorkflowDelete();
  return { deleteTask: mutate, isDeleting: isPending };
};
