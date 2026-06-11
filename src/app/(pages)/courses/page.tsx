"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import { PageShell } from "@/shared/components/common/PageShell";
import { Button } from "@/shared/components/ui/button";
import { CollectionView } from "@/shared/components/ui/collectionView";
import { EmptyState } from "@/shared/components/ui/emptyState";
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

  const subtitle = `전체 ${courses.length}개 수업 (${filteredCourses.length}개 표시)`;

  const actions = (
    <Button size="sm" onClick={() => setShowCreateModal(true)}>
      + 수업 생성
    </Button>
  );

  if (error) {
    return (
      <PageShell title="수업 관리" subtitle={subtitle} actions={actions}>
        <ErrorComponent errorMessage="수업 목록을 불러오는데 실패했습니다." />
      </PageShell>
    );
  }

  const emptyNode =
    courses.length === 0 ? (
      <EmptyState
        tone="courses"
        message="수업이 없습니다."
        subtitle="첫 수업을 만들어 학생을 등록해 보세요."
        actionLabel="첫 수업 만들기"
        onAction={() => setShowCreateModal(true)}
      />
    ) : (
      <EmptyState
        tone="courses"
        message={showEndedCourses ? "조건에 맞는 수업이 없어요" : "진행 중인 수업이 없습니다."}
        subtitle="필터를 조정해 보세요."
      />
    );

  return (
    <PageShell title="수업 관리" subtitle={subtitle} actions={actions}>
      <CollectionView filters={<CourseFilters />}>
        <CourseList courses={filteredCourses} isLoading={isLoading} empty={emptyNode} />
      </CollectionView>

      <CourseCreateModal />
      <CourseEditModal />
      <EnrollmentModal />
    </PageShell>
  );
}
