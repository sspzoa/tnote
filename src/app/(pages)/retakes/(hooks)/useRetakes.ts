import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowList } from "@/shared/lib/workflow";
import type { Retake } from "../(atoms)/useRetakesStore";

const useWorkflowList = createWorkflowList<Retake>({
  baseEndpoint: "/api/retakes",
  queryKeyFn: QUERY_KEYS.retakes.byFilter,
  errorMessage: "재시험 목록을 불러오는데 실패했습니다.",
});

export const useRetakes = (filter: "all" | "pending" | "completed" | "absent") => {
  const { data, isLoading, error, refetch } = useWorkflowList(filter);
  return { retakes: data, isLoading, error, refetch };
};
