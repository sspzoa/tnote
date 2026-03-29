import { type QueryKey, useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

interface QueryConfig<TOutput> {
  queryKey: QueryKey;
  endpoint: string;
  errorMessage?: string;
  enabled?: boolean;
  transform?: (data: unknown) => TOutput;
}

export const createQuery = <TOutput>(config: QueryConfig<TOutput>) => {
  return () => {
    const { data, isLoading, error, refetch } = useQuery({
      queryKey: config.queryKey,
      queryFn: async () => {
        const response = await fetchWithAuth(config.endpoint);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || config.errorMessage || "데이터를 불러오는데 실패했습니다.");
        }

        const rawData = result.data;
        return (config.transform ? config.transform(rawData) : rawData) as TOutput;
      },
      enabled: config.enabled,
    });

    return { data: data ?? ([] as unknown as TOutput), isLoading, error, refetch };
  };
};
