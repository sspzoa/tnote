"use client";

import { BookOpen, CalendarCheck, ClipboardList, FileText, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import type { StudentDetail } from "@/app/(pages)/students/(hooks)/useStudentDetail";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { FeatureTone } from "@/shared/components/ui/featureTone";
import { Modal } from "@/shared/components/ui/modal";
import { SectionCard } from "@/shared/components/ui/sectionCard";
import { StatStrip, type StatStripItem } from "@/shared/components/ui/statStrip";
import {
  formatClinicWeekdays,
  formatCourseDaysOfWeek,
  formatLocaleDateKorean,
  formatLocaleMonthDayKorean,
} from "@/shared/lib/utils/date";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import { isTagActive } from "@/shared/lib/utils/tags";
import { StudentInfoSkeleton } from "./StudentInfoSkeleton";

const RETAKE_STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  completed: "완료",
  absent: "결석",
};

interface StudentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentDetail: StudentDetail | null | undefined;
  isLoading: boolean;
}

/** One uniform record row across every list section: title + meta sub-line on the left, trailing slot on the right. */
function RecordRow({ title, meta, trailing }: { title: ReactNode; meta?: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-border border-b px-5 py-3 transition-colors last:border-b-0 hover:bg-muted/40">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium text-foreground text-sm">{title}</span>
        {meta && <span className="flex items-center gap-1.5 text-muted-foreground text-xs">{meta}</span>}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
    </div>
  );
}

/** SectionCard wrapper for the list slices — colored icon-well header + a count Badge + flush rows. */
function ListSection({
  title,
  icon,
  tone,
  count,
  emptyMessage,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  tone: FeatureTone;
  count: number;
  emptyMessage: string;
  children: ReactNode;
}) {
  const isEmpty = count === 0;
  return (
    <SectionCard
      title={title}
      icon={icon}
      tone={tone}
      noPadding
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      action={
        !isEmpty && (
          <Badge variant="neutral" size="xs">
            {count}
          </Badge>
        )
      }>
      <div className="border-border border-t">{children}</div>
    </SectionCard>
  );
}

