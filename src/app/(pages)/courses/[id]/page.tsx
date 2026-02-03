"use client";

import { useAtomValue } from "jotai";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Container from "@/shared/components/common/Container";
import Header from "@/shared/components/common/Header";
import { Button } from "@/shared/components/ui/button";
import { Skeleton, SkeletonTable } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/useToast";
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
  const toast = useToast();

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
      toast.error("수업을 찾을 수 없습니다.");
      router.push("/courses");
    }
  }, [courseError, router, toast]);

  const handleCreate = async (data: { examNumber: number; name: string; maxScore: number; cutline: number }) => {
    try {
      await createExam({ courseId, ...data });
      toast.success("시험이 생성되었습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "시험 생성에 실패했습니다.");
    }
  };

  const handleEdit = async (data: { examNumber: number; name: string; maxScore: number; cutline: number }) => {
    if (!selectedExam) return;

    try {
      await updateExam({ examId: selectedExam.id, ...data });
      toast.success("시험이 수정되었습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "시험 수정에 실패했습니다.");
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
      toast.success("시험이 삭제되었습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "시험 삭제에 실패했습니다.");
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
      toast.success("저장되었습니다.");
      closeScoreModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
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
      <Container>
        <div className="flex flex-col gap-spacing-400">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-spacing-200">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-12 w-28 rounded-radius-300" />
          </div>
        </div>
        <SkeletonTable
          rows={5}
          columns={[
            "w-24",
            { width: "w-16", rounded: true },
            "w-10",
            "w-14",
            "w-10",
            "w-10",
            "w-10",
            "w-24",
            { width: "w-28", buttons: ["w-28"] },
            "action",
          ]}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Header
        title={course.name}
        subtitle={`총 ${exams.length}개의 시험`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={<Button onClick={openCreateModal}>+ 시험 생성</Button>}
      />

      {exams.length === 0 ? (
        <div className="flex flex-col items-center gap-spacing-500 py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">시험이 없습니다.</p>
          <Button onClick={openCreateModal}>첫 시험 만들기</Button>
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
    </Container>
  );
}
