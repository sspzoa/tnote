"use client";

import { useAtomValue } from "jotai";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import {
  assignmentExamAtom,
  scoreExamAtom,
  selectedExamAtom,
  showAssignmentModalAtom,
  showCreateModalAtom,
  showEditModalAtom,
  showScoreModalAtom,
} from "./(atoms)/useExamStore";
import { AssignmentModal } from "./(components)/AssignmentModal";
import { ExamFormModal } from "./(components)/ExamFormModal";
import { ExamTable } from "./(components)/ExamTable";
import { ScoreInputModal } from "./(components)/ScoreInputModal";
import { useCourseDetail } from "./(hooks)/useCourseDetail";
import { useCoursePageHandlers } from "./(hooks)/useCoursePageHandlers";
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

  const showCreateModal = useAtomValue(showCreateModalAtom);
  const showEditModal = useAtomValue(showEditModalAtom);
  const selectedExam = useAtomValue(selectedExamAtom);
  const showScoreModal = useAtomValue(showScoreModalAtom);
  const scoreExam = useAtomValue(scoreExamAtom);
  const showAssignmentModal = useAtomValue(showAssignmentModalAtom);
  const assignmentExam = useAtomValue(assignmentExamAtom);

  const {
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openScoreModal,
    closeScoreModal,
    openAssignmentModal,
    closeAssignmentModal,
  } = useCoursePageHandlers();

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

  useEffect(() => {
    if (courseError) {
      alert("수업을 찾을 수 없습니다.");
      router.push("/courses");
    }
  }, [courseError, router]);

  const handleCreate = async (data: { examNumber: number; name: string; maxScore: number; cutline: number }) => {
    try {
      await createExam({ courseId, ...data });
      alert("시험이 생성되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "시험 생성에 실패했습니다.");
    }
  };

  const handleEdit = async (data: { examNumber: number; name: string; maxScore: number; cutline: number }) => {
    if (!selectedExam) return;

    try {
      await updateExam({ examId: selectedExam.id, ...data });
      alert("시험이 수정되었습니다.");
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

  const handleSaveScores = async (scores: Array<{ studentId: string; score: number }>, toDelete: string[]) => {
    if (!scoreExam) return;

    try {
      await saveScores({ examId: scoreExam.id, scores, toDelete });
      alert("점수가 저장되었습니다.");
      closeScoreModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : "점수 저장에 실패했습니다.");
    }
  };

  const handleSaveAssignments = async (assignments: Array<{ studentId: string; status: string }>) => {
    if (!assignmentExam) return;

    try {
      await saveAssignments({ examId: assignmentExam.id, assignments });
      alert("과제 상태가 저장되었습니다.");
      closeAssignmentModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : "과제 상태 저장에 실패했습니다.");
    }
  };

  const getCreateInitialData = () => {
    const maxExamNumber = exams.length > 0 ? Math.max(...exams.map((e) => e.exam_number)) : 0;
    return {
      examNumber: maxExamNumber + 1,
      name: "",
      maxScore: 8,
      cutline: 4,
    };
  };

  const getEditInitialData = () => {
    if (!selectedExam) return undefined;
    return {
      examNumber: selectedExam.exam_number,
      name: selectedExam.name,
      maxScore: selectedExam.max_score || 8,
      cutline: selectedExam.cutline || 4,
    };
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
          onClose={closeCreateModal}
          mode="create"
          courseName={course.name}
          initialData={showCreateModal ? getCreateInitialData() : undefined}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
        />

        <ExamFormModal
          isOpen={showEditModal}
          onClose={closeEditModal}
          mode="edit"
          initialData={getEditInitialData()}
          onSubmit={handleEdit}
          isSubmitting={isUpdating}
        />

        <ScoreInputModal
          isOpen={showScoreModal}
          onClose={closeScoreModal}
          exam={scoreExam}
          students={scoreStudents}
          isLoading={loadingScores}
          existingScores={existingScores}
          onSave={handleSaveScores}
          isSaving={isSavingScores}
        />

        <AssignmentModal
          isOpen={showAssignmentModal}
          onClose={closeAssignmentModal}
          exam={assignmentExam}
          students={assignmentStudents}
          isLoading={loadingAssignments}
          existingAssignments={existingAssignments}
          onSave={handleSaveAssignments}
          isSaving={isSavingAssignments}
        />
      </div>
    </div>
  );
}
