import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowPostpone } from "@/shared/lib/workflow";

const useWorkflowPostpone = createWorkflowPostpone({
  baseEndpoint: "/api/assignment-tasks",
  invalidateKeys: [
    QUERY_KEYS.assignmentTasks.all,
    QUERY_KEYS.assignmentTasks.historyAll,
    QUERY_KEYS.calendar.all,
    ["students", "detail"],
  ],
});

export const useAssignmentTaskPostpone = () => {
  const { mutate, isPending } = useWorkflowPostpone();
  return {
    postponeTask: ({ taskId, data }: { taskId: string; data: { newDate: string; note?: string | null } }) =>
      mutate({ id: taskId, data }),
    isPostponing: isPending,
  };
};
