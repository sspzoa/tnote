import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { StudentTagAssignment } from "@/shared/types";

export const useAssignTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      tagId,
      startDate,
      endDate,
    }: {
      studentId: string;
      tagId: string;
      startDate: string;
      endDate: string | null;
    }) => {
      const response = await fetchWithAuth(`/api/students/${studentId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, startDate, endDate }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.data as StudentTagAssignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
    },
  });
};

export const useRemoveTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, tagId }: { studentId: string; tagId: string }) => {
      const response = await fetchWithAuth(`/api/students/${studentId}/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
    },
  });
};

export const useUpdateTagAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      tagId,
      startDate,
      endDate,
    }: {
      studentId: string;
      tagId: string;
      startDate: string;
      endDate: string | null;
    }) => {
      const response = await fetchWithAuth(`/api/students/${studentId}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, startDate, endDate }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.data as StudentTagAssignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
    },
  });
};
