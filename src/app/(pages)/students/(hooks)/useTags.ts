import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { StudentTag, StudentTagAssignment, TagColor } from "@/shared/types";

interface TagAssignmentWithStudent extends Omit<StudentTagAssignment, "tag"> {
  student: {
    id: string;
    name: string;
    phone_number: string;
    school: string | null;
  };
}

interface TagWithAssignments {
  tag: StudentTag;
  assignments: TagAssignmentWithStudent[];
}

export const useTags = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.tags.all,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/tags");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.data as StudentTag[];
    },
  });

  return {
    tags: data || [],
    isLoading,
    error,
  };
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: TagColor }) => {
      const response = await fetchWithAuth("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.data as StudentTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags.all });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name?: string; color?: TagColor }) => {
      const response = await fetchWithAuth(`/api/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.data as StudentTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithAuth(`/api/tags/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students.all });
    },
  });
};

export const useTagAssignments = (tagId: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.tags.detail(tagId || ""),
    queryFn: async () => {
      if (!tagId) return null;
      const response = await fetchWithAuth(`/api/tags/${tagId}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.data as TagWithAssignments;
    },
    enabled: !!tagId,
  });

  return {
    tagData: data,
    isLoading,
    error,
    refetch,
  };
};
