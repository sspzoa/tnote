import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import type { WorkflowMutationConfig, WorkflowNoteData, WorkflowPostponeData } from "./types";

const invalidateAll = (
  queryClient: ReturnType<typeof useQueryClient>,
  keys: WorkflowMutationConfig["invalidateKeys"],
) => {
  for (const key of keys) {
    queryClient.invalidateQueries({ queryKey: key });
  }
};

export const createWorkflowComplete = (config: WorkflowMutationConfig) => {
  return () => {
    const queryClient = useQueryClient();
    const { mutateAsync, isPending } = useMutation({
      mutationFn: async ({ id, data }: { id: string; data: WorkflowNoteData }) => {
        const response = await fetchWithAuth(`${config.baseEndpoint}/${id}/complete`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "요청에 실패했습니다.");
        return result.data;
      },
      onSuccess: () => invalidateAll(queryClient, config.invalidateKeys),
    });
    return { mutate: mutateAsync, isPending };
  };
};

export const createWorkflowPostpone = (config: WorkflowMutationConfig) => {
  return () => {
    const queryClient = useQueryClient();
    const { mutateAsync, isPending } = useMutation({
      mutationFn: async ({ id, data }: { id: string; data: WorkflowPostponeData }) => {
        const response = await fetchWithAuth(`${config.baseEndpoint}/${id}/postpone`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "요청에 실패했습니다.");
        return result.data;
      },
      onSuccess: () => invalidateAll(queryClient, config.invalidateKeys),
    });
    return { mutate: mutateAsync, isPending };
  };
};

export const createWorkflowAbsent = (config: WorkflowMutationConfig) => {
  return () => {
    const queryClient = useQueryClient();
    const { mutateAsync, isPending } = useMutation({
      mutationFn: async ({ id, data }: { id: string; data: WorkflowNoteData }) => {
        const response = await fetchWithAuth(`${config.baseEndpoint}/${id}/absent`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "요청에 실패했습니다.");
        return result.data;
      },
      onSuccess: () => invalidateAll(queryClient, config.invalidateKeys),
    });
    return { mutate: mutateAsync, isPending };
  };
};

export const createWorkflowDelete = (config: WorkflowMutationConfig) => {
  return () => {
    const queryClient = useQueryClient();
    const { mutateAsync, isPending } = useMutation({
      mutationFn: async (id: string) => {
        const response = await fetchWithAuth(`${config.baseEndpoint}/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "삭제에 실패했습니다.");
        }
        return true;
      },
      onSuccess: () => invalidateAll(queryClient, config.invalidateKeys),
    });
    return { mutate: mutateAsync, isPending };
  };
};

export const createWorkflowEditDate = (config: WorkflowMutationConfig) => {
  return () => {
    const queryClient = useQueryClient();
    const { mutateAsync, isPending } = useMutation({
      mutationFn: async ({ id, newDate }: { id: string; newDate: string }) => {
        const response = await fetchWithAuth(`${config.baseEndpoint}/${id}/edit-date`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newDate }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "요청에 실패했습니다.");
        return result.data;
      },
      onSuccess: () => invalidateAll(queryClient, config.invalidateKeys),
    });
    return { mutate: mutateAsync, isPending };
  };
};

export const createWorkflowManagementStatus = (config: WorkflowMutationConfig) => {
  return () => {
    const queryClient = useQueryClient();
    const { mutateAsync, isPending } = useMutation({
      mutationFn: async ({ id, status }: { id: string; status: string }) => {
        const response = await fetchWithAuth(`${config.baseEndpoint}/${id}/management-status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ management_status: status }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "관리 상태 변경에 실패했습니다.");
        return result.data;
      },
      onSuccess: () => invalidateAll(queryClient, config.invalidateKeys),
    });
    return { mutate: mutateAsync, isPending };
  };
};

export const createWorkflowUndo = (config: WorkflowMutationConfig) => {
  return () => {
    const queryClient = useQueryClient();
    const { mutateAsync, isPending } = useMutation({
      mutationFn: async ({ id, historyId }: { id: string; historyId: string }) => {
        const response = await fetchWithAuth(`${config.baseEndpoint}/${id}/history/${historyId}/undo`, {
          method: "POST",
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "되돌리기에 실패했습니다.");
        return result;
      },
      onSuccess: () => invalidateAll(queryClient, config.invalidateKeys),
    });
    return { mutate: mutateAsync, isPending };
  };
};
