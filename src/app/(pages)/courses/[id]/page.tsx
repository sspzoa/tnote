"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { SearchInput } from "@/shared/components/ui/searchInput";
import {
  StudentListContainer,
  StudentListEmpty,
  StudentListItem,
  StudentListLoading,
} from "@/shared/components/ui/studentList";
import { useCourseDetail } from "./(hooks)/useCourseDetail";
import { useCourseStudents } from "./(hooks)/useCourseStudents";
import { useExamAssignments, useExamAssignmentsSave } from "./(hooks)/useExamAssignments";
import { useExamCreate } from "./(hooks)/useExamCreate";
import { useExamDelete } from "./(hooks)/useExamDelete";
import { useExamScores, useExamScoresSave } from "./(hooks)/useExamScores";
import { type Exam, useExams } from "./(hooks)/useExams";
import { useExamUpdate } from "./(hooks)/useExamUpdate";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  // React Query hooks
  const { course, isLoading: courseLoading, error: courseError } = useCourseDetail(courseId);
  const { exams, isLoading: examsLoading } = useExams(courseId);
  const { createExam, isPending: isCreating } = useExamCreate(courseId);
  const { updateExam, isPending: isUpdating } = useExamUpdate(courseId);
  const { deleteExam } = useExamDelete(courseId);
  const { saveScores, isPending: isSavingScores } = useExamScoresSave(courseId);
  const { saveAssignments, isPending: isSavingAssignments } = useExamAssignmentsSave();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examNumber, setExamNumber] = useState("");
  const [examName, setExamName] = useState("");
  const [maxScore, setMaxScore] = useState("8");
  const [cutline, setCutline] = useState("4");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Score modal states
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreExam, setScoreExam] = useState<Exam | null>(null);
  const [existingScoreStudentIds, setExistingScoreStudentIds] = useState<string[]>([]);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [scoreSearchQuery, setScoreSearchQuery] = useState("");

  // Assignment modal states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentExam, setAssignmentExam] = useState<Exam | null>(null);
  const [assignmentInputs, setAssignmentInputs] = useState<Record<string, string>>({});
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState("");

  // Conditional hooks for modal data
  const { students: scoreStudents, isLoading: loadingScoreStudents } = useCourseStudents(courseId, showScoreModal);
  const { scores: existingScores, isLoading: loadingExistingScores } = useExamScores(
    scoreExam?.id ?? "",
    showScoreModal && !!scoreExam,
  );
  const { students: assignmentStudents, isLoading: loadingAssignmentStudents } = useCourseStudents(
    courseId,
    showAssignmentModal,
  );
  const { assignments: existingAssignments, isLoading: loadingExistingAssignments } = useExamAssignments(
    assignmentExam?.id ?? "",
    showAssignmentModal && !!assignmentExam,
  );

  // Initialize score inputs when existing scores are loaded
  useEffect(() => {
    if (existingScores.length > 0 && showScoreModal) {
      setExistingScoreStudentIds(existingScores.map((s) => s.student_id));
      const initialScores: Record<string, string> = {};
      for (const score of existingScores) {
        initialScores[score.student_id] = score.score.toString();
      }
      setScoreInputs(initialScores);
    }
  }, [existingScores, showScoreModal]);

  // Initialize assignment inputs when existing assignments are loaded
  useEffect(() => {
    if (existingAssignments.length > 0 && showAssignmentModal) {
      const initialInputs: Record<string, string> = {};
      for (const assignment of existingAssignments) {
        initialInputs[assignment.student.id] = assignment.status;
      }
      setAssignmentInputs(initialInputs);
    }
  }, [existingAssignments, showAssignmentModal]);

  // Redirect on course error
  useEffect(() => {
    if (courseError) {
      alert("수업을 찾을 수 없습니다.");
      router.push("/courses");
    }
  }, [courseError, router]);

  const handleCreate = async () => {
    if (!examNumber || !examName.trim() || !maxScore || !cutline) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    try {
      await createExam({
        courseId,
        examNumber: Number.parseInt(examNumber),
        name: examName,
        maxScore: Number.parseInt(maxScore),
        cutline: Number.parseInt(cutline),
      });
      alert("시험이 생성되었습니다.");
      setShowCreateModal(false);
      setExamNumber("");
      setExamName("");
      setMaxScore("8");
      setCutline("4");
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const handleEdit = async () => {
    if (!selectedExam || !examNumber || !examName.trim() || !maxScore || !cutline) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    try {
      await updateExam({
        examId: selectedExam.id,
        examNumber: Number.parseInt(examNumber),
        name: examName,
        maxScore: Number.parseInt(maxScore),
        cutline: Number.parseInt(cutline),
      });
      alert("시험이 수정되었습니다.");
      setShowEditModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const handleDelete = async (exam: Exam) => {
    if (
      !confirm(`"${exam.name}" (${exam.exam_number}회차)를 삭제하시겠습니까?\n관련된 재시험 정보도 함께 삭제됩니다.`)
    ) {
      return;
    }

    try {
      await deleteExam(exam.id);
      alert("시험이 삭제되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const openCreateModal = () => {
    const maxExamNumber = exams.length > 0 ? Math.max(...exams.map((e) => e.exam_number)) : 0;
    setExamNumber((maxExamNumber + 1).toString());
    setExamName("");
    setMaxScore("8");
    setCutline("4");
    setShowCreateModal(true);
  };

  const openEditModal = (exam: Exam) => {
    setSelectedExam(exam);
    setExamNumber(exam.exam_number.toString());
    setExamName(exam.name);
    setMaxScore(exam.max_score?.toString() || "8");
    setCutline(exam.cutline?.toString() || "4");
    setShowEditModal(true);
  };

  const openScoreModal = (exam: Exam) => {
    setScoreExam(exam);
    setScoreInputs({});
    setExistingScoreStudentIds([]);
    setScoreSearchQuery("");
    setShowScoreModal(true);
  };

  const closeScoreModal = () => {
    setShowScoreModal(false);
    setScoreExam(null);
    setExistingScoreStudentIds([]);
    setScoreInputs({});
    setScoreSearchQuery("");
  };

  const handleScoreChange = (studentId: string, value: string) => {
    setScoreInputs((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveScores = async () => {
    if (!scoreExam) return;

    const scores = Object.entries(scoreInputs)
      .filter(([, value]) => value !== "" && !Number.isNaN(Number.parseInt(value)))
      .map(([studentId, value]) => ({
        studentId,
        score: Number.parseInt(value),
      }));

    const scoreStudentIds = scores.map((s) => s.studentId);
    const toDelete = existingScoreStudentIds.filter((id) => !scoreStudentIds.includes(id));

    if (scores.length === 0 && toDelete.length === 0) {
      alert("저장할 변경사항이 없습니다.");
      return;
    }

    const maxScoreValue = scoreExam.max_score || 8;
    const invalidScores = scores.filter((s) => s.score > maxScoreValue);
    if (invalidScores.length > 0) {
      alert(`만점(${maxScoreValue}점)을 초과하는 점수가 있습니다.`);
      return;
    }

    try {
      await saveScores({ examId: scoreExam.id, scores, toDelete });
      alert("점수가 저장되었습니다.");
      closeScoreModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const getBelowCutlineCount = () => {
    if (!scoreExam) return 0;
    const cutlineValue = scoreExam.cutline || 80;
    return Object.entries(scoreInputs).filter(([, value]) => {
      const score = Number.parseInt(value);
      return !Number.isNaN(score) && score < cutlineValue;
    }).length;
  };

  const openAssignmentModal = (exam: Exam) => {
    setAssignmentExam(exam);
    setAssignmentInputs({});
    setAssignmentSearchQuery("");
    setShowAssignmentModal(true);
  };

  const closeAssignmentModal = () => {
    setShowAssignmentModal(false);
    setAssignmentExam(null);
    setAssignmentInputs({});
    setAssignmentSearchQuery("");
  };

  const handleAssignmentChange = (studentId: string, status: string) => {
    setAssignmentInputs((prev) => {
      if (prev[studentId] === status) {
        const newInputs = { ...prev };
        delete newInputs[studentId];
        return newInputs;
      }
      return {
        ...prev,
        [studentId]: status,
      };
    });
  };

  const handleSaveAssignments = async () => {
    if (!assignmentExam) return;

    const assignments = Object.entries(assignmentInputs)
      .filter(([, status]) => status !== "")
      .map(([studentId, status]) => ({
        studentId,
        status,
      }));

    try {
      await saveAssignments({ examId: assignmentExam.id, assignments });
      alert("과제 상태가 저장되었습니다.");
      closeAssignmentModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const getAssignmentStatusCounts = () => {
    const counts = { 완료: 0, 미흡: 0, 미제출: 0 };
    for (const status of Object.values(assignmentInputs)) {
      if (status === "완료" || status === "미흡" || status === "미제출") {
        counts[status]++;
      }
    }
    return counts;
  };

  // Loading states
  const loadingScores = loadingScoreStudents || loadingExistingScores;
  const loadingAssignments = loadingAssignmentStudents || loadingExistingAssignments;

  if (courseLoading || examsLoading || !course) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/courses" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 수업 목록으로 돌아가기
          </Link>
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
        </div>

        {/* 시험 목록 */}
        {exams.length === 0 ? (
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
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    만점
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    커트라인
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    최고점
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    평균
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    중앙값
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    재시험자
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    관리
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
                    <td className="px-spacing-500 py-spacing-400">
                      <span className="text-body text-content-standard-primary">{exam.max_score || 8}점</span>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <span className="text-body text-content-standard-primary">{exam.cutline || 4}점</span>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      {exam.highest_score !== null && exam.highest_score !== undefined ? (
                        <span className="text-body text-content-standard-primary">{exam.highest_score}점</span>
                      ) : (
                        <span className="text-body text-content-standard-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      {exam.average_score !== null && exam.average_score !== undefined ? (
                        <span className="text-body text-content-standard-primary">{exam.average_score}점</span>
                      ) : (
                        <span className="text-body text-content-standard-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      {exam.median_score !== null && exam.median_score !== undefined ? (
                        <span className="text-body text-content-standard-primary">{exam.median_score}점</span>
                      ) : (
                        <span className="text-body text-content-standard-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      {exam.below_cutline_count !== null && exam.below_cutline_count !== undefined ? (
                        <span className="text-body text-content-standard-primary">
                          {exam.below_cutline_count}명 / {exam.total_score_count}명
                        </span>
                      ) : (
                        <span className="text-body text-content-standard-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="flex gap-spacing-200">
                        <button
                          onClick={() => openScoreModal(exam)}
                          className="rounded-radius-300 bg-core-accent px-spacing-400 py-spacing-200 font-medium text-footnote text-solid-white transition-opacity hover:opacity-90">
                          점수 입력
                        </button>
                        <button
                          onClick={() => openAssignmentModal(exam)}
                          className="rounded-radius-300 border border-core-accent bg-transparent px-spacing-400 py-spacing-200 font-medium text-core-accent text-footnote transition-colors hover:bg-core-accent-translucent">
                          과제
                        </button>
                      </div>
                    </td>
                    <td className="relative px-spacing-500 py-spacing-400">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === exam.id ? null : exam.id)}
                        className="rounded-radius-200 px-spacing-200 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
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

                <div className="flex gap-spacing-400">
                  <div className="flex-1">
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      만점 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value)}
                      placeholder="8"
                      min="1"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      커트라인 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="number"
                      value={cutline}
                      onChange={(e) => setCutline(e.target.value)}
                      placeholder="4"
                      min="0"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setExamNumber("");
                    setExamName("");
                    setMaxScore("8");
                    setCutline("4");
                  }}
                  className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !examNumber || !examName.trim() || !maxScore || !cutline}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {isCreating ? "생성 중..." : "생성"}
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

                <div className="flex gap-spacing-400">
                  <div className="flex-1">
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      만점 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value)}
                      placeholder="8"
                      min="1"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      커트라인 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="number"
                      value={cutline}
                      onChange={(e) => setCutline(e.target.value)}
                      placeholder="4"
                      min="0"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
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
                  disabled={isUpdating || !examNumber || !examName.trim() || !maxScore || !cutline}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {isUpdating ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 점수 입력 모달 */}
        {showScoreModal && scoreExam && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={closeScoreModal}>
            <div
              className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-heading">점수 입력</h2>
                <p className="mt-spacing-100 text-content-standard-secondary text-label">
                  {scoreExam.name} ({scoreExam.exam_number}회차) - 만점: {scoreExam.max_score || 8}점, 커트라인:{" "}
                  {scoreExam.cutline || 4}점
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col p-spacing-600">
                {loadingScores ? (
                  <StudentListContainer>
                    <StudentListLoading />
                  </StudentListContainer>
                ) : scoreStudents.length === 0 ? (
                  <StudentListContainer>
                    <StudentListEmpty message="수강생이 없습니다." />
                  </StudentListContainer>
                ) : (
                  <>
                    {/* 검색창 - 고정 */}
                    <div className="relative mb-spacing-400 shrink-0">
                      <input
                        type="text"
                        value={scoreSearchQuery}
                        onChange={(e) => setScoreSearchQuery(e.target.value)}
                        placeholder="학생 검색..."
                        className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary py-spacing-300 pr-spacing-400 pl-spacing-900 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                      />
                      <svg
                        className="-translate-y-1/2 absolute top-1/2 left-spacing-300 h-5 w-5 text-content-standard-tertiary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* 학생 목록 - 스크롤 */}
                    <StudentListContainer>
                      {scoreStudents.filter((student) =>
                        student.name.toLowerCase().includes(scoreSearchQuery.toLowerCase()),
                      ).length === 0 ? (
                        <StudentListEmpty message="검색 결과가 없습니다." />
                      ) : (
                        scoreStudents
                          .filter((student) => student.name.toLowerCase().includes(scoreSearchQuery.toLowerCase()))
                          .map((student) => {
                            const scoreValue = scoreInputs[student.id] || "";
                            const score = Number.parseInt(scoreValue);
                            const isBelowCutline = !Number.isNaN(score) && score < (scoreExam.cutline || 4);

                            return (
                              <StudentListItem
                                key={student.id}
                                student={student}
                                highlighted={isBelowCutline}
                                rightContent={
                                  <div className="flex items-center gap-spacing-200">
                                    <input
                                      type="number"
                                      value={scoreValue}
                                      onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                      placeholder="-"
                                      min="0"
                                      max={scoreExam.max_score || 8}
                                      className={`w-20 rounded-radius-300 border px-spacing-300 py-spacing-200 text-center text-body transition-all focus:outline-none focus:ring-2 ${
                                        isBelowCutline
                                          ? "border-core-status-negative bg-solid-translucent-red text-core-status-negative focus:ring-core-status-negative/30"
                                          : "border-line-outline bg-components-fill-standard-primary text-content-standard-primary focus:border-core-accent focus:ring-core-accent-translucent"
                                      }`}
                                    />
                                    <span className="text-body text-content-standard-tertiary">
                                      / {scoreExam.max_score || 8}
                                    </span>
                                  </div>
                                }
                              />
                            );
                          })
                      )}
                    </StudentListContainer>
                  </>
                )}
              </div>

              {!loadingScores && scoreStudents.length > 0 && (
                <div className="border-line-divider border-t px-spacing-600 py-spacing-400">
                  <div className="mb-spacing-300 flex items-center justify-between text-body">
                    <span className="text-content-standard-secondary">
                      입력된 점수:{" "}
                      {Object.values(scoreInputs).filter((v) => v !== "" && !Number.isNaN(Number.parseInt(v))).length}명
                      / {scoreStudents.length}명
                    </span>
                    {getBelowCutlineCount() > 0 && (
                      <span className="text-core-status-negative">커트라인 미달: {getBelowCutlineCount()}명</span>
                    )}
                  </div>
                  <div className="flex gap-spacing-300">
                    <button
                      onClick={closeScoreModal}
                      className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                      취소
                    </button>
                    <button
                      onClick={handleSaveScores}
                      disabled={isSavingScores}
                      className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                      {isSavingScores ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showAssignmentModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={closeAssignmentModal}>
            <div
              className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-heading">과제 관리</h2>
                <p className="mt-spacing-100 text-content-standard-secondary text-label">
                  {assignmentExam?.name} ({assignmentExam?.exam_number}회차)
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col p-spacing-600">
                {loadingAssignments ? (
                  <StudentListContainer>
                    <StudentListLoading />
                  </StudentListContainer>
                ) : assignmentStudents.length === 0 ? (
                  <StudentListContainer>
                    <StudentListEmpty message="수강생이 없습니다." />
                  </StudentListContainer>
                ) : (
                  <>
                    <div className="mb-spacing-400 shrink-0">
                      <SearchInput
                        value={assignmentSearchQuery}
                        onChange={(e) => setAssignmentSearchQuery(e.target.value)}
                        placeholder="학생 검색..."
                      />
                    </div>

                    <StudentListContainer>
                      {assignmentStudents.filter((student) =>
                        student.name.toLowerCase().includes(assignmentSearchQuery.toLowerCase()),
                      ).length === 0 ? (
                        <StudentListEmpty message="검색 결과가 없습니다." />
                      ) : (
                        assignmentStudents
                          .filter((student) => student.name.toLowerCase().includes(assignmentSearchQuery.toLowerCase()))
                          .map((student) => {
                            const currentStatus = assignmentInputs[student.id] || "";

                            return (
                              <StudentListItem
                                key={student.id}
                                student={student}
                                rightContent={
                                  <div className="flex items-center gap-spacing-100">
                                    <button
                                      onClick={() => handleAssignmentChange(student.id, "완료")}
                                      className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-footnote transition-all ${
                                        currentStatus === "완료"
                                          ? "bg-solid-translucent-green text-solid-green"
                                          : "bg-components-fill-standard-secondary text-content-standard-tertiary hover:bg-components-interactive-hover"
                                      }`}>
                                      완료
                                    </button>
                                    <button
                                      onClick={() => handleAssignmentChange(student.id, "미흡")}
                                      className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-footnote transition-all ${
                                        currentStatus === "미흡"
                                          ? "bg-solid-translucent-orange text-solid-orange"
                                          : "bg-components-fill-standard-secondary text-content-standard-tertiary hover:bg-components-interactive-hover"
                                      }`}>
                                      미흡
                                    </button>
                                    <button
                                      onClick={() => handleAssignmentChange(student.id, "미제출")}
                                      className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-footnote transition-all ${
                                        currentStatus === "미제출"
                                          ? "bg-solid-translucent-red text-core-status-negative"
                                          : "bg-components-fill-standard-secondary text-content-standard-tertiary hover:bg-components-interactive-hover"
                                      }`}>
                                      미제출
                                    </button>
                                  </div>
                                }
                              />
                            );
                          })
                      )}
                    </StudentListContainer>
                  </>
                )}
              </div>

              {!loadingAssignments && assignmentStudents.length > 0 && (
                <div className="border-line-divider border-t px-spacing-600 py-spacing-400">
                  <div className="mb-spacing-300 flex items-center justify-between text-body">
                    <span className="text-content-standard-secondary">
                      입력됨: {Object.values(assignmentInputs).filter((v) => v !== "").length}명 /{" "}
                      {assignmentStudents.length}명
                    </span>
                    <div className="flex items-center gap-spacing-400">
                      {getAssignmentStatusCounts()["완료"] > 0 && (
                        <span className="text-solid-green">완료: {getAssignmentStatusCounts()["완료"]}명</span>
                      )}
                      {getAssignmentStatusCounts()["미흡"] > 0 && (
                        <span className="text-solid-orange">미흡: {getAssignmentStatusCounts()["미흡"]}명</span>
                      )}
                      {getAssignmentStatusCounts()["미제출"] > 0 && (
                        <span className="text-core-status-negative">
                          미제출: {getAssignmentStatusCounts()["미제출"]}명
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-spacing-300">
                    <button
                      onClick={closeAssignmentModal}
                      className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                      취소
                    </button>
                    <button
                      onClick={handleSaveAssignments}
                      disabled={isSavingAssignments}
                      className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                      {isSavingAssignments ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
