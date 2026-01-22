export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  home: {
    stats: ["home", "stats"] as const,
  },
  tags: {
    all: ["tags"] as const,
    detail: (id: string) => ["tags", "detail", id] as const,
  },
  students: {
    all: ["students"] as const,
    byCourse: (courseId: string) => ["students", "byCourse", courseId] as const,
    detail: (id: string) => ["students", "detail", id] as const,
    forMessages: ["students-for-messages"] as const,
    forAssign: (courseId: string) => ["students-for-assign", courseId] as const,
  },
  courses: {
    all: ["courses"] as const,
    forStudentsFilter: ["courses-for-students-filter"] as const,
    forRetakesFilter: ["courses-for-retakes-filter"] as const,
    forMessages: ["courses-for-messages"] as const,
    forAssign: ["courses-for-assign"] as const,
    detail: (id: string) => ["courses", "detail", id] as const,
  },
  clinics: {
    all: ["clinics"] as const,
    detail: (id: string) => ["clinics", "detail", id] as const,
    attendance: (clinicId: string, date: string) => ["clinics", "attendance", clinicId, date] as const,
  },
  retakes: {
    all: ["retakes"] as const,
    byFilter: (filter: string) => ["retakes", filter] as const,
    byStatus: (status: string) => ["retakes", "status", status] as const,
    byDateRange: (startDate: string, endDate: string) => ["retakes", "dateRange", startDate, endDate] as const,
    history: (retakeId: string) => ["retake-history", retakeId] as const,
    historyAll: ["retake-history-all"] as const,
    forMessages: (status: string, managementStatus: string) =>
      ["retakes-for-messages", status, managementStatus] as const,
  },
  exams: {
    all: ["exams"] as const,
    byCourse: (courseId: string) => ["exams", courseId] as const,
    forMessages: (courseId: string) => ["exams-for-messages", courseId] as const,
    forAssign: (courseId: string) => ["exams-for-assign", courseId] as const,
    detail: (examId: string) => ["exams", "detail", examId] as const,
    scores: (examId: string) => ["exams", "scores", examId] as const,
    assignments: (examId: string) => ["exams", "assignments", examId] as const,
    export: (examId: string) => ["exam-export", examId] as const,
  },
  consultations: {
    all: ["consultations"] as const,
    byStudent: (studentId: string) => ["consultations", "byStudent", studentId] as const,
  },
  admins: {
    all: ["admins"] as const,
  },
  calendar: {
    events: (startDate: string, endDate: string) => ["calendarEvents", startDate, endDate] as const,
  },
  messages: {
    templates: (type: string) => ["message-templates", type] as const,
    senderPhone: ["sender-phone"] as const,
    history: (type: string, limit: number) => ["message-history", type, limit] as const,
  },
} as const;
