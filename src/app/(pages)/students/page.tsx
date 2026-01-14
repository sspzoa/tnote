"use client";

import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import { useState } from "react";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
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

interface Consultation {
  id: string;
  student_id: string;
  consultation_date: string;
  title: string;
  content: string;
  created_at: string;
  student: {
    id: string;
    name: string;
    phone_number: string;
    school: string | null;
  };
  creator?: {
    id: string;
    name: string;
  } | null;
}

export default function StudentsPage() {
  const { students, isLoading: studentsLoading, error: studentsError } = useStudents();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { consultations, isLoading: consultationsLoading } = useAllConsultations();
  const searchQuery = useAtomValue(searchQueryAtom);
  const showFavoritesOnly = useAtomValue(showFavoritesOnlyAtom);
  const [, setShowCreateModal] = useAtom(showCreateModalAtom);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

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
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            + 학생 추가
          </button>
        }
      />

      {/* 상담 내역 섹션 */}
      <div className="mb-spacing-700">
        <h2 className="mb-spacing-400 font-bold text-content-standard-primary text-heading">최근 상담 내역</h2>
        {consultationsLoading ? (
          <div className="py-spacing-600 text-center text-content-standard-tertiary">로딩중...</div>
        ) : consultations.length === 0 ? (
          <div className="py-spacing-600 text-center text-content-standard-tertiary">상담 내역이 없습니다.</div>
        ) : (
          <div className="h-52 overflow-y-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <table className="w-full">
              <thead className="sticky top-0 bg-components-fill-standard-secondary">
                <tr>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    일시
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    학생
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    제목
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    작성자
                  </th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((consultation) => {
                  const createdAt = new Date(consultation.created_at);
                  const dateStr = consultation.consultation_date;
                  const timeStr = createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <tr
                      key={consultation.id}
                      onClick={() => setSelectedConsultation(consultation)}
                      className="cursor-pointer border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                      <td className="px-spacing-500 py-spacing-400">
                        <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                          {dateStr} {timeStr}
                        </span>
                      </td>
                      <td className="px-spacing-500 py-spacing-400">
                        <div className="font-medium text-body text-content-standard-primary">
                          {consultation.student?.name || "-"}
                        </div>
                      </td>
                      <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                        {consultation.title}
                      </td>
                      <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                        {consultation.creator?.name || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </Container>
  );
}
