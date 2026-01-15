"use client";

import { useSetAtom } from "jotai";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { showCreateModalAtom } from "./(atoms)/useModalStore";
import CourseCreateModal from "./(components)/CourseCreateModal";
import CourseEditModal from "./(components)/CourseEditModal";
import CourseList from "./(components)/CourseList";
import EnrollmentModal from "./(components)/EnrollmentModal";
import { useCourses } from "./(hooks)/useCourses";

export default function CoursesPage() {
  const { courses, isLoading, error } = useCourses();
  const setShowCreateModal = useSetAtom(showCreateModalAtom);

  if (error) {
    return <ErrorComponent errorMessage="수업 목록을 불러오는데 실패했습니다." />;
  }

  return (
    <Container>
      <Header
        title="수업 관리"
        subtitle={`전체 ${courses.length}개 수업`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={<Button onClick={() => setShowCreateModal(true)}>+ 수업 생성</Button>}
      />

      {isLoading ? (
        <LoadingComponent />
      ) : courses.length === 0 ? (
        <EmptyState message="수업이 없습니다." actionLabel="첫 수업 만들기" onAction={() => setShowCreateModal(true)} />
      ) : (
        <CourseList courses={courses} />
      )}

      <CourseCreateModal />
      <CourseEditModal />
      <EnrollmentModal />
    </Container>
  );
}
