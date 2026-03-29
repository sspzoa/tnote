import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowEditDate } from "@/shared/lib/workflow";

const useWorkflowEditDate = createWorkflowEditDate({
  baseEndpoint: "/api/assignment-tasks",
  invalidateKeys: [
    QUERY_KEYS.assignmentTasks.all,
    QUERY_KEYS.assignmentTasks.historyAll,
    QUERY_KEYS.calendar.all,
    ["students", "detail"],
  ],
});

export const useAssignmentTaskEditDate = () => {
  const { mutate, isPending } = useWorkflowEditDate();
  return {
    editDate: ({ taskId, newDate }: { taskId: string; newDate: string }) => mutate({ id: taskId, newDate }),
    isEditing: isPending,
  };
};
