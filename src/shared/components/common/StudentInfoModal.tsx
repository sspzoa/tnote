"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { StudentDetail } from "@/app/(pages)/students/(hooks)/useStudentDetail";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import { isTagActive } from "@/shared/lib/utils/tags";
import { StudentInfoSkeleton } from "./StudentInfoSkeleton";

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

const RETAKE_STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  completed: "완료",
  absent: "결석",
};

const formatDaysOfWeek = (days: number[] | null): string => {
  if (!days || days.length === 0) return "-";
  return days.map((d) => DAY_NAMES[d]).join(", ");
};

interface StudentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentDetail: StudentDetail | null | undefined;
  isLoading: boolean;
}

export default function StudentInfoModal({ isOpen, onClose, studentDetail, isLoading }: StudentInfoModalProps) {
  const examWithAssignments = useMemo(() => {
    if (!studentDetail) return [];

    const assignmentMap = new Map(studentDetail.assignmentHistory.map((a) => [a.exam.id, a]));

    return studentDetail.examScores.map((score) => ({
      examScore: score,
      assignment: assignmentMap.get(score.exam.id),
    }));
  }, [studentDetail]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentDetail?.student.name || "학생 정보"}
      subtitle="학생 상세 정보"
      footer={
        <div className="flex w-full gap-spacing-300">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            닫기
          </Button>
          {studentDetail && (
            <Link href={`/students/${studentDetail.student.id}`} className="flex-1" onClick={onClose}>
              <Button className="w-full">상세 페이지</Button>
            </Link>
          )}
        </div>
      }>
      {isLoading ? (
        <StudentInfoSkeleton />
      ) : !studentDetail ? (
        <div className="py-spacing-900 text-center text-content-standard-tertiary">학생 정보를 불러올 수 없습니다.</div>
      ) : (
        <div className="flex flex-col gap-spacing-600">
          <section className="flex flex-col gap-spacing-300">
            <h3 className="font-semibold text-body text-content-standard-primary">기본 정보</h3>
            <div className="grid grid-cols-2 gap-spacing-300 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500">
              <div className="flex flex-col gap-spacing-50">
                <span className="text-content-standard-tertiary text-footnote">이름</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {studentDetail.student.name}
                </span>
              </div>
              <div className="flex flex-col gap-spacing-50">
                <span className="text-content-standard-tertiary text-footnote">전화번호</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {formatPhoneNumber(studentDetail.student.phoneNumber)}
                </span>
              </div>
              <div className="flex flex-col gap-spacing-50">
                <span className="text-content-standard-tertiary text-footnote">학부모 번호</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {studentDetail.student.parentPhoneNumber
                    ? formatPhoneNumber(studentDetail.student.parentPhoneNumber)
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-spacing-50">
                <span className="text-content-standard-tertiary text-footnote">학교</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {studentDetail.student.school || "-"}
                </span>
              </div>
              <div className="flex flex-col gap-spacing-50">
                <span className="text-content-standard-tertiary text-footnote">학년</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {getGrade(studentDetail.student.birthYear) || "-"}
                </span>
              </div>
              <div className="flex flex-col gap-spacing-50">
                <span className="text-content-standard-tertiary text-footnote">등록일</span>
                <span className="font-medium text-body text-content-standard-primary">
                  {new Date(studentDetail.student.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              {(() => {
                const activeTags = (studentDetail.student.tags || []).filter((assignment) =>
                  isTagActive(assignment.start_date, assignment.end_date),
                );
                if (activeTags.length === 0) return null;
                return (
                  <div className="col-span-2 flex flex-col gap-spacing-50">
                    <span className="text-content-standard-tertiary text-footnote">태그</span>
                    <div className="flex flex-wrap items-center gap-spacing-100">
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

          <section className="flex flex-col gap-spacing-300">
            <h3 className="font-semibold text-body text-content-standard-primary">수강 중인 수업</h3>
            {studentDetail.courses.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 text-center text-content-standard-tertiary text-footnote">
                수강 중인 수업이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider rounded-radius-400 border border-line-outline">
                {studentDetail.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-spacing-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                    <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                      <span className="truncate font-medium text-body text-content-standard-primary">
                        {course.name}
                      </span>
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
            )}
          </section>

          <section className="flex flex-col gap-spacing-300">
            <h3 className="font-semibold text-body text-content-standard-primary">
              시험 성적 & 과제
              {examWithAssignments.length > 0 && (
                <span className="ml-spacing-100 font-normal text-content-standard-tertiary">
                  ({Math.min(5, examWithAssignments.length)}/{examWithAssignments.length}개)
                </span>
              )}
            </h3>
            {examWithAssignments.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 text-center text-content-standard-tertiary text-footnote">
                시험 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider rounded-radius-400 border border-line-outline">
                {examWithAssignments.slice(0, 5).map(({ examScore, assignment }) => {
                  const isPassed = examScore.cutline !== null && examScore.score >= examScore.cutline;
                  const isFailed = examScore.cutline !== null && examScore.score < examScore.cutline;

                  return (
                    <div
                      key={examScore.id}
                      className="flex items-center justify-between gap-spacing-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                      <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                        <span className="truncate font-medium text-body text-content-standard-primary">
                          {examScore.exam.course.name} - {examScore.exam.name}
                        </span>
                        <span className="text-content-standard-tertiary text-footnote">
                          {examScore.score}
                          {examScore.maxScore !== null && `/${examScore.maxScore}`}점 · {examScore.rank}/
                          {examScore.totalStudents}등
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-spacing-200">
                        <Badge variant="blue" size="xs">
                          {examScore.exam.examNumber}회차
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
                        {assignment && (
                          <Badge
                            variant={
                              assignment.status === "완료"
                                ? "success"
                                : assignment.status === "미흡"
                                  ? "warning"
                                  : "danger"
                            }
                            size="xs">
                            과제 {assignment.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-spacing-300">
            <h3 className="font-semibold text-body text-content-standard-primary">
              최근 클리닉 출석
              {studentDetail.clinicHistory.length > 0 && (
                <span className="ml-spacing-100 font-normal text-content-standard-tertiary">
                  ({Math.min(5, studentDetail.clinicHistory.length)}/{studentDetail.clinicHistory.length}개)
                </span>
              )}
            </h3>
            {studentDetail.clinicHistory.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 text-center text-content-standard-tertiary text-footnote">
                클리닉 출석 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider rounded-radius-400 border border-line-outline">
                {studentDetail.clinicHistory.slice(0, 5).map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between gap-spacing-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                    <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                      <span className="truncate font-medium text-body text-content-standard-primary">
                        {history.clinic.name}
                      </span>
                      {history.note && (
                        <span className="truncate text-content-standard-tertiary text-footnote">{history.note}</span>
                      )}
                    </div>
                    <Badge variant="blue" size="xs">
                      {new Date(history.attendanceDate).toLocaleDateString("ko-KR")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-spacing-300">
            <h3 className="font-semibold text-body text-content-standard-primary">
              최근 재시험
              {studentDetail.retakeHistory.length > 0 && (
                <span className="ml-spacing-100 font-normal text-content-standard-tertiary">
                  ({Math.min(5, studentDetail.retakeHistory.length)}/{studentDetail.retakeHistory.length}개)
                </span>
              )}
            </h3>
            {studentDetail.retakeHistory.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 text-center text-content-standard-tertiary text-footnote">
                재시험 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider rounded-radius-400 border border-line-outline">
                {studentDetail.retakeHistory.slice(0, 5).map((retake) => (
                  <div
                    key={retake.id}
                    className="flex items-center justify-between gap-spacing-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                    <div className="flex min-w-0 flex-1 flex-col gap-spacing-50">
                      <span className="truncate font-medium text-body text-content-standard-primary">
                        {retake.exam.course.name} - {retake.exam.name}
                      </span>
                      <div className="flex items-center gap-spacing-200 text-content-standard-tertiary text-footnote">
                        <span>
                          {retake.scheduledDate
                            ? new Date(retake.scheduledDate).toLocaleDateString("ko-KR", {
                                month: "long",
                                day: "numeric",
                              })
                            : "날짜 미정"}
                        </span>
                        {(retake.postponeCount > 0 || retake.absentCount > 0) && (
                          <span className="text-content-standard-quaternary">
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
