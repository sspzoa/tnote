import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowList } from "@/shared/lib/workflow";
import type { AssignmentTask } from "../(atoms)/useAssignmentTaskStore";

const useWorkflowList = createWorkflowList<AssignmentTask>({
  baseEndpoint: "/api/assignment-tasks",
  queryKeyFn: QUERY_KEYS.assignmentTasks.byFilter,
  errorMessage: "과제 목록을 불러오는데 실패했습니다.",
});

export const useAssignmentTasks = () => {
  // Always fetch all; filtering is done client-side to support the
  // 검사예정/결석/미흡/미제출/완료 status model.
  const { data, isLoading, error, refetch } = useWorkflowList("all");
  return { tasks: data, isLoading, error, refetch };
};
