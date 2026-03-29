import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowComplete } from "@/shared/lib/workflow";

const useWorkflowComplete = createWorkflowComplete({
  baseEndpoint: "/api/assignment-tasks",
  invalidateKeys: [
    QUERY_KEYS.assignmentTasks.all,
    QUERY_KEYS.assignmentTasks.historyAll,
    QUERY_KEYS.calendar.all,
    QUERY_KEYS.home.stats,
    ["students", "detail"],
  ],
});

export const useAssignmentTaskComplete = () => {
  const { mutate, isPending } = useWorkflowComplete();
  return {
    completeTask: ({ taskId, data }: { taskId: string; data: { note?: string | null } }) =>
      mutate({ id: taskId, data }),
    isCompleting: isPending,
  };
};
