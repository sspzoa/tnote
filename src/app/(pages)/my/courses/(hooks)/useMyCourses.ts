import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { filterActiveCourses } from "@/shared/lib/utils/courses";

export interface MyCourse {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  days_of_week: number[] | null;
  enrolledAt: string;
}

export interface MyExamScore {
  id: string;
  score: number;
  maxScore: number | null;
  cutline: number | null;
  rank: number;
  totalStudents: number;
  average: number;
  median: number;
  highest: number;
  createdAt: string;
  exam: {
    id: string;
    name: string;
    examNumber: number;
    course: {
      id: string;
      name: string;
    };
  };
}

interface MyCoursesData {
  courses: MyCourse[];
  examScores: MyExamScore[];
  assignmentMap: Record<string, string>;
}

export const useMyCourses = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.my.courses,
    queryFn: async () => {
      const res = await fetchWithAuth("/api/my/courses");
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      const raw = result.data as MyCoursesData;
      return {
        ...raw,
        courses: filterActiveCourses(raw.courses),
      };
    },
  });

  return {
    courses: data?.courses || [],
    examScores: data?.examScores || [],
    assignmentMap: data?.assignmentMap || {},
    isLoading,
    error,
  };
};
