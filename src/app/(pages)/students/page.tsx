"use client";

import { useAtom, useAtomValue } from "jotai";
import { MessageSquare, Pencil } from "lucide-react";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge, Button, EmptyState, Skeleton, SkeletonTable, SlidePanel } from "@/shared/components/ui";
import { formatLocaleDateKorean, formatLocaleTimeKorean } from "@/shared/lib/utils/date";
import { isTagActive } from "@/shared/lib/utils/tags";
import type { ConsultationWithDetails } from "@/shared/types";
import { showCreateModalAtom } from "./(atoms)/useModalStore";
import { searchQueryAtom, selectedTagIdsAtom } from "./(atoms)/useStudentsStore";
import AddTagModal from "./(components)/AddTagModal";
import ConsultationDetailModal from "./(components)/ConsultationDetailModal";
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

const isEdited = (consultation: ConsultationWithDetails) => {
  if (!consultation.updated_at) return false;
  const created = new Date(consultation.created_at).getTime();
  const updated = new Date(consultation.updated_at).getTime();
  return updated - created > 1000;
};

export default function StudentsPage() {
  const { students, isLoading: studentsLoading, error: studentsError } = useStudents();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { consultations, isLoading: consultationsLoading, markAsRead, unreadCount } = useAllConsultations();
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

  const handleConsultationClick = (consultation: ConsultationWithDetails) => {
    setSelectedConsultation(consultation);
    if (!consultation.is_read) {
      markAsRead(consultation.id);
    }
  };

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
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConsultationPanel(true)}
              className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              최근 상담
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 text-primary-foreground text-xs">{unreadCount}</span>
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

      <ConsultationDetailModal
        consultation={selectedConsultation}
        studentName={selectedConsultation?.student?.name || "-"}
        onClose={() => setSelectedConsultation(null)}
      />

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
        subtitle={unreadCount > 0 ? `읽지 않은 상담 ${unreadCount}건` : "최근 50건"}>
        {consultationsLoading ? (
          <div className="flex flex-col gap-3 p-7">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 border-border border-b pb-3 last:border-b-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-5 w-16 rounded-sm" />
                </div>
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <span className="text-muted-foreground text-sm">상담 내역이 없습니다.</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {consultations.map((consultation) => {
              const createdAt = new Date(consultation.created_at);
              const dateStr = formatLocaleDateKorean(createdAt);
              const timeStr = formatLocaleTimeKorean(createdAt);
              const edited = isEdited(consultation);

              return (
                <button
                  key={consultation.id}
                  onClick={() => handleConsultationClick(consultation)}
                  className={`flex w-full flex-col gap-1 px-7 py-4 text-left transition-all duration-150 hover:bg-primary/50 ${!consultation.is_read ? "bg-primary/30" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-base text-foreground ${!consultation.is_read ? "font-semibold" : "font-medium"}`}>
                        {consultation.student?.name || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {edited && (
                        <Badge variant="neutral" size="xs" className="gap-0.5">
                          <Pencil className="size-2.5" />
                          {consultation.updater?.name || "수정됨"}
                        </Badge>
                      )}
                      <span className="rounded-sm border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary text-xs">
                        {dateStr}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`truncate text-base ${!consultation.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                    {consultation.title}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
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
