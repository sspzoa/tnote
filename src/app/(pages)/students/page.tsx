"use client";

import { useAtom, useAtomValue } from "jotai";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Button, EmptyState, Modal, Skeleton, SkeletonTable, SlidePanel } from "@/shared/components/ui";
import type { ConsultationWithDetails } from "@/shared/types";
import { showCreateModalAtom } from "./(atoms)/useModalStore";
import { searchQueryAtom, selectedTagIdsAtom } from "./(atoms)/useStudentsStore";
import AddTagModal from "./(components)/AddTagModal";
import ConsultationFormModal from "./(components)/ConsultationFormModal";
import ConsultationListModal from "./(components)/ConsultationListModal";
import EditTagAssignmentModal from "./(components)/EditTagAssignmentModal";
import StudentCreateModal from "./(components)/StudentCreateModal";
import StudentEditModal from "./(components)/StudentEditModal";
import StudentFilterBar from "./(components)/StudentFilterBar";
import StudentInfoModal from "./(components)/StudentInfoModal";
import StudentList from "./(components)/StudentList";
import TagManageModal from "./(components)/TagManageModal";
import { useAllConsultations } from "./(hooks)/useAllConsultations";
import { useCourses } from "./(hooks)/useCourses";
import { useStudents } from "./(hooks)/useStudents";
import { useTags } from "./(hooks)/useTags";

const isTagActive = (startDate: string, endDate: string | null): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (today < start) return false;
  if (endDate === null) return true;

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return today <= end;
};

export default function StudentsPage() {
  const { students, isLoading: studentsLoading, error: studentsError } = useStudents();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { consultations, isLoading: consultationsLoading } = useAllConsultations();
  const { tags, isLoading: tagsLoading } = useTags();
  const searchQuery = useAtomValue(searchQueryAtom);
  const selectedTagIds = useAtomValue(selectedTagIdsAtom);
  const [, setShowCreateModal] = useAtom(showCreateModalAtom);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithDetails | null>(null);
  const [showConsultationPanel, setShowConsultationPanel] = useState(false);

  const hiddenTagIds = new Set(tags.filter((tag) => tag.hidden_by_default).map((tag) => tag.id));

  const filteredStudents = students
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((student) => {
      const activeTags = (student.tags || []).filter((assignment) =>
        isTagActive(assignment.start_date, assignment.end_date),
      );

      const hasHiddenTag = activeTags.some((assignment) => hiddenTagIds.has(assignment.tag_id));
      if (hasHiddenTag) {
        const selectedHiddenTag = activeTags.find(
          (assignment) => hiddenTagIds.has(assignment.tag_id) && selectedTagIds.has(assignment.tag_id),
        );
        if (!selectedHiddenTag) return false;
      }

      if (selectedTagIds.size === 0) return true;
      return activeTags.some((assignment) => selectedTagIds.has(assignment.tag_id));
    });

  const isLoading = studentsLoading || coursesLoading || tagsLoading;

  if (studentsError) {
    return <ErrorComponent errorMessage="학생 목록을 불러오는데 실패했습니다." />;
  }

  return (
    <Container>
      <Header
        title="학생 관리"
        subtitle={`전체 학생 ${students.length}명`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={
          <div className="flex items-center gap-spacing-300">
            <Button
              variant="secondary"
              onClick={() => setShowConsultationPanel(true)}
              className="flex items-center gap-spacing-200">
              <MessageSquare className="size-4" />
              최근 상담
              {consultations.length > 0 && (
                <span className="rounded-full bg-core-accent px-spacing-200 text-footnote text-solid-white">
                  {consultations.length}
                </span>
              )}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>+ 학생 추가</Button>
          </div>
        }
      />

      <StudentFilterBar courses={courses} tags={tags} />

      {isLoading ? (
        <SkeletonTable
          rows={8}
          columns={[
            "w-16",
            { width: "w-20", badges: ["w-12", "w-10"] },
            "w-14",
            { width: "w-12", rounded: true },
            "w-28",
            "w-28",
            "w-20",
            "action",
          ]}
        />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          message={students.length === 0 ? "학생이 없습니다." : "검색 결과가 없습니다."}
          actionLabel={students.length === 0 ? "학생 추가" : undefined}
          onAction={students.length === 0 ? () => setShowCreateModal(true) : undefined}
        />
      ) : (
        <StudentList students={filteredStudents} />
      )}

      <Modal
        isOpen={!!selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
        title={selectedConsultation?.title || ""}
        subtitle={`${selectedConsultation?.student?.name} - ${selectedConsultation?.created_at ? new Date(selectedConsultation.created_at).toLocaleDateString("ko-KR") : ""}${selectedConsultation?.creator?.name ? ` (작성자: ${selectedConsultation.creator.name})` : ""}`}
        footer={
          <Button variant="secondary" onClick={() => setSelectedConsultation(null)} className="flex-1">
            닫기
          </Button>
        }>
        <div className="whitespace-pre-wrap text-body text-content-standard-primary">
          {selectedConsultation?.content}
        </div>
      </Modal>

      <StudentCreateModal />
      <StudentEditModal />
      <StudentInfoModal />
      <ConsultationListModal />
      <ConsultationFormModal />
      <TagManageModal />
      <AddTagModal />
      <EditTagAssignmentModal />

      <SlidePanel
        isOpen={showConsultationPanel}
        onClose={() => setShowConsultationPanel(false)}
        title="최근 상담 내역"
        subtitle="최근 50건">
        {consultationsLoading ? (
          <div className="flex flex-col gap-spacing-300 p-spacing-600">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-spacing-200 border-line-divider border-b pb-spacing-300 last:border-b-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-5 w-16 rounded-radius-200" />
                </div>
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-spacing-300 py-spacing-900">
            <div className="flex size-12 items-center justify-center rounded-full bg-core-accent-translucent">
              <MessageSquare className="size-6 text-core-accent" />
            </div>
            <span className="text-content-standard-tertiary text-label">상담 내역이 없습니다.</span>
          </div>
        ) : (
          <div className="divide-y divide-line-divider">
            {consultations.map((consultation) => {
              const createdAt = new Date(consultation.created_at);
              const dateStr = createdAt.toLocaleDateString("ko-KR");
              const timeStr = createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

              return (
                <button
                  key={consultation.id}
                  onClick={() => {
                    setSelectedConsultation(consultation);
                    setShowConsultationPanel(false);
                  }}
                  className="flex w-full flex-col gap-spacing-100 px-spacing-600 py-spacing-400 text-left transition-all duration-150 hover:bg-core-accent-translucent/50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-body text-content-standard-primary">
                      {consultation.student?.name || "-"}
                    </span>
                    <span className="rounded-radius-200 border border-core-accent/20 bg-core-accent-translucent px-spacing-200 py-spacing-50 text-core-accent text-footnote">
                      {dateStr}
                    </span>
                  </div>
                  <div className="truncate text-body text-content-standard-secondary">{consultation.title}</div>
                  <div className="flex items-center gap-spacing-200 text-content-standard-tertiary text-footnote">
                    <span>{timeStr}</span>
                    {consultation.creator?.name && (
                      <>
                        <span>·</span>
                        <span>{consultation.creator.name}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SlidePanel>
    </Container>
  );
}
