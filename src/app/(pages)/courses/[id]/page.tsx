"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { AssignmentModal } from "./(components)/AssignmentModal";
import { ExamFormModal } from "./(components)/ExamFormModal";
import { ExamTable } from "./(components)/ExamTable";
import { ScoreInputModal } from "./(components)/ScoreInputModal";
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
      alert("모든 정보를 입력해 주세요.");
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
      alert(error instanceof Error ? error.message : "시험 생성에 실패했습니다.");
    }
  };

  const handleEdit = async () => {
    if (!selectedExam || !examNumber || !examName.trim() || !maxScore || !cutline) {
      alert("모든 정보를 입력해 주세요.");
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
      alert(error instanceof Error ? error.message : "시험 수정에 실패했습니다.");
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
      alert(error instanceof Error ? error.message : "시험 삭제에 실패했습니다.");
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
      alert(error instanceof Error ? error.message : "점수 저장에 실패했습니다.");
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
      alert(error instanceof Error ? error.message : "과제 상태 저장에 실패했습니다.");
    }
  };

  const loadingScores = loadingScoreStudents || loadingExistingScores;
  const loadingAssignments = loadingAssignmentStudents || loadingExistingAssignments;

  if (courseLoading || examsLoading || !course) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-7xl">
        <div className="mb-spacing-700">
          <Link href="/courses" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 수업 목록으로 돌아가기
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">{course.name}</h1>
              <p className="text-body text-content-standard-secondary">총 {exams.length}개의 시험</p>
            </div>
            <Button onClick={openCreateModal}>+ 시험 생성</Button>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="py-spacing-900 text-center">
            <p className="text-body text-content-standard-tertiary">시험이 없습니다.</p>
            <Button onClick={openCreateModal} className="mt-spacing-500">
              첫 시험 만들기
            </Button>
          </div>
        ) : (
          <ExamTable
            exams={exams}
            onScoreInput={openScoreModal}
            onAssignment={openAssignmentModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}

        <ExamFormModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setExamNumber("");
            setExamName("");
            setMaxScore("8");
            setCutline("4");
          }}
          mode="create"
          courseName={course.name}
          examNumber={examNumber}
          examName={examName}
          maxScore={maxScore}
          cutline={cutline}
          onExamNumberChange={setExamNumber}
          onExamNameChange={setExamName}
          onMaxScoreChange={setMaxScore}
          onCutlineChange={setCutline}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
        />

        <ExamFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          mode="edit"
          examNumber={examNumber}
          examName={examName}
          maxScore={maxScore}
          cutline={cutline}
          onExamNumberChange={setExamNumber}
          onExamNameChange={setExamName}
          onMaxScoreChange={setMaxScore}
          onCutlineChange={setCutline}
          onSubmit={handleEdit}
          isSubmitting={isUpdating}
        />

        <ScoreInputModal
          isOpen={showScoreModal}
          onClose={closeScoreModal}
          exam={scoreExam}
          students={scoreStudents}
          isLoading={loadingScores}
          searchQuery={scoreSearchQuery}
          onSearchChange={setScoreSearchQuery}
          scoreInputs={scoreInputs}
          onScoreChange={handleScoreChange}
          onSave={handleSaveScores}
          isSaving={isSavingScores}
          belowCutlineCount={getBelowCutlineCount()}
        />

        <AssignmentModal
          isOpen={showAssignmentModal}
          onClose={closeAssignmentModal}
          exam={assignmentExam}
          students={assignmentStudents}
          isLoading={loadingAssignments}
          searchQuery={assignmentSearchQuery}
          onSearchChange={setAssignmentSearchQuery}
          assignmentInputs={assignmentInputs}
          onAssignmentChange={handleAssignmentChange}
          onSave={handleSaveAssignments}
          isSaving={isSavingAssignments}
        />
      </div>
    </div>
  );
}
