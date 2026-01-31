"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import { TAG_COLOR_CLASSES } from "@/shared/lib/utils/tagColors";
import type { TagColor } from "@/shared/types";
import { useStudentDetail } from "../(hooks)/useStudentDetail";

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

const RETAKE_STATUS_LABELS: Record<string, string> = {
  pending: "대기중",
  completed: "완료",
  absent: "결석",
};

const formatDaysOfWeek = (days: number[] | null): string => {
  if (!days || days.length === 0) return "-";
  return days.map((d) => DAY_NAMES[d]).join(", ");
};

const isTagActive = (startDate: string, endDate: string | null): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  if (today < start) return false;
  if (endDate === null) return true;

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return today <= end;
};

interface RetakeHistoryItem {
  id: string;
  action_type: string;
  previous_date: string | null;
  new_date: string | null;
  previous_status: string | null;
  new_status: string | null;
  previous_management_status: string | null;
  new_management_status: string | null;
  note: string | null;
  created_at: string;
  performed_by: { id: string; name: string } | null;
}

const getActionLabel = (actionType: string) => {
  const labels: Record<string, string> = {
    assign: "할당",
    postpone: "연기",
    absent: "결석",
    complete: "완료",
    status_change: "상태 변경",
    management_status_change: "관리 상태 변경",
    note_update: "메모 수정",
    date_edit: "날짜 수정",
  };
  return labels[actionType] || actionType;
};

const getActionBadgeStyle = (actionType: string) => {
  if (actionType === "assign") return "bg-solid-translucent-purple text-solid-purple";
  if (actionType === "postpone") return "bg-solid-translucent-blue text-solid-blue";
  if (actionType === "absent") return "bg-solid-translucent-red text-solid-red";
  if (actionType === "complete") return "bg-solid-translucent-green text-solid-green";
  if (actionType === "status_change") return "bg-solid-translucent-purple text-solid-purple";
  if (actionType === "management_status_change") return "bg-solid-translucent-yellow text-solid-yellow";
  if (actionType === "date_edit") return "bg-solid-translucent-blue text-solid-blue";
  if (actionType === "note_update") return "bg-components-fill-standard-secondary text-content-standard-secondary";
  return "bg-components-fill-standard-secondary text-content-standard-secondary";
};

const getManagementStatusStyle = (status: string) => {
  const isCompleted = status.includes("완료");
  if (isCompleted) {
    return "bg-solid-translucent-green text-core-status-positive";
  }
  return "bg-solid-translucent-red text-core-status-negative";
};

