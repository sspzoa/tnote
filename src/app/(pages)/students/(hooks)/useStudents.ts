import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { type Student, selectedCourseAtom } from "../(atoms)/useStudentsStore";

export const useStudents = () => {
  const selectedCourse = useAtomValue(selectedCourseAtom);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["students", selectedCourse],
    queryFn: async () => {
      const url = selectedCourse === "all" ? "/api/students" : `/api/students?courseId=${selectedCourse}`;
      const response = await fetchWithAuth(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "학생 목록을 불러오는데 실패했습니다.");
      }

      return result.data as Student[];
    },
  });

  return {
    students: data || [],
    isLoading,
    error,
    refetch,
  };
};
