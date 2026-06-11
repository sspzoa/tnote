"use client";

import {
  BookOpen,
  Check,
  FileCheck,
  FileText,
  MessageSquare,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { DetailGrid, DetailHeader } from "@/shared/components/common/DetailLayout";
import { PageShell } from "@/shared/components/common/PageShell";
import { Badge } from "@/shared/components/ui/badge";
import { SectionCard } from "@/shared/components/ui/sectionCard";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { StatStrip } from "@/shared/components/ui/statStrip";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { useToast } from "@/shared/hooks/useToast";
import { cn } from "@/shared/lib/utils/cn";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import type { AssignmentHistoryInfo, ExamScoreInfo, RetakeHistoryInfo } from "../(hooks)/useStudentDetail";
import { useStudentDetail } from "../(hooks)/useStudentDetail";
import {
  ConsultationCard,
  DashboardCard,
  DashboardSkeleton,
  formatDaysOfWeek,
  isTagActive,
  ScoreTrendChart,
} from "./(components)";

const assignmentStatusConfig: Record<string, { variant: "success" | "warning" | "danger" | "info"; label: string }> = {
  완료: { variant: "success", label: "완료" },
  미흡: { variant: "danger", label: "미흡" },
  미제출: { variant: "danger", label: "미제출" },
  결석: { variant: "danger", label: "결석" },
  검사예정: { variant: "warning", label: "검사예정" },
};

const retakeStatusConfig: Record<string, { variant: "warning" | "success" | "danger"; label: string }> = {
  pending: { variant: "warning", label: "대기중" },
  completed: { variant: "success", label: "완료" },
  absent: { variant: "danger", label: "결석" },
};

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  absent: 1,
  insufficient: 2,
  not_submitted: 3,
  completed: 4,
};

type ScoreSortKey = "exam" | "score" | "rank" | "average" | "median" | "highest";
type RetakeSortKey = "exam" | "scheduledDate" | "status";