const StudentDetailSkeleton = () => (
  <div className="space-y-spacing-600">
    <section>
      <Skeleton className="mb-spacing-300 h-6 w-24" />
      <div className="grid grid-cols-2 gap-spacing-300 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-spacing-50">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </section>
    {Array.from({ length: 5 }).map((_, i) => (
      <section key={i}>
        <Skeleton className="mb-spacing-300 h-6 w-32" />
        <div className="space-y-spacing-200 rounded-radius-400 border border-line-outline p-spacing-500">
          {Array.from({ length: 3 }).map((_, j) => (
            <Skeleton key={j} className="h-12 w-full" />
          ))}
        </div>
      </section>
    ))}
  </div>
);

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const { studentDetail, isLoading, error } = useStudentDetail(studentId);
  const [expandedConsultations, setExpandedConsultations] = useState<Set<string>>(new Set());
  const [expandedRetakes, setExpandedRetakes] = useState<Set<string>>(new Set());
  const [retakeHistories, setRetakeHistories] = useState<Record<string, RetakeHistoryItem[]>>({});
  const [loadingRetakeHistories, setLoadingRetakeHistories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (error) {
      alert("학생을 찾을 수 없습니다.");
      router.push("/students");
    }
  }, [error, router]);

  const toggleConsultation = (id: string) => {
    setExpandedConsultations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleRetake = async (retakeId: string) => {
    if (expandedRetakes.has(retakeId)) {
      setExpandedRetakes((prev) => {
        const next = new Set(prev);
        next.delete(retakeId);
        return next;
      });
      return;
    }

    setExpandedRetakes((prev) => new Set(prev).add(retakeId));

    if (!retakeHistories[retakeId] && !loadingRetakeHistories.has(retakeId)) {
      setLoadingRetakeHistories((prev) => new Set(prev).add(retakeId));
      try {
        const response = await fetchWithAuth(`/api/retakes/${retakeId}/history`);
        const data = await response.json();
        setRetakeHistories((prev) => ({ ...prev, [retakeId]: data.data || [] }));
      } catch {
        setRetakeHistories((prev) => ({ ...prev, [retakeId]: [] }));
      } finally {
        setLoadingRetakeHistories((prev) => {
          const next = new Set(prev);
          next.delete(retakeId);
          return next;
        });
      }
    }
  };

  if (isLoading || !studentDetail) {
    return (
      <div className="min-h-screen p-spacing-600 md:p-spacing-800">
        <div className="mx-auto max-w-5xl">
          <Skeleton className="mb-spacing-400 h-6 w-40" />
          <div className="mb-spacing-700 flex items-end justify-between">
            <div className="space-y-spacing-200">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <StudentDetailSkeleton />
        </div>
      </div>
    );
  }

  const activeTags = (studentDetail.student.tags || []).filter((assignment) =>
    isTagActive(assignment.start_date, assignment.end_date),
  );

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-5xl">
        <div className="mb-spacing-700">
          <Link href="/students" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 학생 목록으로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">
                {studentDetail.student.name}
              </h1>
              <p className="text-body text-content-standard-secondary">
                {getGrade(studentDetail.student.birthYear) || "학년 정보 없음"}
                {studentDetail.student.school && ` · ${studentDetail.student.school}`}
              </p>
            </div>
            <Button variant="secondary" onClick={() => router.push("/students")}>
              목록으로
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-spacing-700">
          <section>
            <h2 className="mb-spacing-400 font-semibold text-content-standard-primary text-heading">기본 정보</h2>
            <div className="grid grid-cols-2 gap-spacing-400 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600 md:grid-cols-3">
              <div className="flex flex-col gap-spacing-100">
                <span className="text-content-standard-tertiary text-footnote">이름</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {studentDetail.student.name}
                </span>
              </div>
              <div className="flex flex-col gap-spacing-100">
                <span className="text-content-standard-tertiary text-footnote">전화번호</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {formatPhoneNumber(studentDetail.student.phoneNumber)}
                </span>
              </div>
              <div className="flex flex-col gap-spacing-100">
                <span className="text-content-standard-tertiary text-footnote">학부모 번호</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {studentDetail.student.parentPhoneNumber
                    ? formatPhoneNumber(studentDetail.student.parentPhoneNumber)
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-spacing-100">
                <span className="text-content-standard-tertiary text-footnote">학교</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {studentDetail.student.school || "-"}
                </span>
              </div>
              <div className="flex flex-col gap-spacing-100">
                <span className="text-content-standard-tertiary text-footnote">학년</span>
                {studentDetail.student.birthYear && getGrade(studentDetail.student.birthYear) ? (
                  <span className="w-fit rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                    {getGrade(studentDetail.student.birthYear)}
                  </span>
                ) : (
                  <span className="font-medium text-body text-content-standard-primary">-</span>
                )}
              </div>
              <div className="flex flex-col gap-spacing-100">
                <span className="text-content-standard-tertiary text-footnote">등록일</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {new Date(studentDetail.student.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              {activeTags.length > 0 && (
                <div className="col-span-full flex flex-col gap-spacing-100">
                  <span className="text-content-standard-tertiary text-footnote">태그</span>
                  <div className="flex flex-wrap items-center gap-spacing-100">
                    {activeTags.map((assignment) => {
                      const colorClasses = TAG_COLOR_CLASSES[assignment.tag.color as TagColor];
                      return (
                        <span
                          key={assignment.id}
                          className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${colorClasses.bg} ${colorClasses.text}`}>
                          {assignment.tag.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-spacing-400 font-semibold text-content-standard-primary text-heading">수강 중인 수업</h2>
            {studentDetail.courses.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600 text-center text-body text-content-standard-tertiary">
                수강 중인 수업이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-spacing-400 bg-components-fill-standard-secondary px-spacing-600 py-spacing-500">
                    <div className="flex min-w-0 flex-1 flex-col gap-spacing-100">
                      <span className="truncate font-medium text-body text-content-standard-primary">
                        {course.name}
                      </span>
                      <span className="text-content-standard-tertiary text-footnote">
                        등록: {new Date(course.enrolled_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                      {formatDaysOfWeek(course.days_of_week)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-spacing-400 font-semibold text-content-standard-primary text-heading">시험 성적</h2>
            {studentDetail.examScores.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600 text-center text-body text-content-standard-tertiary">
                시험 성적이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.examScores.map((score) => {
                  const isPassed = score.cutline !== null && score.score >= score.cutline;
                  const isFailed = score.cutline !== null && score.score < score.cutline;

                  return (
                    <div
                      key={score.id}
                      className="flex items-center justify-between gap-spacing-400 bg-components-fill-standard-secondary px-spacing-600 py-spacing-500">
                      <span className="min-w-0 flex-1 truncate font-medium text-body text-content-standard-primary">
                        {score.exam.course.name} - {score.exam.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-spacing-200">
                        <span className="font-medium text-body text-content-standard-primary">
                          {score.score}
                          {score.maxScore !== null && `/${score.maxScore}`}점 · {score.rank}/{score.totalStudents}등
                        </span>
                        <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                          {score.exam.examNumber}회차
                        </span>
                        {isPassed && (
                          <span className="rounded-radius-200 bg-solid-translucent-green px-spacing-200 py-spacing-50 font-medium text-core-status-positive text-footnote">
                            통과
                          </span>
                        )}
                        {isFailed && (
                          <span className="rounded-radius-200 bg-solid-translucent-red px-spacing-200 py-spacing-50 font-medium text-core-status-negative text-footnote">
                            재시험
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-spacing-400 font-semibold text-content-standard-primary text-heading">과제 상태</h2>
            {studentDetail.assignmentHistory.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600 text-center text-body text-content-standard-tertiary">
                과제 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.assignmentHistory.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between gap-spacing-400 bg-components-fill-standard-secondary px-spacing-600 py-spacing-500">
                    <div className="flex min-w-0 flex-1 flex-col gap-spacing-100">
                      <span className="truncate font-medium text-body text-content-standard-primary">
                        {assignment.exam.course.name} - {assignment.exam.name}
                      </span>
                      {assignment.note && (
                        <span className="truncate text-content-standard-tertiary text-footnote">{assignment.note}</span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-spacing-200">
                      <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                        {assignment.exam.examNumber}회차
                      </span>
                      <span
                        className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${
                          assignment.status === "완료"
                            ? "bg-solid-translucent-green text-core-status-positive"
                            : assignment.status === "미흡"
                              ? "bg-solid-translucent-yellow text-core-status-warning"
                              : "bg-solid-translucent-red text-core-status-negative"
                        }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-spacing-400 font-semibold text-content-standard-primary text-heading">클리닉 출석</h2>
            {studentDetail.clinicHistory.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600 text-center text-body text-content-standard-tertiary">
                클리닉 출석 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.clinicHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between gap-spacing-400 bg-components-fill-standard-secondary px-spacing-600 py-spacing-500">
                    <div className="flex min-w-0 flex-1 flex-col gap-spacing-100">
                      <span className="truncate font-medium text-body text-content-standard-primary">
                        {history.clinic.name}
                      </span>
                      {history.note && (
                        <span className="truncate text-content-standard-tertiary text-footnote">{history.note}</span>
                      )}
                    </div>
                    <span className="shrink-0 rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                      {new Date(history.attendanceDate).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-spacing-400 font-semibold text-content-standard-primary text-heading">재시험 이력</h2>
            {studentDetail.retakeHistory.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600 text-center text-body text-content-standard-tertiary">
                재시험 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.retakeHistory.map((retake) => {
                  const isExpanded = expandedRetakes.has(retake.id);
                  const history = retakeHistories[retake.id] || [];
                  const isLoadingHistory = loadingRetakeHistories.has(retake.id);

                  return (
                    <div key={retake.id} className="bg-components-fill-standard-secondary">
                      <button
                        type="button"
                        onClick={() => toggleRetake(retake.id)}
                        className="flex w-full items-center justify-between gap-spacing-400 px-spacing-600 py-spacing-500 text-left transition-colors hover:bg-components-interactive-hover">
                        <div className="flex min-w-0 flex-1 flex-col gap-spacing-100">
                          <span className="truncate font-medium text-body text-content-standard-primary">
                            {retake.exam.course.name} - {retake.exam.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-spacing-200 text-content-standard-tertiary text-footnote">
                            <span>
                              {retake.scheduledDate
                                ? new Date(retake.scheduledDate).toLocaleDateString("ko-KR", {
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "날짜 미정"}
                            </span>
                            {retake.managementStatus && (
                              <span
                                className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${getManagementStatusStyle(retake.managementStatus)}`}>
                                {retake.managementStatus}
                              </span>
                            )}
                            {(retake.postponeCount > 0 || retake.absentCount > 0) && (
                              <span className="text-content-standard-quaternary">
                                {retake.postponeCount > 0 && `연기 ${retake.postponeCount}회`}
                                {retake.postponeCount > 0 && retake.absentCount > 0 && " / "}
                                {retake.absentCount > 0 && `결석 ${retake.absentCount}회`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-spacing-200">
                          <span
                            className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${
                              retake.status === "completed"
                                ? "bg-solid-translucent-green text-core-status-positive"
                                : retake.status === "absent"
                                  ? "bg-solid-translucent-red text-core-status-negative"
                                  : "bg-solid-translucent-yellow text-core-status-warning"
                            }`}>
                            {RETAKE_STATUS_LABELS[retake.status]}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 text-content-standard-tertiary transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>
                      <div
                        className="grid transition-[grid-template-rows] duration-200 ease-out"
                        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}>
                        <div className="overflow-hidden">
                          <div className="border-line-divider border-t bg-components-fill-standard-primary px-spacing-600 py-spacing-500">
                            {isLoadingHistory ? (
                              <div className="space-y-spacing-300">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <Skeleton key={i} className="h-16 w-full" />
                                ))}
                              </div>
                            ) : history.length === 0 ? (
                              <p className="text-center text-content-standard-tertiary text-footnote">
                                이력이 없습니다.
                              </p>
                            ) : (
                              <div className="space-y-spacing-300">
                                {history.map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-400">
                                    <div className="flex items-center justify-between gap-spacing-300">
                                      <div className="flex min-w-0 flex-1 items-center gap-spacing-200">
                                        <span
                                          className={`shrink-0 rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${getActionBadgeStyle(item.action_type)}`}>
                                          {getActionLabel(item.action_type)}
                                        </span>
                                        {item.action_type === "assign" && item.new_date && (
                                          <span className="truncate text-content-standard-primary text-footnote">
                                            예정일: {item.new_date}
                                          </span>
                                        )}
                                        {item.action_type === "assign" && !item.new_date && (
                                          <span className="truncate text-content-standard-tertiary text-footnote">
                                            예정일 미지정
                                          </span>
                                        )}
                                        {(item.action_type === "postpone" ||
                                          item.action_type === "date_edit" ||
                                          item.action_type === "complete") &&
                                          item.new_date && (
                                            <span className="truncate text-content-standard-primary text-footnote">
                                              {item.previous_date || "미지정"} → {item.new_date}
                                            </span>
                                          )}
                                        {item.action_type === "status_change" &&
                                          item.previous_status &&
                                          item.new_status && (
                                            <span className="truncate text-content-standard-primary text-footnote">
                                              {item.previous_status === "pending"
                                                ? "대기중"
                                                : item.previous_status === "completed"
                                                  ? "완료"
                                                  : "결석"}{" "}
                                              →{" "}
                                              {item.new_status === "pending"
                                                ? "대기중"
                                                : item.new_status === "completed"
                                                  ? "완료"
                                                  : "결석"}
                                            </span>
                                          )}
                                        {item.action_type === "management_status_change" &&
                                          item.previous_management_status &&
                                          item.new_management_status && (
                                            <span className="truncate text-content-standard-primary text-footnote">
                                              {item.previous_management_status} → {item.new_management_status}
                                            </span>
                                          )}
                                      </div>
                                      <div className="flex shrink-0 flex-col items-end gap-spacing-50">
                                        <span className="text-caption text-content-standard-quaternary">
                                          {new Date(item.created_at).toLocaleString("ko-KR")}
                                        </span>
                                        {item.performed_by && (
                                          <span className="text-caption text-content-standard-tertiary">
                                            {item.performed_by.name}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {item.note && (
                                      <p className="mt-spacing-200 text-content-standard-secondary text-footnote">
                                        {item.note}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-spacing-400 font-semibold text-content-standard-primary text-heading">상담 기록</h2>
            {studentDetail.consultationHistory.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600 text-center text-body text-content-standard-tertiary">
                상담 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.consultationHistory.map((consultation) => {
                  const isExpanded = expandedConsultations.has(consultation.id);

                  return (
                    <div key={consultation.id} className="bg-components-fill-standard-secondary">
                      <button
                        type="button"
                        onClick={() => toggleConsultation(consultation.id)}
                        className="flex w-full items-center justify-between gap-spacing-400 px-spacing-600 py-spacing-500 text-left transition-colors hover:bg-components-interactive-hover">
                        <span className="min-w-0 flex-1 truncate font-medium text-body text-content-standard-primary">
                          {consultation.title}
                        </span>
                        <div className="flex shrink-0 items-center gap-spacing-200">
                          {consultation.creator && (
                            <span className="text-content-standard-tertiary text-footnote">
                              {consultation.creator.name}
                            </span>
                          )}
                          <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                            {new Date(consultation.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 text-content-standard-tertiary transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>
                      <div
                        className="grid transition-[grid-template-rows] duration-200 ease-out"
                        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}>
                        <div className="overflow-hidden">
                          <div className="border-line-divider border-t px-spacing-600 py-spacing-500">
                            <p className="whitespace-pre-wrap text-content-standard-secondary text-footnote">
                              {consultation.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-spacing-400 font-semibold text-content-standard-primary text-heading">문자 발송 기록</h2>
            {studentDetail.messageHistory.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600 text-center text-body text-content-standard-tertiary">
                문자 발송 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.messageHistory.map((message) => (
                  <div
                    key={message.id}
                    className="flex flex-col gap-spacing-200 bg-components-fill-standard-secondary px-spacing-600 py-spacing-500">
                    <div className="flex items-center justify-between gap-spacing-400">
                      <div className="flex items-center gap-spacing-200">
                        <span
                          className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${
                            message.isSuccess
                              ? "bg-solid-translucent-green text-core-status-positive"
                              : "bg-solid-translucent-red text-core-status-negative"
                          }`}>
                          {message.isSuccess ? "발송 성공" : "발송 실패"}
                        </span>
                        <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                          {message.recipientType === "student" ? "학생" : "학부모"}
                        </span>
                        <span className="text-content-standard-tertiary text-footnote">
                          {formatPhoneNumber(message.recipientPhone)}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-spacing-200">
                        {message.sender && (
                          <span className="text-content-standard-tertiary text-footnote">{message.sender.name}</span>
                        )}
                        <span className="text-content-standard-quaternary text-footnote">
                          {new Date(message.sentAt).toLocaleDateString("ko-KR")}{" "}
                          {new Date(message.sentAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-content-standard-secondary text-footnote">
                      {message.messageContent}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
