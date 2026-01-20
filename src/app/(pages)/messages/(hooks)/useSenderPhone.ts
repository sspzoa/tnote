import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface SenderPhoneData {
  senderPhoneNumber: string | null;
}

export const useSenderPhone = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.messages.senderPhone,
    queryFn: async () => {
      const res = await fetchWithAuth("/api/settings/sender-phone");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as SenderPhoneData;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (senderPhoneNumber: string | null) => {
      const res = await fetchWithAuth("/api/settings/sender-phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderPhoneNumber }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as SenderPhoneData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages.senderPhone });
    },
  });

  return {
    senderPhoneNumber: data?.senderPhoneNumber ?? null,
    isLoading,
    error,
    updateSenderPhone: updateMutation.mutate,
    updateSenderPhoneAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};
