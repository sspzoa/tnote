import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";
import type { TagColor } from "@/shared/types";

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

interface AssignmentHistoryInfo {
  id: string;
  status: "완료" | "미흡" | "미제출";
  note: string | null;
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

interface RetakeHistoryInfo {
  id: string;
  status: "pending" | "completed" | "absent";
  managementStatus: string;
  scheduledDate: string | null;
  postponeCount: number;
  absentCount: number;
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

interface ConsultationHistoryInfo {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  creator: { id: string; name: string } | null;
}

interface MessageHistoryInfo {
  id: string;
  messageType: string;
  recipientType: string;
  recipientPhone: string;
  messageContent: string;
  isSuccess: boolean;
  sentAt: string;
  sender: { id: string; name: string } | null;
}

interface TagInfo {
  id: string;
  name: string;
  color: TagColor;
}

interface TagAssignmentInfo {
  id: string;
  start_date: string;
  end_date: string | null;
  tag: TagInfo;
}

interface StudentInfo {
  id: string;
  phoneNumber: string;
  name: string;
  parentPhoneNumber: string | null;
  school: string | null;
  birthYear: number | null;
  createdAt: string;
  tags: TagAssignmentInfo[];
}

export interface StudentDetail {
  student: StudentInfo;
  courses: CourseInfo[];
  examScores: ExamScoreInfo[];
  clinicHistory: ClinicHistoryInfo[];
  assignmentHistory: AssignmentHistoryInfo[];
  retakeHistory: RetakeHistoryInfo[];
  consultationHistory: ConsultationHistoryInfo[];
  messageHistory: MessageHistoryInfo[];
}

const filterActiveCourses = (courses: CourseInfo[]): CourseInfo[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return courses.filter((course) => {
    if (!course.end_date) return true;
    const endDate = new Date(course.end_date);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });
};

export const useStudentDetail = (studentId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.students.detail(studentId || ""),
    queryFn: async () => {
      if (!studentId) return null;
      const res = await fetchWithAuth(`/api/students/${studentId}/detail`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      const detail = result.data as StudentDetail;
      return {
        ...detail,
        courses: filterActiveCourses(detail.courses),
      };
    },
    enabled: !!studentId,
  });

  return { studentDetail: data, isLoading, error };
};
