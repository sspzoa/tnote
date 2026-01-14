export const QUERY_KEYS = {
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
  },
  exams: {
    all: ["exams"] as const,
    byCourse: (courseId: string) => ["exams", "byCourse", courseId] as const,
    scores: (examId: string) => ["exams", "scores", examId] as const,
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
  logs: {
    all: ["logs"] as const,
    stats: ["logs", "stats"] as const,
  },
} as const;
