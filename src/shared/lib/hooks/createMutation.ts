import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

interface MutationConfig<TInput> {
  endpoint: string | ((input: TInput) => string);
  method: "POST" | "PATCH" | "DELETE";
  invalidateKeys?: QueryKey[];
  extractData?: boolean;
}

export const createMutation = <TInput = void, TOutput = unknown>(config: MutationConfig<TInput>) => {
  return () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
      mutationFn: async (input: TInput) => {
        const url = typeof config.endpoint === "function" ? config.endpoint(input) : config.endpoint;

        const hasBody = config.method !== "DELETE" || (input !== undefined && typeof input !== "string");
        const body =
          hasBody && input !== undefined ? JSON.stringify(typeof input === "string" ? undefined : input) : undefined;

        const response = await fetchWithAuth(url, {
          method: config.method,
          ...(body ? { headers: { "Content-Type": "application/json" }, body } : {}),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "요청에 실패했습니다.");
        }

        return (config.extractData ? result.data : result) as TOutput;
      },
      onSuccess: () => {
        if (config.invalidateKeys) {
          for (const key of config.invalidateKeys) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        }
      },
    });

    return { mutate: mutateAsync, isPending };
  };
};
