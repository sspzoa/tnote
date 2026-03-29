import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowManagementStatus } from "@/shared/lib/workflow";

const useWorkflowManagementStatus = createWorkflowManagementStatus({
  baseEndpoint: "/api/retakes",
  invalidateKeys: [QUERY_KEYS.retakes.all, QUERY_KEYS.retakes.historyAll, ["students", "detail"]],
});

export const useRetakeManagementStatus = () => {
  const { mutate, isPending } = useWorkflowManagementStatus();
  return {
    updateManagementStatus: ({ retakeId, status }: { retakeId: string; status: string }) =>
      mutate({ id: retakeId, status }),
    isUpdating: isPending,
  };
};
