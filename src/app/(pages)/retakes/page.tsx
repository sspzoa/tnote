"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Retake {
  id: string;
  exam_id: string;
  student_id: string;
  current_scheduled_date: string;
  status: "pending" | "completed" | "absent";
  postpone_count: number;
  absent_count: number;
  note: string | null;
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
    id: string; // primary key (uuid)
    phone_number: string;
    name: string;
    school: string;
  };
}

interface History {
  id: string;
  action_type: "postpone" | "absent" | "complete";
  previous_date: string | null;
  new_date: string | null;
  note: string | null;
  created_at: string;
}

interface Course {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  name: string;
  exam_number: number;
  course: Course;
}

interface AssignStudent {
  id: string;
  phone_number: string;
  name: string;
  school: string;
}

export default function RetakesPage() {
  const _router = useRouter();
  const [retakes, setRetakes] = useState<Retake[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "absent">("all");
  const [selectedRetake, setSelectedRetake] = useState<Retake | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState<History[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeNote, setPostponeNote] = useState("");
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [absentNote, setAbsentNote] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeNote, setCompleteNote] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<any>(null);
  const [loadingStudentInfo, setLoadingStudentInfo] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // 할당 모달 상태
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignStudents, setAssignStudents] = useState<AssignStudent[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAssignStudents, setLoadingAssignStudents] = useState(false);

  useEffect(() => {
    fetchRetakes();
  }, [filter]);

  const fetchRetakes = async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/retakes" : `/api/retakes?status=${filter}`;
      const response = await fetch(url);
      const result = await response.json();
      setRetakes(result.data || []);
    } catch (error) {
      console.error("Failed to fetch retakes:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPostponeModal = (retake: Retake) => {
    setSelectedRetake(retake);
    setPostponeDate("");
    setPostponeNote("");
    setShowPostponeModal(true);
  };

  const handlePostpone = async () => {
    if (!selectedRetake || !postponeDate) {
      alert("새로운 날짜를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/retakes/${selectedRetake.id}/postpone`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate: postponeDate, note: postponeNote || null }),
      });

      if (response.ok) {
        alert("재시험이 연기되었습니다.");
        setShowPostponeModal(false);
        fetchRetakes();
        if (showHistoryModal) {
          fetchHistory(selectedRetake.id);
        }
      } else {
        alert("연기 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("Postpone error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const openAbsentModal = (retake: Retake) => {
    setSelectedRetake(retake);
    setAbsentNote("");
    setShowAbsentModal(true);
  };

  const handleAbsent = async () => {
    if (!selectedRetake) return;

    try {
      const response = await fetch(`/api/retakes/${selectedRetake.id}/absent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: absentNote || null }),
      });

      if (response.ok) {
        alert("결석 처리되었습니다.");
        setShowAbsentModal(false);
        fetchRetakes();
        if (showHistoryModal) {
          fetchHistory(selectedRetake.id);
        }
      } else {
        alert("결석 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("Absent error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const openCompleteModal = (retake: Retake) => {
    setSelectedRetake(retake);
    setCompleteNote("");
    setShowCompleteModal(true);
  };

  const handleComplete = async () => {
    if (!selectedRetake) return;

    try {
      const response = await fetch(`/api/retakes/${selectedRetake.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: completeNote || null }),
      });

      if (response.ok) {
        alert("완료 처리되었습니다.");
        setShowCompleteModal(false);
        fetchRetakes();
        if (showHistoryModal) {
          fetchHistory(selectedRetake.id);
        }
      } else {
        alert("완료 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("Complete error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const fetchHistory = async (retakeId: string) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/retakes/${retakeId}/history`);
      const result = await response.json();
      setHistory(result.data || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewHistory = (retake: Retake) => {
    setSelectedRetake(retake);
    setShowHistoryModal(true);
    fetchHistory(retake.id);
  };

  const handleViewStudent = async (studentId: string) => {
    setLoadingStudentInfo(true);
    setShowStudentModal(true);
    try {
      const response = await fetch(`/api/students/${studentId}`);
      const result = await response.json();
      setSelectedStudentInfo(result.data);
    } catch (error) {
      console.error("Failed to fetch student info:", error);
      alert("학생 정보를 불러오는데 실패했습니다.");
      setShowStudentModal(false);
    } finally {
      setLoadingStudentInfo(false);
    }
  };

  const openEditModal = (retake: Retake) => {
    setSelectedRetake(retake);
    setEditDate(retake.current_scheduled_date);
    setEditNote(retake.note || "");
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!selectedRetake || !editDate) {
      alert("날짜를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/retakes/${selectedRetake.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: editDate,
          note: editNote || null,
        }),
      });

      if (response.ok) {
        alert("재시험 정보가 수정되었습니다.");
        setShowEditModal(false);
        fetchRetakes();
      } else {
        alert("수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const handleDelete = async (retake: Retake) => {
    setOpenMenuId(null);
    if (!confirm(`${retake.student.name} 학생의 ${retake.exam.course.name} 재시험을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/retakes/${retake.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("재시험이 삭제되었습니다.");
        fetchRetakes();
      } else {
        const result = await response.json();
        alert(result.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  // 할당 모달 함수들
  const openAssignModal = async () => {
    setShowAssignModal(true);
    await fetchCoursesForAssign();
  };

  const fetchCoursesForAssign = async () => {
    try {
      const response = await fetch("/api/exams");
      const result = await response.json();
      const uniqueCourses = result.data.reduce((acc: Course[], exam: Exam) => {
        if (!acc.find((c) => c.id === exam.course.id)) {
          acc.push(exam.course);
        }
        return acc;
      }, []);
      setCourses(uniqueCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchExamsForAssign = async (courseId: string) => {
    try {
      const response = await fetch(`/api/exams?courseId=${courseId}`);
      const result = await response.json();
      setExams(result.data || []);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    }
  };

  const fetchStudentsForAssign = async (courseId: string) => {
    setLoadingAssignStudents(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/students`);
      const result = await response.json();
      setAssignStudents(result.data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setAssignStudents([]);
    } finally {
      setLoadingAssignStudents(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedExam("");
    setSelectedStudents([]);
    if (courseId) {
      fetchExamsForAssign(courseId);
      fetchStudentsForAssign(courseId);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExam || selectedStudents.length === 0 || !scheduledDate) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    setAssigning(true);

    try {
      const response = await fetch("/api/retakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam,
          studentIds: selectedStudents,
          scheduledDate,
        }),
      });

      if (response.ok) {
        alert("재시험이 할당되었습니다.");
        setShowAssignModal(false);
        setSelectedCourse("");
        setSelectedExam("");
        setSelectedStudents([]);
        setScheduledDate("");
        setSearchQuery("");
        fetchRetakes();
      } else {
        const result = await response.json();
        alert(result.error || "재시험 할당에 실패했습니다.");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setAssigning(false);
    }
  };

  const filteredAssignStudents = assignStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRetakes = retakes.filter((retake) =>
    retake.student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getAge = (birthYear: number | null) => {
    if (!birthYear) return 0;
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear + 1;
  };

  const getGrade = (birthYear: number | null) => {
    if (!birthYear) return null;
    const age = getAge(birthYear);
    const gradeNumber = age - 6;

    if (gradeNumber <= 0) return "미취학";
    if (gradeNumber <= 6) return `초${gradeNumber}`;
    if (gradeNumber <= 9) return `중${gradeNumber - 6}`;
    if (gradeNumber <= 12) return `고${gradeNumber - 9}`;
    return "졸업";
  };

  const getActionLabel = (actionType: string) => {
    const labels = {
      postpone: "연기",
      absent: "결석",
      complete: "완료",
    };
    return labels[actionType as keyof typeof labels] || actionType;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-solid-translucent-yellow text-solid-yellow",
      completed: "bg-solid-translucent-green text-solid-green",
      absent: "bg-solid-translucent-red text-solid-red",
    };
    const labels = {
      pending: "대기중",
      completed: "완료",
      absent: "결석",
    };
    return (
      <span
        className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-semibold text-footnote ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 홈으로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">재시험 관리</h1>
              <p className="text-body text-content-standard-secondary">학생들의 재시험을 관리합니다</p>
            </div>
            <button
              onClick={openAssignModal}
              className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
              + 재시험 할당
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div className="mb-spacing-600 flex flex-wrap gap-spacing-300">
          {[
            { value: "all", label: "전체" },
            { value: "pending", label: "대기중" },
            { value: "completed", label: "완료" },
            { value: "absent", label: "결석" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as typeof filter)}
              className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
                filter === item.value
                  ? "bg-core-accent text-solid-white"
                  : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
              }`}>
              {item.label}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <div className="mb-spacing-600">
          <input
            type="text"
            placeholder="학생 이름 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
          />
        </div>

        {/* 재시험 목록 */}
        {loading ? (
          <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
        ) : retakes.length === 0 ? (
          <div className="py-spacing-900 text-center">
            <p className="text-body text-content-standard-tertiary">재시험이 없습니다.</p>
          </div>
        ) : filteredRetakes.length === 0 ? (
          <div className="py-spacing-900 text-center">
            <p className="text-body text-content-standard-tertiary">
              {retakes.length === 0 ? "재시험이 없습니다." : "검색 결과가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <table className="w-full rounded-radius-400">
              <thead className="bg-components-fill-standard-secondary">
                <tr>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    학생
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    시험
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    예정일
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    상태
                  </th>
                  <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRetakes.map((retake) => (
                  <tr
                    key={retake.id}
                    className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                    <td className="px-spacing-500 py-spacing-400">
                      <button
                        onClick={() => handleViewStudent(retake.student.id)}
                        className="text-left transition-colors hover:text-core-accent">
                        <div className="font-medium text-body text-content-standard-primary hover:text-core-accent">
                          {retake.student.name}
                        </div>
                        <div className="text-content-standard-tertiary text-footnote">
                          {retake.student.phone_number}
                        </div>
                      </button>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="text-body text-content-standard-primary">
                        {retake.exam.course.name} - {retake.exam.name}
                      </div>
                      <div className="text-content-standard-secondary text-footnote">{retake.exam.exam_number}회차</div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="text-body text-content-standard-primary">{retake.current_scheduled_date}</div>
                      {(retake.postpone_count > 0 || retake.absent_count > 0) && (
                        <div className="mt-spacing-100 flex gap-spacing-200">
                          {retake.postpone_count > 0 && (
                            <span className="text-content-standard-tertiary text-footnote">
                              연기 {retake.postpone_count}회
                            </span>
                          )}
                          {retake.absent_count > 0 && (
                            <span className="text-content-standard-tertiary text-footnote">
                              결석 {retake.absent_count}회
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-spacing-500 py-spacing-400">{getStatusBadge(retake.status)}</td>
                    <td className="relative px-spacing-500 py-spacing-400">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === retake.id ? null : retake.id)}
                        className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
                        <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === retake.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[140px] rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200 shadow-lg">
                            {retake.status !== "completed" && (
                              <>
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    openPostponeModal(retake);
                                  }}
                                  className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                                  연기
                                </button>
                                {retake.status === "pending" && (
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      openAbsentModal(retake);
                                    }}
                                    className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                                    결석
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    openCompleteModal(retake);
                                  }}
                                  className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                                  완료
                                </button>
                                <div className="my-spacing-100 border-line-divider border-t" />
                              </>
                            )}
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleViewHistory(retake);
                              }}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                              이력 보기
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                openEditModal(retake);
                              }}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                              수정
                            </button>
                            <div className="my-spacing-100 border-line-divider border-t" />
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDelete(retake);
                              }}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative transition-colors hover:bg-solid-translucent-red">
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 연기 모달 */}
        {showPostponeModal && selectedRetake && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowPostponeModal(false)}>
            <div
              className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              {/* 모달 헤더 */}
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="mb-spacing-200 font-bold text-content-standard-primary text-title">재시험 연기</h2>
                <div className="text-body text-content-standard-secondary">
                  {selectedRetake.student.name} - {selectedRetake.exam.course.name} - {selectedRetake.exam.name}{" "}
                  {selectedRetake.exam.exam_number}회차
                </div>
              </div>

              {/* 모달 내용 */}
              <div className="p-spacing-600">
                <div className="space-y-spacing-400">
                  {/* 현재 예정일 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      현재 예정일
                    </label>
                    <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
                      {selectedRetake.current_scheduled_date}
                    </div>
                  </div>

                  {/* 새로운 날짜 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      새로운 날짜 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="date"
                      value={postponeDate}
                      onChange={(e) => setPostponeDate(e.target.value)}
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  {/* 연기 사유 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      연기 사유 (선택사항)
                    </label>
                    <textarea
                      value={postponeNote}
                      onChange={(e) => setPostponeNote(e.target.value)}
                      rows={3}
                      placeholder="연기 사유를 입력하세요"
                      className="w-full resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => setShowPostponeModal(false)}
                  className="flex-1 rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handlePostpone}
                  disabled={!postponeDate}
                  className="flex-1 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  연기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 결석 모달 */}
        {showAbsentModal && selectedRetake && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowAbsentModal(false)}>
            <div
              className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              {/* 모달 헤더 */}
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="mb-spacing-200 font-bold text-content-standard-primary text-title">결석 처리</h2>
                <div className="text-body text-content-standard-secondary">
                  {selectedRetake.student.name} - {selectedRetake.exam.course.name} - {selectedRetake.exam.name}{" "}
                  {selectedRetake.exam.exam_number}회차
                </div>
              </div>

              {/* 모달 내용 */}
              <div className="p-spacing-600">
                <div className="space-y-spacing-400">
                  {/* 예정일 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      예정일
                    </label>
                    <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
                      {selectedRetake.current_scheduled_date}
                    </div>
                  </div>

                  {/* 결석 사유 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      결석 사유 (선택사항)
                    </label>
                    <textarea
                      value={absentNote}
                      onChange={(e) => setAbsentNote(e.target.value)}
                      rows={3}
                      placeholder="결석 사유를 입력하세요"
                      className="w-full resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => setShowAbsentModal(false)}
                  className="flex-1 rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleAbsent}
                  className="flex-1 rounded-radius-400 bg-core-status-negative px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90">
                  결석 처리
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 완료 모달 */}
        {showCompleteModal && selectedRetake && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowCompleteModal(false)}>
            <div
              className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              {/* 모달 헤더 */}
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="mb-spacing-200 font-bold text-content-standard-primary text-title">완료 처리</h2>
                <div className="text-body text-content-standard-secondary">
                  {selectedRetake.student.name} - {selectedRetake.exam.course.name} - {selectedRetake.exam.name}{" "}
                  {selectedRetake.exam.exam_number}회차
                </div>
              </div>

              {/* 모달 내용 */}
              <div className="p-spacing-600">
                <div className="space-y-spacing-400">
                  {/* 예정일 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      예정일
                    </label>
                    <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-tertiary">
                      {selectedRetake.current_scheduled_date}
                    </div>
                  </div>

                  {/* 메모 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      메모 (선택사항)
                    </label>
                    <textarea
                      value={completeNote}
                      onChange={(e) => setCompleteNote(e.target.value)}
                      rows={3}
                      placeholder="메모를 입력하세요"
                      className="w-full resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 rounded-radius-400 bg-core-status-positive px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90">
                  완료 처리
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && selectedRetake && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowEditModal(false)}>
            <div
              className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              {/* 모달 헤더 */}
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="mb-spacing-200 font-bold text-content-standard-primary text-title">재시험 수정</h2>
                <div className="text-body text-content-standard-secondary">
                  {selectedRetake.student.name} - {selectedRetake.exam.course.name} - {selectedRetake.exam.name}{" "}
                  {selectedRetake.exam.exam_number}회차
                </div>
              </div>

              {/* 모달 내용 */}
              <div className="p-spacing-600">
                <div className="space-y-spacing-400">
                  {/* 예정일 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      예정일 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  {/* 메모 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      메모 (선택사항)
                    </label>
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      rows={3}
                      placeholder="메모를 입력하세요"
                      className="w-full resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!editDate}
                  className="flex-1 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 학생 정보 모달 */}
        {showStudentModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowStudentModal(false)}>
            <div
              className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              {/* 모달 헤더 */}
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-title">학생 정보</h2>
              </div>

              {/* 모달 내용 */}
              <div className="p-spacing-600">
                {loadingStudentInfo ? (
                  <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
                ) : selectedStudentInfo ? (
                  <div className="space-y-spacing-400">
                    {/* 이름 */}
                    <div>
                      <div className="mb-spacing-200 flex items-center gap-spacing-300">
                        <h3 className="font-bold text-content-standard-primary text-heading">
                          {selectedStudentInfo.name}
                        </h3>
                        {selectedStudentInfo.birth_year && getGrade(selectedStudentInfo.birth_year) && (
                          <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                            {getGrade(selectedStudentInfo.birth_year)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 정보 목록 */}
                    <div className="space-y-spacing-300">
                      <div className="flex items-start gap-spacing-300">
                        <span className="w-24 flex-shrink-0 text-body text-content-standard-tertiary">전화번호</span>
                        <span className="font-medium text-body text-content-standard-primary">
                          {selectedStudentInfo.phone_number}
                        </span>
                      </div>

                      {selectedStudentInfo.parent_phone_number && (
                        <div className="flex items-start gap-spacing-300">
                          <span className="w-24 flex-shrink-0 text-body text-content-standard-tertiary">부모님</span>
                          <span className="text-body text-content-standard-secondary">
                            {selectedStudentInfo.parent_phone_number}
                          </span>
                        </div>
                      )}

                      {selectedStudentInfo.school && (
                        <div className="flex items-start gap-spacing-300">
                          <span className="w-24 flex-shrink-0 text-body text-content-standard-tertiary">학교</span>
                          <span className="text-body text-content-standard-secondary">
                            {selectedStudentInfo.school}
                          </span>
                        </div>
                      )}

                      {selectedStudentInfo.birth_year && (
                        <div className="flex items-start gap-spacing-300">
                          <span className="w-24 flex-shrink-0 text-body text-content-standard-tertiary">출생년도</span>
                          <span className="text-body text-content-standard-secondary">
                            {selectedStudentInfo.birth_year}년
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-spacing-900 text-center text-content-standard-tertiary">
                    학생 정보를 불러올 수 없습니다.
                  </div>
                )}
              </div>

              {/* 모달 푸터 */}
              <div className="border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="w-full rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 할당 모달 */}
        {showAssignModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowAssignModal(false)}>
            <div
              className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              {/* 모달 헤더 */}
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-content-standard-primary text-heading">재시험 할당</h2>
                    <p className="mt-spacing-100 text-content-standard-secondary text-label">
                      학생들에게 재시험을 할당합니다
                    </p>
                  </div>
                  <Link
                    href="/courses"
                    className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                    수업 관리
                  </Link>
                </div>
              </div>

              {/* 모달 내용 */}
              <form onSubmit={handleAssignSubmit} className="flex-1 overflow-y-auto p-spacing-600">
                <div className="space-y-spacing-400">
                  {/* 코스 선택 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      수업 선택 <span className="text-core-status-negative">*</span>
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      required
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
                      <option value="">수업을 선택하세요</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 시험 선택 */}
                  {selectedCourse && (
                    <div>
                      <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                        시험 선택 <span className="text-core-status-negative">*</span>
                      </label>
                      <select
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        required
                        className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
                        <option value="">시험을 선택하세요</option>
                        {exams.map((exam) => (
                          <option key={exam.id} value={exam.id}>
                            {exam.exam_number}회차 - {exam.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 예정일 */}
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                      재시험 예정일 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  {/* 학생 선택 */}
                  {selectedCourse && (
                    <div>
                      <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                        학생 선택 <span className="text-core-status-negative">*</span>
                        <span className="ml-spacing-200 font-normal text-content-standard-tertiary">
                          ({selectedStudents.length}명 선택됨)
                        </span>
                      </label>
                      {loadingAssignStudents ? (
                        <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-300">
                          <p className="py-spacing-400 text-center text-body text-content-standard-tertiary">
                            로딩중...
                          </p>
                        </div>
                      ) : assignStudents.length === 0 ? (
                        <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-300">
                          <p className="py-spacing-400 text-center text-body text-content-standard-tertiary">
                            이 수업에 등록된 학생이 없습니다.
                          </p>
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            placeholder="학생 이름 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="mb-spacing-200 w-full rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                          />
                          <div className="max-h-60 overflow-y-auto rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-300">
                            {filteredAssignStudents.length === 0 ? (
                              <p className="py-spacing-400 text-center text-body text-content-standard-tertiary">
                                검색 결과가 없습니다.
                              </p>
                            ) : (
                              <div className="grid grid-cols-2 gap-spacing-200">
                                {filteredAssignStudents.map((student) => (
                                  <label
                                    key={student.id}
                                    className="flex cursor-pointer items-center gap-spacing-200 rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-interactive-hover">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(student.id)}
                                      onChange={() => toggleStudent(student.id)}
                                      className="h-4 w-4 accent-core-accent"
                                    />
                                    <div>
                                      <div className="text-body text-content-standard-primary">{student.name}</div>
                                      <div className="text-content-standard-tertiary text-footnote">
                                        {student.phone_number}
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 모달 푸터 */}
                <div className="mt-spacing-500 flex gap-spacing-300 border-line-divider border-t pt-spacing-500">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={assigning || !selectedExam || selectedStudents.length === 0 || !scheduledDate}
                    className="flex-1 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                    {assigning ? "할당 중..." : "재시험 할당"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 이력 모달 */}
        {showHistoryModal && selectedRetake && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowHistoryModal(false)}>
            <div
              className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              {/* 모달 헤더 */}
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="mb-spacing-200 font-bold text-content-standard-primary text-title">재시험 이력</h2>
                <div className="text-body text-content-standard-secondary">
                  {selectedRetake.student.name} - {selectedRetake.exam.course.name} - {selectedRetake.exam.name}{" "}
                  {selectedRetake.exam.exam_number}회차
                </div>
              </div>

              {/* 모달 내용 */}
              <div className="flex-1 overflow-y-auto p-spacing-600">
                {loadingHistory ? (
                  <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
                ) : history.length === 0 ? (
                  <div className="py-spacing-900 text-center">
                    <p className="text-body text-content-standard-tertiary">이력이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-spacing-400">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500">
                        <div className="mb-spacing-300 flex items-start justify-between">
                          <div className="flex items-center gap-spacing-300">
                            <span
                              className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-semibold text-footnote ${
                                item.action_type === "postpone"
                                  ? "bg-solid-translucent-blue text-solid-blue"
                                  : item.action_type === "absent"
                                    ? "bg-solid-translucent-red text-solid-red"
                                    : "bg-solid-translucent-green text-solid-green"
                              }`}>
                              {getActionLabel(item.action_type)}
                            </span>
                            {item.action_type === "postpone" && item.previous_date && item.new_date && (
                              <span className="text-body text-content-standard-primary">
                                {item.previous_date} → {item.new_date}
                              </span>
                            )}
                          </div>
                          <span className="text-content-standard-tertiary text-footnote">
                            {new Date(item.created_at).toLocaleString("ko-KR")}
                          </span>
                        </div>
                        {item.note && <p className="text-body text-content-standard-secondary">{item.note}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 모달 푸터 */}
              <div className="border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-full rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
