"use client";

import { useAtom, useAtomValue } from "jotai";
import { MessageSquare, Pencil } from "lucide-react";
import { useState } from "react";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import { PageShell } from "@/shared/components/common/PageShell";
import { Badge, Button, EmptyState, Skeleton, SlidePanel } from "@/shared/components/ui";
import { CollectionView } from "@/shared/components/ui/collectionView";
import { SearchInput } from "@/shared/components/ui/searchInput";
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
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
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
    return (
      <PageShell title="학생 관리">
        <ErrorComponent errorMessage="학생 목록을 불러오는데 실패했습니다." />
      </PageShell>
    );
  }

  const actions = (
    <>
      <Button variant="secondary" size="sm" onClick={() => setShowConsultationPanel(true)}>
        <MessageSquare className="size-4" />
        <span className="hidden sm:inline">최근 상담</span>
        {unreadCount > 0 && (
          <span className="rounded-full bg-primary px-1.5 text-primary-foreground text-xs tabular-nums">
            {unreadCount}
          </span>
        )}
      </Button>
      <Button size="sm" onClick={() => setShowCreateModal(true)}>
        + 학생 추가
      </Button>
    </>
  );

  const emptyNode =
    students.length === 0 ? (
      <EmptyState
        tone="students"
        message="학생이 없습니다."
        actionLabel="학생 추가"
        onAction={() => setShowCreateModal(true)}
      />
    ) : (
      <EmptyState tone="students" message="조건에 맞는 결과가 없어요" subtitle="검색어나 필터를 조정해 보세요." />
    );

  return (
    <PageShell title="학생 관리" subtitle={`전체 학생 ${students.length}명`} actions={actions}>
      <CollectionView
        search={
          <SearchInput
            placeholder="학생 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        }
        filters={<StudentFilterBar courses={courses} tags={tags} />}>
        <StudentList students={filteredStudents} isLoading={isLoading} empty={emptyNode} />
      </CollectionView>

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
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
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
                  className={`flex w-full flex-col gap-1 px-6 py-3.5 text-left transition-colors hover:bg-muted/50 ${!consultation.is_read ? "bg-primary/5" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm text-foreground ${!consultation.is_read ? "font-semibold" : "font-medium"}`}>
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
                    className={`truncate text-sm ${!consultation.is_read ? "text-foreground" : "text-muted-foreground"}`}>
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
    </PageShell>
  );
}
