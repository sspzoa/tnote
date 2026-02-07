import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import { filterActiveCourses } from "@/shared/lib/utils/courses";
import type { Student } from "@/shared/types";

export const useStudents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.students.forMessages,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/students");
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
  };
};

interface Course {
  id: string;
  name: string;
  end_date?: string | null;
}

interface Exam {
  id: string;
  name: string;
  exam_number: number;
  max_score: number;
  cutline: number;
  course: Course;
}

export const useCourses = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.courses.forMessages,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/courses");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "코스 목록을 불러오는데 실패했습니다.");
      }

      return filterActiveCourses(result.data as Course[]);
    },
  });

  return {
    courses: data || [],
    isLoading,
    error,
  };
};

export const useExams = (courseId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.exams.forMessages(courseId),
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/exams?courseId=${courseId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "시험 목록을 불러오는데 실패했습니다.");
      }

      return result.data as Exam[];
    },
    enabled: !!courseId,
  });

  return {
    exams: data || [],
    isLoading,
    error,
  };
};

export interface ExamExportTag {
  id: string;
  tag_id: string;
  start_date: string;
  end_date: string | null;
  tag: {
    id: string;
    name: string;
    color: string;
    workspace: string;
    hidden_by_default: boolean;
  };
}

export interface ExamExportRow {
  studentId: string;
  name: string;
  phoneNumber: string;
  parentPhone: string;
  school: string;
  assignmentStatus: string;
  score: number | null;
  rank: number | null;
  tags: ExamExportTag[];
}

export interface ExamExportData {
  exam: {
    id: string;
    name: string;
    examNumber: number;
    maxScore: number;
    cutline: number;
    courseName: string;
  };
  rows: ExamExportRow[];
  totalCount: number;
}

export const useExamExport = (examId: string) => {
  const { data, isFetching, error } = useQuery({
    queryKey: QUERY_KEYS.exams.export(examId),
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/exams/${examId}/export`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "시험 데이터를 불러오는데 실패했습니다.");
      }

      return result.data as ExamExportData;
    },
    enabled: !!examId,
    placeholderData: keepPreviousData,
  });

  return {
    exportData: data,
    isFetching,
    error,
  };
};

export interface RetakeAssignment {
  id: string;
  exam_id: string;
  student_id: string;
  current_scheduled_date: string | null;
  status: "pending" | "completed" | "absent";
  management_status: string;
  exam: {
    id: string;
    name: string;
    exam_number: number;
    course: {
      id: string;
      name: string;
    };
  };
  student: {
    id: string;
    phone_number: string;
    name: string;
    school: string;
    parent_phone_number?: string | null;
  };
}

export const useRetakes = (status: string, managementStatus?: string) => {
  const { data, isFetching, error } = useQuery({
    queryKey: QUERY_KEYS.retakes.forMessages(status, managementStatus || "all"),
    queryFn: async () => {
      let url = `/api/retakes?status=${status}`;
      if (managementStatus && managementStatus !== "all") {
        url += `&managementStatus=${managementStatus}`;
      }
      const response = await fetchWithAuth(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "재시험 목록을 불러오는데 실패했습니다.");
      }

      return result.data as RetakeAssignment[];
    },
    placeholderData: keepPreviousData,
  });

  return {
    retakes: data || [],
    isFetching,
    error,
  };
};
