import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowPostpone } from "@/shared/lib/workflow";

const useWorkflowPostpone = createWorkflowPostpone({
  baseEndpoint: "/api/retakes",
  invalidateKeys: [
    QUERY_KEYS.retakes.all,
    QUERY_KEYS.retakes.historyAll,
    QUERY_KEYS.calendar.all,
    ["students", "detail"],
  ],
});

export const useRetakePostpone = () => {
  const { mutate, isPending } = useWorkflowPostpone();
  return {
    postponeRetake: ({ retakeId, data }: { retakeId: string; data: { newDate: string; note?: string | null } }) =>
      mutate({ id: retakeId, data }),
    isPostponing: isPending,
  };
};
