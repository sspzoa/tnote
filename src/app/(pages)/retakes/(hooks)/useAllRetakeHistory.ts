import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { createWorkflowAllHistory } from "@/shared/lib/workflow";

export interface RetakeHistoryItem {
  id: string;
  action_type: string;
  previous_date: string | null;
  new_date: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  note: string | null;
  created_at: string;
  performed_by: { id: string; name: string } | null;
  retake: {
    id: string;
    student: { id: string; name: string };
    exam: {
      id: string;
      name: string;
      exam_number: number;
      course: { id: string; name: string };
    };
  };
}

const useWorkflowAllHistory = createWorkflowAllHistory<RetakeHistoryItem>({
  baseEndpoint: "/api/retakes",
  historyAllQueryKey: QUERY_KEYS.retakes.historyAll,
});

export const useAllRetakeHistory = () => {
  return useWorkflowAllHistory();
};
