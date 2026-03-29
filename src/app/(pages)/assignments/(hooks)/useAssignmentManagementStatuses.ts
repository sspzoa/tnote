import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { ManagementStatusItem, StatusColor } from "@/shared/types";

const QUERY_KEY = ["management-statuses", "assignment"] as const;

export const useAssignmentManagementStatuses = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/management-statuses?category=assignment");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "관리 상태 목록을 불러오는데 실패했습니다.");
      }

      return result.data as ManagementStatusItem[];
    },
  });

  return {
    statuses: data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useAssignmentManagementStatusCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: StatusColor }) => {
      const response = await fetchWithAuth("/api/management-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, category: "assignment" }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "관리 상태 생성에 실패했습니다.");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAssignmentManagementStatusUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name?: string; color?: StatusColor }) => {
      const response = await fetchWithAuth(`/api/management-statuses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "관리 상태 수정에 실패했습니다.");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAssignmentManagementStatusDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithAuth(`/api/management-statuses/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "관리 상태 삭제에 실패했습니다.");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAssignmentManagementStatusReorder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const response = await fetchWithAuth("/api/management-statuses/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "순서 변경에 실패했습니다.");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
