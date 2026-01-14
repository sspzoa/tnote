import { useQuery } from "@tanstack/react-query";
import type { Clinic } from "../(atoms)/useClinicsStore";

export const useClinics = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["clinics"],
    queryFn: async () => {
      const response = await fetch("/api/clinics");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "클리닉 목록을 불러오는데 실패했습니다.");
      }

      return result.data as Clinic[];
    },
  });

  return {
    clinics: data || [],
    isLoading,
    error,
    refetch,
  };
};
