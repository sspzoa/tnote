"use client";

import { BookOpen, FileText, MessageSquare, Printer, RefreshCw, Stethoscope, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/useToast";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import { useStudentDetail } from "../(hooks)/useStudentDetail";
import {
  ConsultationCard,
  DashboardCard,
  DashboardSkeleton,
  ExamResultCard,
  formatDaysOfWeek,
  isTagActive,
  RetakeHistoryCard,
  StatCard,
} from "./(components)";

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

  const examWithAssignments = useMemo(() => {
    if (!studentDetail) return [];

    const assignmentMap = new Map(studentDetail.assignmentHistory.map((a) => [a.exam.id, a]));

    return studentDetail.examScores.map((score) => ({
      examScore: score,
      assignment: assignmentMap.get(score.exam.id),
    }));
  }, [studentDetail]);

  if (isLoading || !studentDetail) {
    return (
      <div className="min-h-screen p-spacing-600 md:p-spacing-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-spacing-500">
          <Skeleton className="h-5 w-40" />
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
    <div className="min-h-screen bg-background-standard-secondary p-spacing-500 md:p-spacing-700 print:min-h-0 print:bg-white print:p-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-spacing-600 print:max-w-none print:gap-spacing-400">
        <section className="flex flex-col gap-spacing-400">
          <div className="flex items-center justify-between print:hidden">
            <Link href="/students" className="inline-block text-body text-core-accent hover:underline">
              ← 학생 목록으로 돌아가기
            </Link>
            <Button variant="secondary" size="xs" onClick={() => window.print()}>
              <span className="flex items-center gap-spacing-200">
                <Printer className="h-4 w-4" />
                인쇄
              </span>
            </Button>
          </div>

          <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500 print:rounded-none print:border-0 print:border-line-divider print:border-b print:bg-white print:p-0 print:pb-spacing-300">
            <div className="flex flex-col gap-spacing-300 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-spacing-200">
                <div className="flex items-center gap-spacing-300">
                  <h1 className="font-bold text-content-standard-primary text-title">{studentDetail.student.name}</h1>
                  {studentDetail.student.birthYear && getGrade(studentDetail.student.birthYear) && (
                    <Badge variant="blue" size="xs">
                      {getGrade(studentDetail.student.birthYear)}
                    </Badge>
                  )}
                </div>

                <p className="text-body text-content-standard-secondary">
                  {studentDetail.student.school || "학교 정보 없음"}
                </p>

                <div className="flex flex-wrap items-center gap-spacing-400 text-content-standard-secondary text-label">
                  <span className="flex items-center gap-spacing-100">
                    <span className="text-content-standard-tertiary">본인</span>
                    {formatPhoneNumber(studentDetail.student.phoneNumber)}
                  </span>
                  {studentDetail.student.parentPhoneNumber && (
                    <span className="flex items-center gap-spacing-100">
                      <span className="text-content-standard-tertiary">학부모</span>
                      {formatPhoneNumber(studentDetail.student.parentPhoneNumber)}
                    </span>
                  )}
                </div>
              </div>

              {activeTags.length > 0 && (
                <div className="flex flex-wrap gap-spacing-100">
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

        <section className="grid grid-cols-2 gap-spacing-400 lg:grid-cols-4 print:grid-cols-4 print:gap-spacing-200">
          <StatCard
            icon={BookOpen}
            label="수강 중인 수업"
            value={`${courseCount}개`}
            subValue={courseCount > 0 ? "현재 수강중" : "수강 수업 없음"}
            colorClass="bg-solid-translucent-blue text-solid-blue"
          />
          <StatCard
            icon={TrendingUp}
            label="시험 평균"
            value={studentDetail.examScores.length > 0 ? `${avgScore}점` : "-"}
            subValue={studentDetail.examScores.length > 0 ? `평균 순위 ${avgRank}등` : "응시 기록 없음"}
            colorClass="bg-solid-translucent-green text-solid-green"
          />
          <StatCard
            icon={RefreshCw}
            label="재시험 대기"
            value={`${pendingRetakes}건`}
            subValue={`전체 ${totalRetakes}건 중`}
            colorClass="bg-solid-translucent-yellow text-solid-yellow"
          />
          <StatCard
            icon={MessageSquare}
            label="상담 기록"
            value={`${consultationCount}건`}
            subValue={consultationCount > 0 ? "누적 상담" : "상담 기록 없음"}
            colorClass="bg-solid-translucent-purple text-solid-purple"
          />
        </section>

        <section>
          <DashboardCard
            title="수강 중인 수업"
            icon={BookOpen}
            isEmpty={studentDetail.courses.length === 0}
            emptyMessage="수강 중인 수업이 없습니다."
            noPadding>
            <div className="grid gap-spacing-300 p-spacing-400 sm:grid-cols-2 lg:grid-cols-3 print:gap-spacing-200 print:px-0 print:py-spacing-200">
              {studentDetail.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between gap-spacing-300 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 print:bg-transparent print:px-spacing-200 print:py-spacing-200">
                  <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                    <span className="truncate font-medium text-body text-content-standard-primary">{course.name}</span>
                    <span className="text-content-standard-tertiary text-footnote">
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

        <section className="grid gap-spacing-500 lg:grid-cols-2 print:gap-spacing-400">
          <DashboardCard
            title="시험 성적 & 과제"
            icon={TrendingUp}
            isEmpty={examWithAssignments.length === 0}
            emptyMessage="시험 기록이 없습니다."
            scrollable>
            {examWithAssignments.map(({ examScore, assignment }) => (
              <ExamResultCard key={examScore.id} examScore={examScore} assignment={assignment} />
            ))}
          </DashboardCard>

          <DashboardCard
            title="재시험 이력"
            icon={RefreshCw}
            isEmpty={studentDetail.retakeHistory.length === 0}
            emptyMessage="재시험 기록이 없습니다."
            scrollable>
            {studentDetail.retakeHistory.map((retake) => (
              <RetakeHistoryCard key={retake.id} retake={retake} />
            ))}
          </DashboardCard>
        </section>

        <section>
          <DashboardCard
            title="클리닉 출석"
            icon={Stethoscope}
            isEmpty={studentDetail.clinicHistory.length === 0}
            emptyMessage="클리닉 출석 기록이 없습니다."
            noPadding>
            <div className="grid gap-spacing-300 p-spacing-400 sm:grid-cols-2 lg:grid-cols-3 print:gap-spacing-200 print:px-0 print:py-spacing-200">
              {studentDetail.clinicHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between gap-spacing-300 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 print:bg-transparent print:px-spacing-200 print:py-spacing-200">
                  <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                    <span className="truncate font-medium text-body text-content-standard-primary">
                      {history.clinic.name}
                    </span>
                    {history.note && (
                      <span className="truncate text-content-standard-tertiary text-footnote">{history.note}</span>
                    )}
                  </div>
                  <Badge variant="blue" size="xs">
                    {new Date(history.attendanceDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </Badge>
                </div>
              ))}
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
              <div
                key={message.id}
                className="print-break-inside-avoid flex flex-col gap-spacing-200 px-spacing-500 py-spacing-400 print:px-0 print:py-spacing-200">
                <div className="flex items-center justify-between gap-spacing-300">
                  <div className="flex items-center gap-spacing-200">
                    <Badge variant={message.isSuccess ? "success" : "danger"} size="xs">
                      {message.isSuccess ? "성공" : "실패"}
                    </Badge>
                    <Badge variant="blue" size="xs">
                      {message.recipientType === "student" ? "학생" : "학부모"}
                    </Badge>
                    <span className="text-content-standard-secondary text-footnote">
                      {formatPhoneNumber(message.recipientPhone)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-spacing-200">
                    {message.sender && (
                      <span className="text-content-standard-secondary text-footnote">{message.sender.name}</span>
                    )}
                    <span className="text-content-standard-tertiary text-footnote">
                      {new Date(message.sentAt).toLocaleDateString("ko-KR")}{" "}
                      {new Date(message.sentAt).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <p className="line-clamp-2 whitespace-pre-wrap text-content-standard-primary text-label">
                  {message.messageContent}
                </p>
              </div>
            ))}
          </DashboardCard>
        </section>
      </div>
    </div>
  );
}
