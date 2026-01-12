"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Course {
  id: string;
  name: string;
  student_count?: number;
}

interface Exam {
  id: string;
  course_id: string;
  exam_number: number;
  name: string;
  created_at: string;
  course: {
    id: string;
    name: string;
  };
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examNumber, setExamNumber] = useState("");
  const [examName, setExamName] = useState("");
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchExams();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const result = await response.json();
      if (response.ok) {
        setCourse(result.data);
      } else {
        alert("수업을 찾을 수 없습니다.");
        router.push("/courses");
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
      alert("수업 정보를 불러오는데 실패했습니다.");
      router.push("/courses");
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/exams?courseId=${courseId}`);
      const result = await response.json();
      setExams(result.data || []);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!examNumber || !examName.trim()) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          examNumber: Number.parseInt(examNumber),
          name: examName,
        }),
      });

      if (response.ok) {
        alert("시험이 생성되었습니다.");
        setShowCreateModal(false);
        setExamNumber("");
        setExamName("");
        fetchExams();
      } else {
        const result = await response.json();
        alert(result.error || "시험 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Create error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedExam || !examNumber || !examName.trim()) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/exams/${selectedExam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examNumber: Number.parseInt(examNumber),
          name: examName,
        }),
      });

      if (response.ok) {
        alert("시험이 수정되었습니다.");
        setShowEditModal(false);
        fetchExams();
      } else {
        const result = await response.json();
        alert(result.error || "시험 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exam: Exam) => {
    if (
      !confirm(`"${exam.name}" (${exam.exam_number}회차)를 삭제하시겠습니까?\n관련된 재시험 정보도 함께 삭제됩니다.`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${exam.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("시험이 삭제되었습니다.");
        fetchExams();
      } else {
        const result = await response.json();
        alert(result.error || "시험 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const openCreateModal = () => {
    const maxExamNumber = exams.length > 0 ? Math.max(...exams.map((e) => e.exam_number)) : 0;
    setExamNumber((maxExamNumber + 1).toString());
    setExamName("");
    setShowCreateModal(true);
  };

  const openEditModal = (exam: Exam) => {
    setSelectedExam(exam);
    setExamNumber(exam.exam_number.toString());
    setExamName(exam.name);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/courses" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 수업 목록으로 돌아가기
          </Link>
          {course && (
            <div className="flex items-end justify-between">
              <div>
                <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">{course.name}</h1>
                <p className="text-body text-content-standard-secondary">총 {exams.length}개의 시험</p>
              </div>
              <button
                onClick={openCreateModal}
                className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
                + 시험 생성
              </button>
            </div>
          )}
        </div>

        {/* 시험 목록 */}
        {loading ? (
          <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
        ) : exams.length === 0 ? (
          <div className="py-spacing-900 text-center">
            <p className="text-body text-content-standard-tertiary">시험이 없습니다.</p>
            <button
              onClick={openCreateModal}
              className="mt-spacing-500 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
              첫 시험 만들기
            </button>
          </div>
        ) : (
          <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <table className="w-full rounded-radius-400">
              <thead className="bg-components-fill-standard-secondary">
                <tr>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    시험명
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    회차
                  </th>
                  <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="font-medium text-body text-content-standard-primary">{exam.name}</div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                        {exam.exam_number}회차
                      </span>
                    </td>
                    <td className="relative px-spacing-500 py-spacing-400">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === exam.id ? null : exam.id)}
                        className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
                        <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === exam.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[120px] rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200 shadow-lg">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                openEditModal(exam);
                              }}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                              수정
                            </button>
                            <div className="my-spacing-100 border-line-divider border-t" />
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDelete(exam);
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

        {/* 생성 모달 */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowCreateModal(false)}>
            <div
              className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-heading">시험 생성</h2>
                {course && <p className="mt-spacing-100 text-content-standard-secondary text-label">{course.name}</p>}
              </div>

              <div className="space-y-spacing-400 p-spacing-600">
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    회차 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="number"
                    value={examNumber}
                    onChange={(e) => setExamNumber(e.target.value)}
                    placeholder="ex. 1"
                    min="1"
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                  />
                </div>

                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    시험 이름 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="예: 복습테스트"
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                  />
                </div>
              </div>

              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setExamNumber("");
                    setExamName("");
                  }}
                  className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !examNumber || !examName.trim()}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? "생성 중..." : "생성"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && selectedExam && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowEditModal(false)}>
            <div
              className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-heading">시험 수정</h2>
              </div>

              <div className="space-y-spacing-400 p-spacing-600">
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    회차 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="number"
                    value={examNumber}
                    onChange={(e) => setExamNumber(e.target.value)}
                    min="1"
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                  />
                </div>

                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    시험 이름 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                  />
                </div>
              </div>

              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleEdit}
                  disabled={saving || !examNumber || !examName.trim()}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
