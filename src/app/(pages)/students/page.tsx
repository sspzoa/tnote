"use client";

import { useAtom, useAtomValue } from "jotai";
import { MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import type { ConsultationWithDetails } from "@/shared/types";
import { showCreateModalAtom } from "./(atoms)/useModalStore";
import { searchQueryAtom, showFavoritesOnlyAtom } from "./(atoms)/useStudentsStore";
import ConsultationFormModal from "./(components)/ConsultationFormModal";
import ConsultationListModal from "./(components)/ConsultationListModal";
import StudentCreateModal from "./(components)/StudentCreateModal";
import StudentEditModal from "./(components)/StudentEditModal";
import StudentFilterBar from "./(components)/StudentFilterBar";
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
      <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
        ← 홈으로 돌아가기
      </Link>

      <Header
        title="학생 관리"
        subtitle={`전체 학생 ${students.length}명`}
        action={
          <div className="flex items-center gap-spacing-300">
            <button
              onClick={() => setShowConsultationPanel(true)}
              className="flex items-center gap-spacing-200 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
              <MessageSquare className="size-4" />
              최근 상담
              {consultations.length > 0 && (
                <span className="rounded-full bg-core-accent px-spacing-200 text-footnote text-solid-white">
                  {consultations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
              + 학생 추가
            </button>
          </div>
        }
      />

      <StudentFilterBar courses={courses} />

      {isLoading ? (
        <LoadingComponent />
      ) : filteredStudents.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">
            {students.length === 0 ? "학생이 없습니다." : "검색 결과가 없습니다."}
          </p>
        </div>
      ) : (
        <StudentList students={filteredStudents} />
      )}

      {/* 상담 상세 모달 */}
      <Modal
        isOpen={!!selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
        title={selectedConsultation?.title || ""}
        subtitle={`${selectedConsultation?.student?.name} - ${selectedConsultation?.consultation_date}${selectedConsultation?.creator?.name ? ` (작성자: ${selectedConsultation.creator.name})` : ""}`}
        maxWidth="lg"
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
      <ConsultationListModal />
      <ConsultationFormModal />

      {/* 최근 상담 사이드 패널 */}
      {showConsultationPanel && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 z-40 bg-solid-black/30 transition-opacity"
            onClick={() => setShowConsultationPanel(false)}
          />

          {/* 사이드 패널 */}
          <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-line-outline border-l bg-components-fill-standard-primary shadow-xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between border-line-divider border-b px-spacing-600 py-spacing-500">
              <div>
                <h2 className="font-bold text-content-standard-primary text-heading">최근 상담 내역</h2>
                <p className="text-content-standard-tertiary text-label">최근 50건</p>
              </div>
              <button
                onClick={() => setShowConsultationPanel(false)}
                className="rounded-radius-200 p-spacing-200 transition-colors hover:bg-components-interactive-hover">
                <X className="size-5 text-content-standard-tertiary" />
              </button>
            </div>

            {/* 상담 목록 */}
            <div className="flex-1 overflow-y-auto">
              {consultationsLoading ? (
                <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
              ) : consultations.length === 0 ? (
                <div className="py-spacing-900 text-center text-content-standard-tertiary">상담 내역이 없습니다.</div>
              ) : (
                <div className="divide-y divide-line-divider">
                  {consultations.map((consultation) => {
                    const createdAt = new Date(consultation.created_at);
                    const dateStr = consultation.consultation_date;
                    const timeStr = createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <button
                        key={consultation.id}
                        onClick={() => {
                          setSelectedConsultation(consultation);
                          setShowConsultationPanel(false);
                        }}
                        className="w-full px-spacing-600 py-spacing-400 text-left transition-colors hover:bg-components-interactive-hover">
                        <div className="mb-spacing-100 flex items-center justify-between">
                          <span className="font-medium text-body text-content-standard-primary">
                            {consultation.student?.name || "-"}
                          </span>
                          <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 text-footnote text-solid-blue">
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
