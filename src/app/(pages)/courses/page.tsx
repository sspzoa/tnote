"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import { showEndedCoursesAtom } from "./(atoms)/useCoursesStore";
import { showCreateModalAtom } from "./(atoms)/useModalStore";
import CourseCreateModal from "./(components)/CourseCreateModal";
import CourseEditModal from "./(components)/CourseEditModal";
import CourseFilters from "./(components)/CourseFilters";
import CourseList from "./(components)/CourseList";
import EnrollmentModal from "./(components)/EnrollmentModal";
import { useCourses } from "./(hooks)/useCourses";

export default function CoursesPage() {
  const { courses, isLoading, error } = useCourses();
  const setShowCreateModal = useSetAtom(showCreateModalAtom);
  const showEndedCourses = useAtomValue(showEndedCoursesAtom);

  const filteredCourses = useMemo(() => {
    if (showEndedCourses) {
      return courses;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return courses.filter((course) => {
      if (!course.end_date) {
        return true;
      }
      const endDate = new Date(course.end_date);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= today;
    });
  }, [courses, showEndedCourses]);

  if (error) {
    return <ErrorComponent errorMessage="수업 목록을 불러오는데 실패했습니다." />;
  }

  return (
    <Container>
      <Header
        title="수업 관리"
        subtitle={`전체 ${courses.length}개 수업 (${filteredCourses.length}개 표시)`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={<Button onClick={() => setShowCreateModal(true)}>+ 수업 생성</Button>}
      />

      <CourseFilters />

      {isLoading ? (
        <SkeletonTable
          rows={5}
          columns={[
            "w-24",
            { width: "w-12", rounded: true },
            "w-44",
            { width: "w-32", buttons: ["w-32", "w-20"] },
            "action",
          ]}
        />
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          message={showEndedCourses ? "수업이 없습니다." : "진행 중인 수업이 없습니다."}
          actionLabel="첫 수업 만들기"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <CourseList courses={filteredCourses} />
      )}

      <CourseCreateModal />
      <CourseEditModal />
      <EnrollmentModal />
    </Container>
  );
}
