"use client";

import {
  BookOpen,
  FileCheck,
  FileText,
  MessageSquare,
  Printer,
  RefreshCw,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Container from "@/shared/components/common/Container";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { useToast } from "@/shared/hooks/useToast";
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
  StatCard,
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

const ExamScoreTable = ({ examScores, printHidden }: { examScores: ExamScoreInfo[]; printHidden: boolean }) => {
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
    <section className={`flex flex-col gap-6 ${printHidden ? "print:hidden" : ""}`}>
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
                  className="print:hidden"
                />
                <SortableHeader
                  label="중앙값"
                  sortKey="median"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                  className="print:hidden"
                />
                <SortableHeader
                  label="최고점"
                  sortKey="highest"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                  className="print:hidden"
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
                    <td className="whitespace-nowrap px-4 py-2.5 print:hidden">
                      <span className="text-foreground text-sm">{score.average}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 print:hidden">
                      <span className="text-foreground text-sm">{score.median}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 print:hidden">
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

const AssignmentHistoryTable = ({
  assignments,
  printHidden,
}: {
  assignments: AssignmentHistoryInfo[];
  printHidden: boolean;
}) => {
  return (
    <section className={printHidden ? "print:hidden" : ""}>
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

const RetakeTable = ({ retakes, printHidden }: { retakes: RetakeHistoryInfo[]; printHidden: boolean }) => {
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
    <section className={printHidden ? "print:hidden" : ""}>
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

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    courses: true,
    exams: true,
    retakes: true,
    clinics: true,
    consultations: false,
    messages: false,
  });
  const { studentDetail, isLoading, error } = useStudentDetail(studentId);

  const togglePrintOption = useCallback((key: keyof typeof printOptions) => {
    setPrintOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error("학생을 찾을 수 없습니다.");
      router.push("/students");
    }
  }, [error, router, toast]);

  if (isLoading || !studentDetail) {
    return (
      <Container>
        <DashboardSkeleton />
      </Container>
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
  const avgRank =
    studentDetail.examScores.length > 0
      ? (studentDetail.examScores.reduce((sum, s) => sum + s.rank, 0) / studentDetail.examScores.length).toFixed(1)
      : "-";
  const avgTotal =
    studentDetail.examScores.length > 0
      ? (
          studentDetail.examScores.reduce((sum, s) => sum + s.totalStudents, 0) / studentDetail.examScores.length
        ).toFixed(1)
      : "-";
  const pendingRetakes = studentDetail.retakeHistory.filter(
    (r) => r.status === "pending" || r.status === "absent",
  ).length;
  const totalRetakes = studentDetail.retakeHistory.length;
  const pendingAssignmentTasks = (studentDetail.assignmentHistory || []).filter(
    (assignment) => assignment.status !== "완료",
  ).length;
  const totalAssignmentTasks = (studentDetail.assignmentHistory || []).length;
  const consultationCount = studentDetail.consultationHistory.length;

  return (
    <Container className="bg-muted print:min-h-0 print:bg-white print:p-0">
      <div className="flex flex-col gap-7 print:gap-3">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between print:hidden">
            <Link href="/students" className="text-primary text-sm hover:underline">
              ← 학생 목록으로 돌아가기
            </Link>
            <Button variant="secondary" size="sm" onClick={() => setShowPrintModal(true)}>
              <span className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                인쇄
              </span>
            </Button>
          </div>

          <div className="rounded-2xl border border-transparent bg-card p-5 shadow-sm print:rounded-none print:border-0 print:border-border print:border-b print:bg-white print:p-0 print:pb-3 print:shadow-none">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft font-bold text-2xl text-primary print:hidden">
                  {studentDetail.student.name.charAt(0)}
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-bold text-2xl text-foreground tracking-[-0.02em]">
                      {studentDetail.student.name}
                    </h1>
                    {studentDetail.student.birthYear && getGrade(studentDetail.student.birthYear) && (
                      <Badge variant="blue" size="xs">
                        {getGrade(studentDetail.student.birthYear)}
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm">{studentDetail.student.school || "학교 정보 없음"}</p>

                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">본인</span>
                      {formatPhoneNumber(studentDetail.student.phoneNumber)}
                    </span>
                    {studentDetail.student.parentPhoneNumber && (
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">학부모</span>
                        {formatPhoneNumber(studentDetail.student.parentPhoneNumber)}
                      </span>
                    )}
                    {studentDetail.student.requiredClinicWeekdays &&
                      studentDetail.student.requiredClinicWeekdays.length > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="text-muted-foreground">클리닉 필참</span>
                          {studentDetail.student.requiredClinicWeekdays
                            .map((d) => ["일", "월", "화", "수", "목", "금", "토"][d])
                            .join(", ")}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {activeTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {activeTags.map((assignment) => (
                    <Badge key={assignment.id} variant={assignment.tag.color} size="xs">
                      {assignment.tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          className={`grid grid-cols-2 gap-4 lg:grid-cols-5 print:gap-2 ${
            {
              1: "print:grid-cols-1",
              2: "print:grid-cols-2",
              3: "print:grid-cols-3",
              4: "print:grid-cols-4",
            }[
              [printOptions.courses, printOptions.exams, printOptions.retakes, printOptions.consultations].filter(
                Boolean,
              ).length
            ] || "print:grid-cols-4"
          }`}>
          <div className={printOptions.courses ? "" : "print:hidden"}>
            <StatCard
              icon={BookOpen}
              label="수강 중인 수업"
              value={`${courseCount}개`}
              subValue={courseCount > 0 ? "현재 수강중" : "수강 수업 없음"}
            />
          </div>
          <div className={printOptions.exams ? "" : "print:hidden"}>
            <StatCard
              icon={TrendingUp}
              label="시험 평균"
              value={percentileScores.length > 0 ? `${avgPercentile}%` : "-"}
              subValue={studentDetail.examScores.length > 0 ? `평균 순위 ${avgRank}/${avgTotal}` : "응시 기록 없음"}
            />
          </div>
          <div className={printOptions.retakes ? "" : "print:hidden"}>
            <StatCard
              icon={RefreshCw}
              label="재시험 대기"
              value={`${pendingRetakes}건`}
              subValue={`전체 ${totalRetakes}건 중`}
            />
          </div>
          <div className={printOptions.retakes ? "" : "print:hidden"}>
            <StatCard
              icon={FileCheck}
              label="과제 미완료"
              value={`${pendingAssignmentTasks}건`}
              subValue={`전체 ${totalAssignmentTasks}건 중`}
            />
          </div>
          <div className={printOptions.consultations ? "" : "print:hidden"}>
            <StatCard
              icon={MessageSquare}
              label="상담 기록"
              value={`${consultationCount}건`}
              subValue={consultationCount > 0 ? "누적 상담" : "상담 기록 없음"}
            />
          </div>
        </section>
      </div>
      <section className={printOptions.courses ? "" : "print:hidden"}>
        <DashboardCard
          title="수강 중인 수업"
          icon={BookOpen}
          isEmpty={studentDetail.courses.length === 0}
          emptyMessage="수강 중인 수업이 없습니다."
          noPadding>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 print:gap-2 print:px-0 print:py-2">
            {studentDetail.courses.map((course) => (
              <div
                key={course.id}
                className="print-break-inside-avoid flex items-center justify-between gap-3 rounded-md border border-border bg-muted px-4 py-3 print:bg-transparent print:px-2 print:py-2">
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
      <ExamScoreTable examScores={studentDetail.examScores} printHidden={!printOptions.exams} />
      <AssignmentHistoryTable assignments={studentDetail.assignmentHistory} printHidden={!printOptions.exams} />

      <RetakeTable retakes={studentDetail.retakeHistory} printHidden={!printOptions.retakes} />
      <section className={printOptions.clinics ? "" : "print:hidden"}>
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
      <section className={printOptions.consultations ? "" : "print:hidden"}>
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
      <section className={printOptions.messages ? "" : "print:hidden"}>
        <DashboardCard
          title="문자 발송 기록"
          icon={FileText}
          isEmpty={studentDetail.messageHistory.length === 0}
          emptyMessage="문자 발송 기록이 없습니다.">
          {studentDetail.messageHistory.map((message) => (
            <div
              key={message.id}
              className="print-break-inside-avoid flex flex-col gap-2 px-5 py-4 print:px-0 print:py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant={message.isSuccess ? "success" : "danger"} size="xs">
                    {message.isSuccess ? "성공" : "실패"}
                  </Badge>
                  <Badge variant="blue" size="xs">
                    {message.recipientType === "student" ? "학생" : "학부모"}
                  </Badge>
                  <span className="text-muted-foreground text-xs">{formatPhoneNumber(message.recipientPhone)}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {message.sender && <span className="text-muted-foreground text-xs">{message.sender.name}</span>}
                  <span className="text-muted-foreground text-xs">
                    {new Date(message.sentAt).toLocaleDateString("ko-KR")}{" "}
                    {new Date(message.sentAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <p className="line-clamp-2 whitespace-pre-wrap text-foreground text-sm">{message.messageContent}</p>
            </div>
          ))}
        </DashboardCard>
      </section>

      <Modal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="인쇄 옵션"
        subtitle="인쇄에 포함할 항목을 선택하세요."
        footer={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setShowPrintModal(false)}>
              취소
            </Button>
            <Button variant="default" className="flex-1" onClick={handlePrint}>
              <span className="flex items-center justify-center gap-2">
                <Printer className="h-4 w-4" />
                인쇄하기
              </span>
            </Button>
          </>
        }>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { key: "courses", icon: BookOpen, label: "수업" },
              { key: "exams", icon: TrendingUp, label: "시험 & 과제" },
              { key: "retakes", icon: RefreshCw, label: "재시험" },
              { key: "clinics", icon: Stethoscope, label: "클리닉" },
              { key: "consultations", icon: MessageSquare, label: "상담" },
              { key: "messages", icon: FileText, label: "문자" },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              onClick={() => togglePrintOption(item.key)}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 transition-colors ${printOptions[item.key] ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
              <div
                className={`flex size-5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150 ${printOptions[item.key] ? "border-primary bg-primary" : "border-border bg-muted"}`}>
                {printOptions[item.key] && (
                  <svg className="size-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <item.icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-foreground text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </Modal>
    </Container>
  );
}