export default function StudentInfoModal({
  isOpen,
  onClose,
  studentId,
  studentDetail,
  isLoading,
}: StudentInfoModalProps) {
  const examScores = studentDetail?.examScores || [];
  const assignmentHistory = studentDetail?.assignmentHistory || [];

  const student = studentDetail?.student;
  const grade = student ? getGrade(student.birthYear) : null;
  const activeTags = (student?.tags || []).filter((assignment) =>
    isTagActive(assignment.start_date, assignment.end_date),
  );

  const basicInfoItems: StatStripItem[] = student
    ? [
        { label: "전화번호", value: formatPhoneNumber(student.phoneNumber) },
        {
          label: "학부모 번호",
          value: student.parentPhoneNumber ? formatPhoneNumber(student.parentPhoneNumber) : "-",
        },
        { label: "학교", value: student.school || "-" },
        { label: "학년", value: grade || "-" },
        { label: "등록일", value: formatLocaleDateKorean(student.createdAt) },
        ...(student.requiredClinicWeekdays && student.requiredClinicWeekdays.length > 0
          ? [{ label: "클리닉 필참요일", value: formatClinicWeekdays(student.requiredClinicWeekdays) }]
          : []),
      ]
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentDetail?.student.name || "학생 정보"}
      subtitle="학생 상세 정보"
      footer={
        <div className="flex w-full gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            닫기
          </Button>
          <Link href={`/students/${studentId}`} className="flex-1" onClick={onClose}>
            <Button className="w-full">상세 페이지</Button>
          </Link>
        </div>
      }>
      {isLoading ? (
        <StudentInfoSkeleton />
      ) : !studentDetail || !student ? (
        <div className="py-16 text-center text-muted-foreground">학생 정보를 불러올 수 없습니다.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header band — identity cluster + contact meta */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-foreground text-lg tracking-[-0.01em]">{student.name}</span>
                  {grade && (
                    <Badge variant="info" size="xs">
                      {grade}
                    </Badge>
                  )}
                  {activeTags.map((assignment) => (
                    <Badge key={assignment.id} variant={assignment.tag?.color ?? "neutral"} size="xs">
                      {assignment.tag?.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                  <span className="tabular-nums">{formatPhoneNumber(student.phoneNumber)}</span>
                  {student.parentPhoneNumber && (
                    <span className="tabular-nums">학부모 {formatPhoneNumber(student.parentPhoneNumber)}</span>
                  )}
                  {student.school && <span>{student.school}</span>}
                </div>
              </div>
            </div>
            <StatStrip orientation="vertical" items={basicInfoItems} className="border-border border-t pt-1" />
          </div>

          <ListSection
            title="수강 중인 수업"
            icon={BookOpen}
            tone="courses"
            count={studentDetail.courses.length}
            emptyMessage="수강 중인 수업이 없습니다.">
            {studentDetail.courses.map((course) => (
              <RecordRow
                key={course.id}
                title={course.name}
                meta={<span>등록 {formatLocaleDateKorean(course.enrolled_at)}</span>}
                trailing={
                  <Badge variant="blue" size="xs">
                    {formatCourseDaysOfWeek(course.days_of_week)}
                  </Badge>
                }
              />
            ))}
          </ListSection>

          <ListSection
            title="시험 성적"
            icon={FileText}
            tone="primary"
            count={examScores.length}
            emptyMessage="시험 기록이 없습니다.">
            {examScores.slice(0, 5).map((score) => {
              const isPassed = score.cutline !== null && score.score >= score.cutline;
              const isFailed = score.cutline !== null && score.score < score.cutline;
              return (
                <RecordRow
                  key={score.id}
                  title={`${score.exam.course.name} · ${score.exam.name}`}
                  meta={
                    <span className="tabular-nums">
                      {score.score}
                      {score.maxScore !== null && `/${score.maxScore}`}점 · {score.rank}/{score.totalStudents}등
                    </span>
                  }
                  trailing={
                    <>
                      <Badge variant="blue" size="xs">
                        {score.exam.examNumber}회차
                      </Badge>
                      {isPassed && (
                        <Badge variant="success" size="xs">
                          통과
                        </Badge>
                      )}
                      {isFailed && (
                        <Badge variant="danger" size="xs">
                          재시험
                        </Badge>
                      )}
                    </>
                  }
                />
              );
            })}
          </ListSection>

          <ListSection
            title="과제 현황"
            icon={ClipboardList}
            tone="assignments"
            count={assignmentHistory.length}
            emptyMessage="과제 기록이 없습니다.">
            {assignmentHistory.slice(0, 5).map((item) => (
              <RecordRow
                key={item.id}
                title={`${item.assignment.course.name} · ${item.assignment.name}`}
                trailing={
                  <Badge
                    variant={item.status === "완료" ? "success" : item.status === "검사예정" ? "warning" : "danger"}
                    size="xs">
                    {item.status}
                  </Badge>
                }
              />
            ))}
          </ListSection>

          <ListSection
            title="최근 클리닉 출석"
            icon={CalendarCheck}
            tone="clinics"
            count={studentDetail.clinicHistory.length}
            emptyMessage="클리닉 출석 기록이 없습니다.">
            {studentDetail.clinicHistory.slice(0, 5).map((history) => {
              const activities = [
                history.didRetakeExam && "재시험",
                history.didHomeworkCheck && "숙제검사",
                history.didQa && "질의응답",
              ].filter(Boolean);
              return (
                <RecordRow
                  key={history.id}
                  title={history.clinic.name}
                  meta={
                    <>
                      <span className="tabular-nums">{formatLocaleMonthDayKorean(history.attendanceDate)}</span>
                      {activities.length > 0 && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span>{activities.join(", ")}</span>
                        </>
                      )}
                    </>
                  }
                  trailing={
                    <>
                      {history.isRequired && (
                        <Badge variant="info" size="xs">
                          필참
                        </Badge>
                      )}
                      <Badge variant={history.status === "absent" ? "danger" : "success"} size="xs">
                        {history.status === "absent" ? "결석" : "출석"}
                      </Badge>
                    </>
                  }
                />
              );
            })}
          </ListSection>

          <ListSection
            title="최근 재시험"
            icon={RotateCcw}
            tone="retakes"
            count={studentDetail.retakeHistory.length}
            emptyMessage="재시험 기록이 없습니다.">
            {studentDetail.retakeHistory.slice(0, 5).map((retake) => (
              <RecordRow
                key={retake.id}
                title={`${retake.exam.course.name} · ${retake.exam.name}`}
                meta={
                  <>
                    <span className="tabular-nums">
                      {retake.scheduledDate ? formatLocaleMonthDayKorean(retake.scheduledDate) : "날짜 미정"}
                    </span>
                    {(retake.postponeCount > 0 || retake.absentCount > 0) && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-muted-foreground/70">
                          {retake.postponeCount > 0 && `연기 ${retake.postponeCount}회`}
                          {retake.postponeCount > 0 && retake.absentCount > 0 && " / "}
                          {retake.absentCount > 0 && `결석 ${retake.absentCount}회`}
                        </span>
                      </>
                    )}
                  </>
                }
                trailing={
                  <Badge
                    variant={
                      retake.status === "completed" ? "success" : retake.status === "absent" ? "danger" : "warning"
                    }
                    size="xs">
                    {RETAKE_STATUS_LABELS[retake.status]}
                  </Badge>
                }
              />
            ))}
          </ListSection>
        </div>
      )}
    </Modal>
  );
}
