import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

export const useWorkspaceDelete = () => {
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await fetchWithAuth(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete workspace");
      }

      return result;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  return {
    deleteWorkspace: mutateAsync,
    isDeleting: isPending,
  };
};
