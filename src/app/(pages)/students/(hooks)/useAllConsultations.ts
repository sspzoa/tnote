import { useQuery } from "@tanstack/react-query";

interface Student {
  id: string;
  name: string;
  phone_number: string;
  school: string | null;
}

interface Creator {
  id: string;
  name: string;
}

interface Consultation {
  id: string;
  student_id: string;
  consultation_date: string;
  title: string;
  content: string;
  created_at: string;
  student: Student;
  creator?: Creator | null;
}

export const useAllConsultations = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["all-consultations"],
    queryFn: async () => {
      const response = await fetch("/api/consultations");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "상담 내역을 불러오는데 실패했습니다.");
      }

      return result.data as Consultation[];
    },
  });

  return {
    consultations: data || [],
    isLoading,
    error,
    refetch,
  };
};
