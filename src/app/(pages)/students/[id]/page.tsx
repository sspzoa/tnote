"use client";

import {
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  FileText,
  MessageSquare,
  RefreshCw,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import { TAG_COLOR_CLASSES } from "@/shared/lib/utils/tagColors";
import type { TagColor } from "@/shared/types";
import { useStudentDetail } from "../(hooks)/useStudentDetail";

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

const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  colorClass: string;
}) => (
  <div className="flex items-center gap-spacing-400 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 transition-all hover:border-line-outline-strong">
    <div className={`rounded-radius-300 p-spacing-300 ${colorClass}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex flex-col">
      <span className="text-content-standard-tertiary text-footnote">{label}</span>
      <span className="font-semibold text-content-standard-primary text-heading">{value}</span>
      {subValue && <span className="text-caption text-content-standard-quaternary">{subValue}</span>}
    </div>
  </div>
);

const DashboardCard = ({
  title,
  icon: Icon,
  children,
  emptyMessage,
  isEmpty,
  scrollable,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  scrollable?: boolean;
}) => (
  <div className="flex flex-col overflow-hidden rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
    <div className="flex items-center gap-spacing-200 border-b border-line-divider bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
      <Icon className="h-4 w-4 text-content-standard-tertiary" />
      <h3 className="font-semibold text-body text-content-standard-primary">{title}</h3>
    </div>
    {isEmpty ? (
      <div className="flex flex-col items-center justify-center gap-spacing-200 py-spacing-800 text-content-standard-tertiary">
        <Icon className="h-8 w-8 opacity-30" />
        <span className="text-footnote">{emptyMessage}</span>
      </div>
    ) : (
      <div className={`divide-y divide-line-divider ${scrollable ? "max-h-[400px] overflow-y-auto" : ""}`}>
        {children}
      </div>
    )}
  </div>
);

const ScoreProgress = ({
  score,
  maxScore,
  cutline,
}: {
  score: number;
  maxScore: number | null;
  cutline: number | null;
}) => {
  const max = maxScore ?? 100;
  const percentage = Math.min((score / max) * 100, 100);
  const cutlinePercentage = cutline ? (cutline / max) * 100 : null;
  const isPassed = cutline !== null && score >= cutline;

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-radius-full bg-components-fill-standard-tertiary">
      <div
        className={`absolute left-0 top-0 h-full rounded-radius-full transition-all ${
          isPassed ? "bg-solid-green" : cutline !== null ? "bg-solid-red" : "bg-solid-blue"
        }`}
        style={{ width: `${percentage}%` }}
      />
      {cutlinePercentage !== null && (
        <div
          className="absolute top-0 h-full w-0.5 bg-content-standard-tertiary"
          style={{ left: `${cutlinePercentage}%` }}
        />
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-spacing-600">
    <div className="flex items-start gap-spacing-500 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-600">
      <Skeleton className="h-16 w-16 rounded-radius-full" />
      <div className="flex-1 space-y-spacing-200">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-spacing-200">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-spacing-400 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-radius-400" />
      ))}
    </div>

    <div className="grid gap-spacing-500 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-radius-400" />
      ))}
    </div>
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
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-spacing-500 h-5 w-40" />
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  const activeTags = (studentDetail.student.tags || []).filter((assignment) =>
    isTagActive(assignment.start_date, assignment.end_date),
  );
  const courseCount = studentDetail.courses.length;
  const avgScore =
    studentDetail.examScores.length > 0
      ? Math.round(studentDetail.examScores.reduce((sum, s) => sum + s.score, 0) / studentDetail.examScores.length)
      : 0;
  const avgRank =
    studentDetail.examScores.length > 0
      ? (studentDetail.examScores.reduce((sum, s) => sum + s.rank, 0) / studentDetail.examScores.length).toFixed(1)
      : "-";
  const pendingRetakes = studentDetail.retakeHistory.filter((r) => r.status === "pending").length;
  const totalRetakes = studentDetail.retakeHistory.length;
  const consultationCount = studentDetail.consultationHistory.length;

  return (
    <div className="min-h-screen bg-background-standard-secondary p-spacing-500 md:p-spacing-700">
      <div className="mx-auto max-w-7xl">
        <div className="mb-spacing-700">
          <Link href="/students" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 학생 목록으로 돌아가기
          </Link>
          <div className="mb-spacing-200 flex items-center gap-spacing-300">
            <h1 className="font-bold text-content-standard-primary text-title">{studentDetail.student.name}</h1>
            {studentDetail.student.birthYear && getGrade(studentDetail.student.birthYear) && (
              <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                {getGrade(studentDetail.student.birthYear)}
              </span>
            )}
          </div>
          <p className="mb-spacing-200 text-body text-content-standard-secondary">
            {studentDetail.student.school || "학교 정보 없음"}
          </p>
          <div className="mb-spacing-200 flex flex-wrap items-center gap-spacing-300 text-footnote text-content-standard-tertiary">
            <span>본인: {formatPhoneNumber(studentDetail.student.phoneNumber)}</span>
            {studentDetail.student.parentPhoneNumber && (
              <span>학부모: {formatPhoneNumber(studentDetail.student.parentPhoneNumber)}</span>
            )}
          </div>
          {activeTags.length > 0 && (
            <div className="flex flex-wrap gap-spacing-100">
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
          )}
        </div>

        <div className="mb-spacing-600 grid grid-cols-2 gap-spacing-400 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="수강 중인 수업"
            value={courseCount}
            subValue={courseCount > 0 ? "개 수업" : undefined}
            colorClass="bg-solid-translucent-blue text-solid-blue"
          />
          <StatCard
            icon={TrendingUp}
            label="시험 평균"
            value={studentDetail.examScores.length > 0 ? `${avgScore}점` : "-"}
            subValue={studentDetail.examScores.length > 0 ? `평균 ${avgRank}등` : "기록 없음"}
            colorClass="bg-solid-translucent-green text-solid-green"
          />
          <StatCard
            icon={RefreshCw}
            label="재시험 현황"
            value={pendingRetakes}
            subValue={`대기중 / 전체 ${totalRetakes}건`}
            colorClass="bg-solid-translucent-yellow text-solid-yellow"
          />
          <StatCard
            icon={MessageSquare}
            label="상담 기록"
            value={consultationCount}
            subValue={consultationCount > 0 ? "건 기록" : undefined}
            colorClass="bg-solid-translucent-purple text-solid-purple"
          />
        </div>

        <DashboardCard
          title="수강 중인 수업"
          icon={BookOpen}
          isEmpty={studentDetail.courses.length === 0}
          emptyMessage="수강 중인 수업이 없습니다.">
          <div className="grid gap-spacing-300 p-spacing-400 sm:grid-cols-2 lg:grid-cols-3">
            {studentDetail.courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between gap-spacing-300 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300">
                <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                  <span className="truncate font-medium text-body text-content-standard-primary">{course.name}</span>
                  <span className="text-caption text-content-standard-quaternary">
                    등록: {new Date(course.enrolled_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <span className="shrink-0 rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                  {formatDaysOfWeek(course.days_of_week)}
                </span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <div className="mb-spacing-600 mt-spacing-600 grid gap-spacing-500 lg:grid-cols-3">
          <DashboardCard
            title="시험 성적"
            icon={TrendingUp}
            isEmpty={studentDetail.examScores.length === 0}
            emptyMessage="시험 성적이 없습니다."
            scrollable>
            {studentDetail.examScores.map((score) => {
              const isPassed = score.cutline !== null && score.score >= score.cutline;
              const isFailed = score.cutline !== null && score.score < score.cutline;

              return (
                <div key={score.id} className="flex flex-col gap-spacing-200 px-spacing-500 py-spacing-400">
                  <div className="flex items-center justify-between gap-spacing-300">
                    <span className="min-w-0 flex-1 truncate text-body text-content-standard-primary">
                      {score.exam.course.name} - {score.exam.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-spacing-200">
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
                  <div className="flex items-center gap-spacing-300">
                    <ScoreProgress score={score.score} maxScore={score.maxScore} cutline={score.cutline} />
                    <span className="shrink-0 font-medium text-footnote text-content-standard-secondary">
                      {score.score}
                      {score.maxScore !== null && `/${score.maxScore}`}점
                    </span>
                  </div>
                  <div className="flex items-center gap-spacing-200 text-caption text-content-standard-quaternary">
                    <span>
                      {score.rank}/{score.totalStudents}등
                    </span>
                    <span className="rounded-radius-200 bg-components-fill-standard-tertiary px-spacing-150 py-spacing-50">
                      {score.exam.examNumber}회차
                    </span>
                  </div>
                </div>
              );
            })}
          </DashboardCard>

          <DashboardCard
            title="과제 상태"
            icon={ClipboardCheck}
            isEmpty={studentDetail.assignmentHistory.length === 0}
            emptyMessage="과제 기록이 없습니다."
            scrollable>
            {studentDetail.assignmentHistory.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between gap-spacing-300 px-spacing-500 py-spacing-400 transition-colors hover:bg-components-fill-standard-secondary">
                <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                  <span className="truncate font-medium text-body text-content-standard-primary">
                    {assignment.exam.course.name} - {assignment.exam.name}
                  </span>
                  {assignment.note && (
                    <span className="truncate text-caption text-content-standard-quaternary">{assignment.note}</span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-spacing-200">
                  <span className="rounded-radius-200 bg-components-fill-standard-tertiary px-spacing-150 py-spacing-50 font-medium text-caption text-content-standard-secondary">
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
          </DashboardCard>

          <DashboardCard
            title="재시험 이력"
            icon={RefreshCw}
            isEmpty={studentDetail.retakeHistory.length === 0}
            emptyMessage="재시험 기록이 없습니다."
            scrollable>
            {studentDetail.retakeHistory.map((retake) => {
              const isExpanded = expandedRetakes.has(retake.id);
              const history = retakeHistories[retake.id] || [];
              const isLoadingHistory = loadingRetakeHistories.has(retake.id);

              return (
                <div key={retake.id}>
                  <button
                    type="button"
                    onClick={() => toggleRetake(retake.id)}
                    className="flex w-full items-center justify-between gap-spacing-300 px-spacing-500 py-spacing-400 text-left transition-colors hover:bg-components-fill-standard-secondary">
                    <div className="flex min-w-0 flex-1 flex-col gap-spacing-100">
                      <span className="truncate font-medium text-body text-content-standard-primary">
                        {retake.exam.course.name} - {retake.exam.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-spacing-200 text-caption text-content-standard-quaternary">
                        <span>
                          {retake.scheduledDate
                            ? new Date(retake.scheduledDate).toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                              })
                            : "날짜 미정"}
                        </span>
                        {retake.managementStatus && (
                          <span
                            className={`rounded-radius-200 px-spacing-150 py-spacing-50 font-medium text-caption ${getManagementStatusStyle(retake.managementStatus)}`}>
                            {retake.managementStatus}
                          </span>
                        )}
                        {(retake.postponeCount > 0 || retake.absentCount > 0) && (
                          <span>
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
                        className={`h-4 w-4 text-content-standard-tertiary transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  <div
                    className="grid transition-[grid-template-rows] duration-200 ease-out"
                    style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <div className="border-t border-line-divider bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                        {isLoadingHistory ? (
                          <div className="space-y-spacing-200">
                            {Array.from({ length: 2 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                        ) : history.length === 0 ? (
                          <p className="text-center text-caption text-content-standard-tertiary">이력이 없습니다.</p>
                        ) : (
                          <div className="space-y-spacing-200">
                            {history.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-radius-300 border border-line-outline bg-components-fill-standard-primary p-spacing-300">
                                <div className="flex items-center justify-between gap-spacing-200">
                                  <div className="flex min-w-0 flex-1 items-center gap-spacing-200">
                                    <span
                                      className={`shrink-0 rounded-radius-200 px-spacing-150 py-spacing-50 font-medium text-caption ${getActionBadgeStyle(item.action_type)}`}>
                                      {getActionLabel(item.action_type)}
                                    </span>
                                    {item.action_type === "assign" && item.new_date && (
                                      <span className="truncate text-caption text-content-standard-primary">
                                        예정일: {item.new_date}
                                      </span>
                                    )}
                                    {item.action_type === "assign" && !item.new_date && (
                                      <span className="truncate text-caption text-content-standard-tertiary">
                                        예정일 미지정
                                      </span>
                                    )}
                                    {(item.action_type === "postpone" ||
                                      item.action_type === "date_edit" ||
                                      item.action_type === "complete") &&
                                      item.new_date && (
                                        <span className="truncate text-caption text-content-standard-primary">
                                          {item.previous_date || "미지정"} → {item.new_date}
                                        </span>
                                      )}
                                    {item.action_type === "status_change" &&
                                      item.previous_status &&
                                      item.new_status && (
                                        <span className="truncate text-caption text-content-standard-primary">
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
                                        <span className="truncate text-caption text-content-standard-primary">
                                          {item.previous_management_status} → {item.new_management_status}
                                        </span>
                                      )}
                                  </div>
                                  <div className="flex shrink-0 flex-col items-end">
                                    <span className="text-caption text-content-standard-quaternary">
                                      {new Date(item.created_at).toLocaleDateString("ko-KR")}
                                    </span>
                                    {item.performed_by && (
                                      <span className="text-caption text-content-standard-tertiary">
                                        {item.performed_by.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {item.note && (
                                  <p className="mt-spacing-100 text-caption text-content-standard-secondary">
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
          </DashboardCard>
        </div>

        <div className="space-y-spacing-500">
          <DashboardCard
            title="클리닉 출석"
            icon={Stethoscope}
            isEmpty={studentDetail.clinicHistory.length === 0}
            emptyMessage="클리닉 출석 기록이 없습니다.">
            <div className="grid gap-spacing-300 p-spacing-400 sm:grid-cols-2 lg:grid-cols-3">
              {studentDetail.clinicHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between gap-spacing-300 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300">
                  <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                    <span className="truncate font-medium text-body text-content-standard-primary">
                      {history.clinic.name}
                    </span>
                    {history.note && (
                      <span className="truncate text-caption text-content-standard-quaternary">{history.note}</span>
                    )}
                  </div>
                  <span className="shrink-0 rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                    {new Date(history.attendanceDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard
            title="상담 기록"
            icon={MessageSquare}
            isEmpty={studentDetail.consultationHistory.length === 0}
            emptyMessage="상담 기록이 없습니다.">
            {studentDetail.consultationHistory.map((consultation) => {
              const isExpanded = expandedConsultations.has(consultation.id);

              return (
                <div key={consultation.id}>
                  <button
                    type="button"
                    onClick={() => toggleConsultation(consultation.id)}
                    className="flex w-full items-center justify-between gap-spacing-300 px-spacing-500 py-spacing-400 text-left transition-colors hover:bg-components-fill-standard-secondary">
                    <span className="min-w-0 flex-1 truncate font-medium text-body text-content-standard-primary">
                      {consultation.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-spacing-200">
                      {consultation.creator && (
                        <span className="text-caption text-content-standard-tertiary">{consultation.creator.name}</span>
                      )}
                      <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                        {new Date(consultation.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-content-standard-tertiary transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-200 ease-out"
                    style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <div className="border-t border-line-divider px-spacing-500 py-spacing-400">
                        <p className="whitespace-pre-wrap text-body text-content-standard-secondary">
                          {consultation.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </DashboardCard>

          <DashboardCard
            title="문자 발송 기록"
            icon={FileText}
            isEmpty={studentDetail.messageHistory.length === 0}
            emptyMessage="문자 발송 기록이 없습니다.">
            {studentDetail.messageHistory.map((message) => (
              <div key={message.id} className="flex flex-col gap-spacing-200 px-spacing-500 py-spacing-400">
                <div className="flex items-center justify-between gap-spacing-300">
                  <div className="flex items-center gap-spacing-200">
                    <span
                      className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${
                        message.isSuccess
                          ? "bg-solid-translucent-green text-core-status-positive"
                          : "bg-solid-translucent-red text-core-status-negative"
                      }`}>
                      {message.isSuccess ? "성공" : "실패"}
                    </span>
                    <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 font-medium text-footnote text-solid-blue">
                      {message.recipientType === "student" ? "학생" : "학부모"}
                    </span>
                    <span className="text-caption text-content-standard-tertiary">
                      {formatPhoneNumber(message.recipientPhone)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-spacing-200">
                    {message.sender && (
                      <span className="text-caption text-content-standard-tertiary">{message.sender.name}</span>
                    )}
                    <span className="text-caption text-content-standard-quaternary">
                      {new Date(message.sentAt).toLocaleDateString("ko-KR")}{" "}
                      {new Date(message.sentAt).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <p className="line-clamp-2 whitespace-pre-wrap text-footnote text-content-standard-secondary">
                  {message.messageContent}
                </p>
              </div>
            ))}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
