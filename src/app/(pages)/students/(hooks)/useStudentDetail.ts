import { useQuery } from "@tanstack/react-query";

interface CourseInfo {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  days_of_week: number[] | null;
  enrolled_at: string;
}

interface ExamScoreInfo {
  id: string;
  score: number;
  maxScore: number | null;
  cutline: number | null;
  rank: number;
  totalStudents: number;
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

interface ClinicHistoryInfo {
  id: string;
  attendanceDate: string;
  note: string | null;
  clinic: {
    id: string;
    name: string;
  };
}

interface StudentInfo {
  id: string;
  phoneNumber: string;
  name: string;
  parentPhoneNumber: string | null;
  school: string | null;
  birthYear: number | null;
  isFavorite: boolean;
  createdAt: string;
}

export interface StudentDetail {
  student: StudentInfo;
  courses: CourseInfo[];
  examScores: ExamScoreInfo[];
  clinicHistory: ClinicHistoryInfo[];
}

export const useStudentDetail = (studentId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentDetail", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await fetch(`/api/students/${studentId}/detail`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as StudentDetail;
    },
    enabled: !!studentId,
  });

  return { studentDetail: data, isLoading, error };
};
