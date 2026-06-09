"use client";

import Link from "next/link";

import type { StudentDetail } from "@/app/(pages)/students/(hooks)/useStudentDetail";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { formatClinicWeekdays, formatCourseDaysOfWeek, formatLocaleDateKorean } from "@/shared/lib/utils/date";
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

export default function StudentInfoModal({
  isOpen,
  onClose,
  studentId,
  studentDetail,
  isLoading,
}: StudentInfoModalProps) {
  const examScores = studentDetail?.examScores || [];
  const assignmentHistory = studentDetail?.assignmentHistory || [];

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
      ) : !studentDetail ? (
        <div className="py-16 text-center text-muted-foreground">학생 정보를 불러올 수 없습니다.</div>
      ) : (
        <div className="flex flex-col gap-7">
          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-sm">기본 정보</h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted p-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs">이름</span>
                <span className="font-medium text-foreground text-sm">{studentDetail.student.name}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs">전화번호</span>
                <span className="font-medium text-foreground text-sm">
                  {formatPhoneNumber(studentDetail.student.phoneNumber)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs">학부모 번호</span>
                <span className="font-medium text-foreground text-sm">
                  {studentDetail.student.parentPhoneNumber
                    ? formatPhoneNumber(studentDetail.student.parentPhoneNumber)
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs">학교</span>
                <span className="font-medium text-foreground text-sm">{studentDetail.student.school || "-"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs">학년</span>
                <span className="font-medium text-foreground text-sm">
                  {getGrade(studentDetail.student.birthYear) || "-"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs">등록일</span>
                <span className="font-medium text-foreground text-sm">
                  {formatLocaleDateKorean(studentDetail.student.createdAt)}
                </span>
              </div>
              {studentDetail.student.requiredClinicWeekdays &&
                studentDetail.student.requiredClinicWeekdays.length > 0 && (
                  <div className="col-span-2 flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">클리닉 필참요일</span>
                    <span className="font-medium text-foreground text-sm">
                      {formatClinicWeekdays(studentDetail.student.requiredClinicWeekdays)}
                    </span>
                  </div>
                )}
              {(() => {
                const activeTags = (studentDetail.student.tags || []).filter((assignment) =>
                  isTagActive(assignment.start_date, assignment.end_date),
                );
                if (activeTags.length === 0) return null;
                return (
                  <div className="col-span-2 flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">태그</span>
                    <div className="flex flex-wrap items-center gap-1">
                      {activeTags.map((assignment) => (
                        <Badge key={assignment.id} variant={assignment.tag?.color} size="xs">
                          {assignment.tag?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-sm">수강 중인 수업</h3>
            {studentDetail.courses.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted p-5 text-center text-muted-foreground text-xs">
                수강 중인 수업이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border">
                {studentDetail.courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between gap-3 bg-muted px-5 py-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-medium text-foreground text-sm">{course.name}</span>
                      <span className="text-muted-foreground text-xs">
                        등록: {formatLocaleDateKorean(course.enrolled_at)}
                      </span>
                    </div>
                    <Badge variant="blue" size="xs">
                      {formatCourseDaysOfWeek(course.days_of_week)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-sm">
              시험 성적
              {examScores.length > 0 && (
                <span className="ml-1 font-normal text-muted-foreground">
                  ({Math.min(5, examScores.length)}/{examScores.length}개)
                </span>
              )}
            </h3>
            {examScores.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted p-5 text-center text-muted-foreground text-xs">
                시험 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border">
                {examScores.slice(0, 5).map((score) => {
                  const isPassed = score.cutline !== null && score.score >= score.cutline;
                  const isFailed = score.cutline !== null && score.score < score.cutline;
                  return (
                    <div key={score.id} className="flex items-center justify-between gap-3 bg-muted px-5 py-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate font-medium text-foreground text-sm">
                          {score.exam.course.name} - {score.exam.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {score.score}
                          {score.maxScore !== null && `/${score.maxScore}`}점 · {score.rank}/{score.totalStudents}등
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-sm">
              과제 현황
              {assignmentHistory.length > 0 && (
                <span className="ml-1 font-normal text-muted-foreground">
                  ({Math.min(5, assignmentHistory.length)}/{assignmentHistory.length}개)
                </span>
              )}
            </h3>
            {assignmentHistory.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted p-5 text-center text-muted-foreground text-xs">
                과제 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border">
                {assignmentHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 bg-muted px-5 py-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-medium text-foreground text-sm">
                        {item.assignment.course.name} - {item.assignment.name}
                      </span>
                    </div>
                    <Badge
                      variant={item.status === "완료" ? "success" : item.status === "검사예정" ? "warning" : "danger"}
                      size="xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-sm">
              최근 클리닉 출석
              {studentDetail.clinicHistory.length > 0 && (
                <span className="ml-1 font-normal text-muted-foreground">
                  ({Math.min(5, studentDetail.clinicHistory.length)}/{studentDetail.clinicHistory.length}개)
                </span>
              )}
            </h3>
            {studentDetail.clinicHistory.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted p-5 text-center text-muted-foreground text-xs">
                클리닉 출석 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border">
                {studentDetail.clinicHistory.slice(0, 5).map((history) => {
                  const activities = [
                    history.didRetakeExam && "재시험",
                    history.didHomeworkCheck && "숙제검사",
                    history.didQa && "질의응답",
                  ].filter(Boolean);
                  return (
                    <div key={history.id} className="flex items-center justify-between gap-3 bg-muted px-5 py-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="shrink-0 text-muted-foreground text-xs">
                          {new Date(history.attendanceDate).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="truncate text-foreground text-sm">{history.clinic.name}</span>
                        {history.isRequired && <span className="shrink-0 text-primary text-xs">필참</span>}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={history.status === "absent" ? "danger" : "success"} size="xs">
                          {history.status === "absent" ? "결석" : "출석"}
                        </Badge>
                        {activities.length > 0 && (
                          <span className="text-muted-foreground text-xs">{activities.join(", ")}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-sm">
              최근 재시험
              {studentDetail.retakeHistory.length > 0 && (
                <span className="ml-1 font-normal text-muted-foreground">
                  ({Math.min(5, studentDetail.retakeHistory.length)}/{studentDetail.retakeHistory.length}개)
                </span>
              )}
            </h3>
            {studentDetail.retakeHistory.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted p-5 text-center text-muted-foreground text-xs">
                재시험 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border">
                {studentDetail.retakeHistory.slice(0, 5).map((retake) => (
                  <div key={retake.id} className="flex items-center justify-between gap-3 bg-muted px-5 py-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-medium text-foreground text-sm">
                        {retake.exam.course.name} - {retake.exam.name}
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <span>
                          {retake.scheduledDate
                            ? new Date(retake.scheduledDate).toLocaleDateString("ko-KR", {
                                month: "long",
                                day: "numeric",
                              })
                            : "날짜 미정"}
                        </span>
                        {(retake.postponeCount > 0 || retake.absentCount > 0) && (
                          <span className="text-muted-foreground/60">
                            {retake.postponeCount > 0 && `연기 ${retake.postponeCount}회`}
                            {retake.postponeCount > 0 && retake.absentCount > 0 && " / "}
                            {retake.absentCount > 0 && `결석 ${retake.absentCount}회`}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        retake.status === "completed" ? "success" : retake.status === "absent" ? "danger" : "warning"
                      }
                      size="xs">
                      {RETAKE_STATUS_LABELS[retake.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
