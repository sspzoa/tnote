import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowAbsent } from "@/shared/lib/workflow";

const useWorkflowAbsent = createWorkflowAbsent({
  baseEndpoint: "/api/retakes",
  invalidateKeys: [
    QUERY_KEYS.retakes.all,
    QUERY_KEYS.retakes.historyAll,
    QUERY_KEYS.calendar.all,
    ["students", "detail"],
  ],
});

export const useRetakeAbsent = () => {
  const { mutate, isPending } = useWorkflowAbsent();
  return {
    markAbsent: ({ retakeId, data }: { retakeId: string; data: { note?: string | null } }) =>
      mutate({ id: retakeId, data }),
    isMarkingAbsent: isPending,
  };
};
