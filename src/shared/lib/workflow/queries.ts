import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { WorkflowAllHistoryConfig, WorkflowHistoryConfig, WorkflowListConfig } from "./types";

export const createWorkflowList = <TItem>(config: WorkflowListConfig) => {
  return (filter: "all" | "pending" | "completed" | "absent") => {
    const { data, isLoading, error, refetch } = useQuery({
      queryKey: config.queryKeyFn(filter),
      queryFn: async () => {
        const url = filter !== "all" ? `${config.baseEndpoint}?status=${filter}` : config.baseEndpoint;
        const response = await fetchWithAuth(url);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || config.errorMessage || "데이터를 불러오는데 실패했습니다.");
        return result.data as TItem[];
      },
    });
    return { data: data || [], isLoading, error, refetch };
  };
};

export const createWorkflowHistory = <TItem>(config: WorkflowHistoryConfig) => {
  return (id: string | null) => {
    const { data, isLoading, error, refetch } = useQuery({
      queryKey: id ? config.historyQueryKeyFn(id) : config.fallbackKey,
      queryFn: async () => {
        if (!id) return [] as TItem[];
        const response = await fetchWithAuth(`${config.baseEndpoint}/${id}/history`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || config.errorMessage || "이력을 불러오는데 실패했습니다.");
        return result.data as TItem[];
      },
      enabled: !!id,
    });
    return { history: data || [], isLoading, error, refetch };
  };
};

export const createWorkflowAllHistory = <TItem>(config: WorkflowAllHistoryConfig) => {
  return () => {
    const { data, isLoading, error, refetch } = useQuery({
      queryKey: config.historyAllQueryKey,
      queryFn: async () => {
        const res = await fetchWithAuth(`${config.baseEndpoint}/history`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        return result.data as TItem[];
      },
    });
    return { history: data || [], isLoading, error, refetch };
  };
};
