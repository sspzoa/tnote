"use client";

import { useSetAtom } from "jotai";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
          <table className="w-full">
            <thead className="bg-components-fill-standard-secondary">
              <tr>
                <th className="px-spacing-500 py-spacing-400 text-left">
                  <Skeleton className="h-6 w-14" />
                </th>
                <th className="px-spacing-500 py-spacing-400 text-left">
                  <Skeleton className="h-6 w-14" />
                </th>
                <th className="px-spacing-500 py-spacing-400 text-left">
                  <Skeleton className="h-6 w-10" />
                </th>
                <th className="w-24 px-spacing-500 py-spacing-400" />
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-line-divider border-t">
                  <td className="px-spacing-500 py-spacing-400">
                    <Skeleton className="h-6 w-24" />
                  </td>
                  <td className="px-spacing-500 py-spacing-400">
                    <Skeleton className="h-7 w-10 rounded-radius-200" />
                  </td>
                  <td className="px-spacing-500 py-spacing-400">
                    <div className="flex gap-spacing-200">
                      <Skeleton className="h-9 w-28 rounded-radius-300" />
                      <Skeleton className="h-9 w-20 rounded-radius-300" />
                    </div>
                  </td>
                  <td className="px-spacing-500 py-spacing-400">
                    <Skeleton className="ml-auto h-9 w-11 rounded-radius-200" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
