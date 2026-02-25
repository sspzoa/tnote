import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface SolapiSettingsData {
  apiKey: string | null;
  apiSecret: string | null;
  isConfigured: boolean;
}

interface UpdateSolapiParams {
  apiKey?: string | null;
  apiSecret?: string | null;
}

export const useSolapiSettings = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.messages.solapiSettings,
    queryFn: async () => {
      const res = await fetchWithAuth("/api/settings/solapi");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as SolapiSettingsData;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: UpdateSolapiParams) => {
      const res = await fetchWithAuth("/api/settings/solapi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as SolapiSettingsData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages.solapiSettings });
    },
  });

  return {
    apiKey: data?.apiKey ?? null,
    apiSecret: data?.apiSecret ?? null,
    isConfigured: data?.isConfigured ?? false,
    isLoading,
    error,
    updateSolapiSettings: updateMutation.mutate,
    updateSolapiSettingsAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};
