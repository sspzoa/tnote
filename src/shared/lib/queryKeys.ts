export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  home: {
    stats: ["home", "stats"] as const,
  },
  students: {
    all: ["students"] as const,
    byCourse: (courseId: string) => ["students", "byCourse", courseId] as const,
    detail: (id: string) => ["students", "detail", id] as const,
  },
  courses: {
    all: ["courses"] as const,
    forStudentsFilter: ["courses-for-students-filter"] as const,
    detail: (id: string) => ["courses", "detail", id] as const,
  },
  clinics: {
    all: ["clinics"] as const,
    detail: (id: string) => ["clinics", "detail", id] as const,
    attendance: (clinicId: string, date: string) => ["clinics", "attendance", clinicId, date] as const,
  },
  retakes: {
    all: ["retakes"] as const,
    byStatus: (status: string) => ["retakes", "status", status] as const,
    byDateRange: (startDate: string, endDate: string) => ["retakes", "dateRange", startDate, endDate] as const,
    history: (retakeId: string) => ["retakes", "history", retakeId] as const,
    historyAll: ["retake-history-all"] as const,
  },
  exams: {
    all: ["exams"] as const,
    byCourse: (courseId: string) => ["exams", "byCourse", courseId] as const,
    detail: (examId: string) => ["exams", "detail", examId] as const,
    scores: (examId: string) => ["exams", "scores", examId] as const,
    assignments: (examId: string) => ["exams", "assignments", examId] as const,
    export: (examId: string) => ["exams", "export", examId] as const,
  },
  consultations: {
    all: ["consultations"] as const,
    byStudent: (studentId: string) => ["consultations", "byStudent", studentId] as const,
  },
  admins: {
    all: ["admins"] as const,
  },
  calendar: {
    events: (startDate: string, endDate: string) => ["calendar", "events", startDate, endDate] as const,
  },
} as const;
