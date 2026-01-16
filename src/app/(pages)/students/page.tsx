"use client";

import { useAtom, useAtomValue } from "jotai";
import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { Modal } from "@/shared/components/ui/modal";
import type { ConsultationWithDetails } from "@/shared/types";
import { showCreateModalAtom } from "./(atoms)/useModalStore";
import { searchQueryAtom, showFavoritesOnlyAtom } from "./(atoms)/useStudentsStore";
import ConsultationFormModal from "./(components)/ConsultationFormModal";
import ConsultationListModal from "./(components)/ConsultationListModal";
import StudentCreateModal from "./(components)/StudentCreateModal";
import StudentEditModal from "./(components)/StudentEditModal";
import StudentFilterBar from "./(components)/StudentFilterBar";
import StudentInfoModal from "./(components)/StudentInfoModal";
import StudentList from "./(components)/StudentList";
import { useAllConsultations } from "./(hooks)/useAllConsultations";
import { useCourses } from "./(hooks)/useCourses";
import { useStudents } from "./(hooks)/useStudents";

export default function StudentsPage() {
  const { students, isLoading: studentsLoading, error: studentsError } = useStudents();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { consultations, isLoading: consultationsLoading } = useAllConsultations();
  const searchQuery = useAtomValue(searchQueryAtom);
  const showFavoritesOnly = useAtomValue(showFavoritesOnlyAtom);
  const [, setShowCreateModal] = useAtom(showCreateModalAtom);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithDetails | null>(null);
  const [showConsultationPanel, setShowConsultationPanel] = useState(false);

  const filteredStudents = students
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((student) => !showFavoritesOnly || student.is_favorite);

  const isLoading = studentsLoading || coursesLoading;

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

      <div className="flex flex-col gap-spacing-600">
        <StudentFilterBar courses={courses} />

        {isLoading ? (
          <LoadingComponent />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            message={students.length === 0 ? "학생이 없습니다." : "검색 결과가 없습니다."}
            actionLabel={students.length === 0 ? "학생 추가" : undefined}
            onAction={students.length === 0 ? () => setShowCreateModal(true) : undefined}
          />
        ) : (
          <StudentList students={filteredStudents} />
        )}
      </div>

      <Modal
        isOpen={!!selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
        title={selectedConsultation?.title || ""}
        subtitle={`${selectedConsultation?.student?.name} - ${selectedConsultation?.created_at ? new Date(selectedConsultation.created_at).toLocaleDateString("ko-KR") : ""}${selectedConsultation?.creator?.name ? ` (작성자: ${selectedConsultation.creator.name})` : ""}`}
        maxWidth="2xl"
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

      {showConsultationPanel && (
        <>
          <div
            className="fixed inset-0 z-40 bg-solid-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowConsultationPanel(false)}
          />

          <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-line-outline border-l bg-components-fill-standard-primary">
            <div className="flex items-center justify-between border-line-divider border-b px-spacing-600 py-spacing-500">
              <div>
                <h2 className="font-bold text-content-standard-primary text-heading">최근 상담 내역</h2>
                <p className="text-content-standard-tertiary text-label">최근 50건</p>
              </div>
              <button
                onClick={() => setShowConsultationPanel(false)}
                className="rounded-radius-200 p-spacing-200 transition-all duration-150 hover:bg-core-accent-translucent hover:text-core-accent">
                <X className="size-5 text-content-standard-tertiary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {consultationsLoading ? (
                <div className="flex flex-col items-center justify-center py-spacing-900">
                  <div className="mb-spacing-300 size-8 animate-spin rounded-full border-2 border-core-accent border-t-transparent" />
                  <span className="text-content-standard-tertiary text-label">로딩중...</span>
                </div>
              ) : consultations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-spacing-900">
                  <div className="mb-spacing-300 flex size-12 items-center justify-center rounded-full bg-core-accent-translucent">
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
                        className="w-full px-spacing-600 py-spacing-400 text-left transition-all duration-150 hover:bg-core-accent-translucent/50">
                        <div className="mb-spacing-100 flex items-center justify-between">
                          <span className="font-medium text-body text-content-standard-primary">
                            {consultation.student?.name || "-"}
                          </span>
                          <span className="rounded-radius-200 border border-core-accent/20 bg-core-accent-translucent px-spacing-200 py-spacing-50 text-core-accent text-footnote">
                            {dateStr}
                          </span>
                        </div>
                        <div className="mb-spacing-100 truncate text-body text-content-standard-secondary">
                          {consultation.title}
                        </div>
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
            </div>
          </div>
        </>
      )}
    </Container>
  );
}
