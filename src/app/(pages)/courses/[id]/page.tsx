"use client";

import { useAtomValue } from "jotai";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton, SkeletonTable } from "@/shared/components/ui/skeleton";
import {
  scoreExamAtom,
  selectedExamAtom,
  showCreateModalAtom,
  showEditModalAtom,
  showScoreModalAtom,
} from "./(atoms)/useExamStore";
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

  const { openCreateModal, closeCreateModal, openEditModal, closeEditModal, openScoreModal, closeScoreModal } =
    useCoursePageHandlers();

  const { students: scoreStudents, isLoading: loadingScoreStudents } = useCourseStudents(courseId, showScoreModal);
  const { scores: existingScores, isLoading: loadingExistingScores } = useExamScores(
    scoreExam?.id ?? "",
    showScoreModal && !!scoreExam,
  );
  const { assignments: existingAssignments, isLoading: loadingExistingAssignments } = useExamAssignments(
    scoreExam?.id ?? "",
    showScoreModal && !!scoreExam,
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

  const handleSaveScoresAndAssignments = async (
    scores: Array<{ studentId: string; score: number }>,
    toDeleteScores: string[],
    assignments: Array<{ studentId: string; status: string }>,
  ) => {
    if (!scoreExam) return;

    try {
      await saveScores({ examId: scoreExam.id, scores, toDelete: toDeleteScores });
      await saveAssignments({ examId: scoreExam.id, assignments });
      alert("저장되었습니다.");
      closeScoreModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
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

  const loadingScores = loadingScoreStudents || loadingExistingScores || loadingExistingAssignments;

  if (courseLoading || examsLoading || !course) {
    return (
      <div className="min-h-screen p-spacing-600 md:p-spacing-800">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-spacing-400 h-6 w-40" />
          <div className="mb-spacing-700 flex items-end justify-between">
            <div className="space-y-spacing-200">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-12 w-28 rounded-radius-300" />
          </div>
          <SkeletonTable
            rows={5}
            columns={[
              "w-20",
              { width: "w-14", rounded: true },
              "w-8",
              "w-8",
              "w-8",
              "w-10",
              "w-8",
              "w-16",
              { width: "w-16", buttons: ["w-16", "w-12"] },
              "action",
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-7xl">
        <div className="mb-spacing-700">
          <Link href="/courses" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 수업 목록으로 돌아가기
          </Link>
          <div className="flex flex-col gap-spacing-400 md:flex-row md:items-end md:justify-between">
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
          <ExamTable exams={exams} onManage={openScoreModal} onEdit={openEditModal} onDelete={handleDelete} />
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
          existingAssignments={existingAssignments}
          onSave={handleSaveScoresAndAssignments}
          isSaving={isSavingScores || isSavingAssignments}
        />
      </div>
    </div>
  );
}
