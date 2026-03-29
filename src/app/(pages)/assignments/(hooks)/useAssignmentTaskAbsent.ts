import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowAbsent } from "@/shared/lib/workflow";

const useWorkflowAbsent = createWorkflowAbsent({
  baseEndpoint: "/api/assignment-tasks",
  invalidateKeys: [
    QUERY_KEYS.assignmentTasks.all,
    QUERY_KEYS.assignmentTasks.historyAll,
    QUERY_KEYS.calendar.all,
    ["students", "detail"],
  ],
});

export const useAssignmentTaskAbsent = () => {
  const { mutate, isPending } = useWorkflowAbsent();
  return {
    markAbsent: ({ taskId, data }: { taskId: string; data: { note?: string | null } }) => mutate({ id: taskId, data }),
    isMarkingAbsent: isPending,
  };
};
