"use client";

import { useSetAtom } from "jotai";
import Link from "next/link";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { showCreateModalAtom } from "./(atoms)/useModalStore";
import CourseCreateModal from "./(components)/CourseCreateModal";
import CourseEditModal from "./(components)/CourseEditModal";
import CourseList from "./(components)/CourseList";
import EnrollmentModal from "./(components)/EnrollmentModal";
import { useCourses } from "./(hooks)/useCourses";

export default function CoursesPage() {
  const { courses, isLoading, error } = useCourses();
  const setShowCreateModal = useSetAtom(showCreateModalAtom);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent errorMessage="수업 목록을 불러오는데 실패했습니다." />;
  }

  return (
    <Container>
      <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
        ← 홈으로 돌아가기
      </Link>

      <Header
        title="수업 관리"
        subtitle={`전체 ${courses.length}개 수업`}
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            + 수업 생성
          </button>
        }
      />

      {courses.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">수업이 없습니다.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-spacing-500 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            첫 수업 만들기
          </button>
        </div>
      ) : (
        <CourseList courses={courses} />
      )}

      <CourseCreateModal />
      <CourseEditModal />
      <EnrollmentModal />
    </Container>
  );
}
