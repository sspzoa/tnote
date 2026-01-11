"use client";

import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { showCreateModalAtom } from "./(atoms)/useModalStore";
import { searchQueryAtom, showFavoritesOnlyAtom } from "./(atoms)/useStudentsStore";
import ConsultationFormModal from "./(components)/ConsultationFormModal";
import ConsultationListModal from "./(components)/ConsultationListModal";
import StudentCreateModal from "./(components)/StudentCreateModal";
import StudentEditModal from "./(components)/StudentEditModal";
import StudentFilterBar from "./(components)/StudentFilterBar";
import StudentList from "./(components)/StudentList";
import { useCourses } from "./(hooks)/useCourses";
import { useStudents } from "./(hooks)/useStudents";

export default function StudentsPage() {
  const { students, isLoading: studentsLoading, error: studentsError } = useStudents();
  const { courses, isLoading: coursesLoading } = useCourses();
  const searchQuery = useAtomValue(searchQueryAtom);
  const showFavoritesOnly = useAtomValue(showFavoritesOnlyAtom);
  const [, setShowCreateModal] = useAtom(showCreateModalAtom);

  const filteredStudents = students
    .filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((student) => !showFavoritesOnly || student.is_favorite);

  if (studentsLoading || coursesLoading) {
    return <LoadingComponent />;
  }

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

      <StudentFilterBar courses={courses} />

      {filteredStudents.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">
            {students.length === 0 ? "학생이 없습니다." : "검색 결과가 없습니다."}
          </p>
        </div>
      ) : (
        <StudentList students={filteredStudents} />
      )}

      <StudentCreateModal />
      <StudentEditModal />
      <ConsultationListModal />
      <ConsultationFormModal />
    </Container>
  );
}
