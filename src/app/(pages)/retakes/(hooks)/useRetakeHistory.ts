import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowHistory } from "@/shared/lib/workflow";
import type { History } from "../(atoms)/useRetakesStore";

const useWorkflowHistory = createWorkflowHistory<History>({
  baseEndpoint: "/api/retakes",
  historyQueryKeyFn: QUERY_KEYS.retakes.history,
  fallbackKey: ["retake-history", null],
  errorMessage: "히스토리를 불러오는데 실패했습니다.",
});

export const useRetakeHistory = (retakeId: string | null) => {
  return useWorkflowHistory(retakeId);
};