const ExamScoreTable = ({ examScores }: { examScores: ExamScoreInfo[] }) => {
  const comparators = useMemo(
    () => ({
      exam: (a: ExamScoreInfo, b: ExamScoreInfo) => a.exam.examNumber - b.exam.examNumber,
      score: (a: ExamScoreInfo, b: ExamScoreInfo) => a.score - b.score,
      rank: (a: ExamScoreInfo, b: ExamScoreInfo) => a.rank - b.rank,
      average: (a: ExamScoreInfo, b: ExamScoreInfo) => a.average - b.average,
      median: (a: ExamScoreInfo, b: ExamScoreInfo) => a.median - b.median,
      highest: (a: ExamScoreInfo, b: ExamScoreInfo) => a.highest - b.highest,
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<ExamScoreInfo, ScoreSortKey>({
    data: examScores,
    comparators,
    defaultSort: { key: "exam", direction: "desc" },
  });

  const trendData = [...examScores]
    .filter((s) => s.maxScore && s.maxScore > 0)
    .sort((a, b) => a.exam.examNumber - b.exam.examNumber)
    .map((s) => ({ name: `${s.exam.examNumber}회`, value: Math.round((s.score / (s.maxScore as number)) * 100) }));

  return (
    <section className="flex flex-col gap-6">
      {trendData.length >= 2 && (
        <DashboardCard title="성적 추이" icon={TrendingUp} noPadding>
          <ScoreTrendChart data={trendData} />
        </DashboardCard>
      )}
      <DashboardCard
        title="시험 성적"
        icon={TrendingUp}
        isEmpty={examScores.length === 0}
        emptyMessage="시험 기록이 없습니다."
        noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <SortableHeader
                  label="시험"
                  sortKey="exam"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <SortableHeader
                  label="점수"
                  sortKey="score"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <SortableHeader
                  label="등수"
                  sortKey="rank"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <SortableHeader
                  label="평균"
                  sortKey="average"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <SortableHeader
                  label="중앙값"
                  sortKey="median"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <SortableHeader
                  label="최고점"
                  sortKey="highest"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <th className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs">
                  결과
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((score) => {
                const passed = score.cutline != null && score.score >= score.cutline;
                const failed = score.cutline != null && score.score < score.cutline;
                return (
                  <tr key={score.id} className="border-border border-t transition-colors hover:bg-muted/50">
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <div className="text-foreground text-sm">{score.exam.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {score.exam.course.name} {score.exam.examNumber}회차
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className={`font-medium text-sm ${failed ? "text-destructive" : "text-foreground"}`}>
                        {score.score}
                        {score.maxScore != null && <span className="text-muted-foreground">/{score.maxScore}</span>}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="text-foreground text-sm">
                        {score.rank}
                        <span className="text-muted-foreground">/{score.totalStudents}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="text-foreground text-sm">{score.average}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="text-foreground text-sm">{score.median}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="text-foreground text-sm">{score.highest}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {passed && (
                        <Badge variant="success" size="sm">
                          통과
                        </Badge>
                      )}
                      {failed && (
                        <Badge variant="danger" size="sm">
                          재시험
                        </Badge>
                      )}
                      {score.cutline == null && <span className="text-muted-foreground text-xs">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </section>
  );
};

const AssignmentHistoryTable = ({ assignments }: { assignments: AssignmentHistoryInfo[] }) => {
  return (
    <section>
      <DashboardCard
        title="과제 현황"
        icon={FileCheck}
        isEmpty={assignments.length === 0}
        emptyMessage="과제 기록이 없습니다."
        noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs">
                  과제명
                </th>
                <th className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs">
                  수업
                </th>
                <th className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item) => {
                const status = assignmentStatusConfig[item.status] || {
                  variant: "warning" as const,
                  label: item.status,
                };
                return (
                  <tr key={item.id} className="border-border border-t transition-colors hover:bg-muted/50">
                    <td className="whitespace-nowrap px-4 py-2.5 text-foreground text-sm">{item.assignment.name}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground text-sm">
                      {item.assignment.course.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </section>
  );
};

const RetakeTable = ({ retakes }: { retakes: RetakeHistoryInfo[] }) => {
  const comparators = useMemo(
    () => ({
      exam: (a: RetakeHistoryInfo, b: RetakeHistoryInfo) => a.exam.examNumber - b.exam.examNumber,
      scheduledDate: (a: RetakeHistoryInfo, b: RetakeHistoryInfo) =>
        (a.scheduledDate || "").localeCompare(b.scheduledDate || ""),
      status: (a: RetakeHistoryInfo, b: RetakeHistoryInfo) =>
        (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1),
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<RetakeHistoryInfo, RetakeSortKey>({
    data: retakes,
    comparators,
    defaultSort: { key: "exam", direction: "desc" },
  });

  return (
    <section>
      <DashboardCard
        title="재시험 이력"
        icon={RefreshCw}
        isEmpty={retakes.length === 0}
        emptyMessage="재시험 기록이 없습니다."
        noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <SortableHeader
                  label="시험"
                  sortKey="exam"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <SortableHeader
                  label="예정일"
                  sortKey="scheduledDate"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <SortableHeader
                  label="상태"
                  sortKey="status"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <th className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs">
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((retake) => {
                const status = retakeStatusConfig[retake.status] || {
                  variant: "neutral" as const,
                  label: retake.status,
                };
                return (
                  <tr key={retake.id} className="border-border border-t transition-colors hover:bg-muted/50">
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <div className="text-foreground text-sm">{retake.exam.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {retake.exam.course.name} {retake.exam.examNumber}회차
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="text-foreground text-sm">{retake.scheduledDate || "-"}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <div className="flex gap-2">
                        {retake.postponeCount > 0 && (
                          <span className="text-muted-foreground text-xs">연기 {retake.postponeCount}회</span>
                        )}
                        {retake.absentCount > 0 && (
                          <span className="text-muted-foreground text-xs">결석 {retake.absentCount}회</span>
                        )}
                        {retake.postponeCount === 0 && retake.absentCount === 0 && (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </section>
  );
};

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const toast = useToast();

  const { studentDetail, isLoading, error } = useStudentDetail(studentId);

  useEffect(() => {
    if (error) {
      toast.error("학생을 찾을 수 없습니다.");
      router.push("/students");
    }
  }, [error, router, toast]);

  if (isLoading || !studentDetail) {
    return (
      <PageShell title="학생 정보">
        <DashboardSkeleton />
      </PageShell>
    );
  }

  const activeTags = (studentDetail.student.tags || []).filter((assignment) =>
    isTagActive(assignment.start_date, assignment.end_date),
  );
  const courseCount = studentDetail.courses.length;
  const percentileScores = studentDetail.examScores.filter((s) => s.maxScore && s.maxScore > 0);
  const avgPercentile =
    percentileScores.length > 0
      ? Math.round(
          percentileScores.reduce((sum, s) => sum + (s.score / (s.maxScore as number)) * 100, 0) /
            percentileScores.length,
        )
      : 0;
  const pendingRetakes = studentDetail.retakeHistory.filter(
    (r) => r.status === "pending" || r.status === "absent",
  ).length;
  const pendingAssignmentTasks = (studentDetail.assignmentHistory || []).filter(
    (assignment) => assignment.status !== "완료",
  ).length;
  const consultationCount = studentDetail.consultationHistory.length;

  const grade = studentDetail.student.birthYear ? getGrade(studentDetail.student.birthYear) : null;
  const clinicWeekdays =
    studentDetail.student.requiredClinicWeekdays && studentDetail.student.requiredClinicWeekdays.length > 0
      ? studentDetail.student.requiredClinicWeekdays
          .map((d) => ["일", "월", "화", "수", "목", "금", "토"][d])
          .join(", ")
      : null;

  const detailHeader = (
    <DetailHeader
      title={<h1 className="font-bold text-2xl text-foreground tracking-[-0.02em]">{studentDetail.student.name}</h1>}
      badges={
        <>
          {grade && (
            <Badge variant="blue" size="xs">
              {grade}
            </Badge>
          )}
          {activeTags.map((assignment) => (
            <Badge key={assignment.id} variant={assignment.tag.color} size="xs">
              {assignment.tag.name}
            </Badge>
          ))}
        </>
      }
      meta={
        <>
          <span>{studentDetail.student.school || "학교 정보 없음"}</span>
          <span>
            <span className="text-muted-foreground/70">본인</span>{" "}
            {formatPhoneNumber(studentDetail.student.phoneNumber)}
          </span>
          {studentDetail.student.parentPhoneNumber && (
            <span>
              <span className="text-muted-foreground/70">학부모</span>{" "}
              {formatPhoneNumber(studentDetail.student.parentPhoneNumber)}
            </span>
          )}
          {clinicWeekdays && (
            <span>
              <span className="text-muted-foreground/70">클리닉 필참</span> {clinicWeekdays}
            </span>
          )}
        </>
      }
    />
  );

  return (
    <PageShell crumb={studentDetail.student.name} header={detailHeader}>
      <DetailGrid
        aside={
          <>
            <SectionCard title="요약" icon={TrendingUp} tone="students">
              <StatStrip
                orientation="vertical"
                items={[
                  { label: "수강 중인 수업", value: `${courseCount}개` },
                  { label: "시험 평균", value: percentileScores.length > 0 ? `${avgPercentile}%` : "-" },
                  { label: "재시험 대기", value: `${pendingRetakes}건`, emphasis: pendingRetakes > 0 },
                  { label: "과제 미완료", value: `${pendingAssignmentTasks}건`, emphasis: pendingAssignmentTasks > 0 },
                  { label: "상담 기록", value: `${consultationCount}건` },
                ]}
              />
            </SectionCard>
            <section>
              <DashboardCard
                title="수강 중인 수업"
                icon={BookOpen}
                isEmpty={studentDetail.courses.length === 0}
                emptyMessage="수강 중인 수업이 없습니다."
                noPadding>
                <div className="grid grid-cols-1 gap-3 p-4">
                  {studentDetail.courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted px-4 py-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate font-medium text-foreground text-sm">{course.name}</span>
                        <span className="text-muted-foreground text-xs">
                          등록: {new Date(course.enrolled_at).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <Badge variant="blue" size="xs">
                        {formatDaysOfWeek(course.days_of_week)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </section>
          </>
        }
        main={
          <>
            <ExamScoreTable examScores={studentDetail.examScores} />
            <AssignmentHistoryTable assignments={studentDetail.assignmentHistory} />

            <RetakeTable retakes={studentDetail.retakeHistory} />
            <section>
              <DashboardCard
                title="클리닉 출석"
                icon={Stethoscope}
                isEmpty={studentDetail.clinicHistory.length === 0}
                emptyMessage="클리닉 출석 기록이 없습니다."
                noPadding>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs">
                          날짜
                        </th>
                        <th className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs">
                          클리닉
                        </th>
                        <th className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs">
                          출석
                        </th>
                        <th className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs">
                          활동
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetail.clinicHistory.map((history) => {
                        const activities = [
                          history.didRetakeExam && "재시험",
                          history.didHomeworkCheck && "숙제검사",
                          history.didQa && "질의응답",
                        ].filter(Boolean);
                        return (
                          <tr key={history.id} className="border-border border-t transition-colors hover:bg-muted/50">
                            <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground text-sm">
                              {new Date(history.attendanceDate).toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5">
                              <span className="text-foreground text-sm">{history.clinic.name}</span>
                              {history.isRequired && <span className="ml-1 text-primary text-xs">필참</span>}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5">
                              <Badge variant={history.status === "absent" ? "danger" : "success"} size="sm">
                                {history.status === "absent" ? "결석" : "출석"}
                              </Badge>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground text-xs">
                              {activities.length > 0 ? activities.join(", ") : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            </section>
            <section>
              <DashboardCard
                title="상담 기록"
                icon={MessageSquare}
                isEmpty={studentDetail.consultationHistory.length === 0}
                emptyMessage="상담 기록이 없습니다.">
                {studentDetail.consultationHistory.map((consultation) => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
                ))}
              </DashboardCard>
            </section>
            <section>
              <DashboardCard
                title="문자 발송 기록"
                icon={FileText}
                isEmpty={studentDetail.messageHistory.length === 0}
                emptyMessage="문자 발송 기록이 없습니다.">
                {studentDetail.messageHistory.map((message) => (
                  <div key={message.id} className="flex gap-3 border-border border-b px-5 py-4 last:border-b-0">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4",
                        message.isSuccess ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive",
                      )}>
                      {message.isSuccess ? <Check /> : <X />}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="blue" size="xs">
                            {message.recipientType === "student" ? "학생" : "학부모"}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {formatPhoneNumber(message.recipientPhone)}
                          </span>
                        </div>
                        <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                          {new Date(message.sentAt).toLocaleDateString("ko-KR")}{" "}
                          {new Date(message.sentAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                          {message.sender && ` · ${message.sender.name}`}
                        </span>
                      </div>
                      <p className="line-clamp-2 whitespace-pre-wrap text-foreground text-sm">
                        {message.messageContent}
                      </p>
                    </div>
                  </div>
                ))}
              </DashboardCard>
            </section>
          </>
        }
      />
    </PageShell>
  );
}
