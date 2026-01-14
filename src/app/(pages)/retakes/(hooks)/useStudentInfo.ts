import { useQuery } from "@tanstack/react-query";

interface StudentInfo {
  id: string;
  name: string;
  phone_number: string;
  parent_phone_number?: string;
  school?: string;
  birth_year?: number;
}

export const useStudentInfo = (studentId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["student-info", studentId],
    queryFn: async () => {
      if (!studentId) return null;

      const response = await fetch(`/api/students/${studentId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "학생 정보를 불러오는데 실패했습니다.");
      }

      return result.data as StudentInfo;
    },
    enabled: !!studentId,
  });

  return {
    studentInfo: data,
    isLoading,
    error,
  };
};
