import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowManagementStatus } from "@/shared/lib/workflow";

const useWorkflowManagementStatus = createWorkflowManagementStatus({
  baseEndpoint: "/api/assignment-tasks",
  invalidateKeys: [QUERY_KEYS.assignmentTasks.all, QUERY_KEYS.assignmentTasks.historyAll, ["students", "detail"]],
});

export const useAssignmentTaskManagementStatus = () => {
  const { mutate, isPending } = useWorkflowManagementStatus();
  return {
    updateManagementStatus: ({ taskId, status }: { taskId: string; status: string }) => mutate({ id: taskId, status }),
    isUpdating: isPending,
  };
};
