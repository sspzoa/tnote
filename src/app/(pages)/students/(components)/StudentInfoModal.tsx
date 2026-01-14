"use client";

import { useAtom, useAtomValue } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { getGrade } from "@/shared/lib/utils/student";
import { showInfoModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useStudentDetail } from "../(hooks)/useStudentDetail";

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

const formatDaysOfWeek = (days: number[] | null): string => {
  if (!days || days.length === 0) return "-";
  return days.map((d) => DAY_NAMES[d]).join(", ");
};

export default function StudentInfoModal() {
  const [showModal, setShowModal] = useAtom(showInfoModalAtom);
  const selectedStudent = useAtomValue(selectedStudentAtom);
  const { studentDetail, isLoading } = useStudentDetail(selectedStudent?.id || null);

  if (!selectedStudent) return null;

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title={`${selectedStudent.name}`}
      subtitle="학생 상세 정보"
      maxWidth="2xl"
      footer={
        <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
          닫기
        </Button>
      }>
      {isLoading ? (
        <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
      ) : !studentDetail ? (
        <div className="py-spacing-900 text-center text-content-standard-tertiary">학생 정보를 불러올 수 없습니다.</div>
      ) : (
        <div className="flex flex-col gap-spacing-600">
          <section>
            <h3 className="mb-spacing-300 font-semibold text-body text-content-standard-primary">기본 정보</h3>
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
            </div>
          </section>

          <section>
            <h3 className="mb-spacing-300 font-semibold text-body text-content-standard-primary">수강 중인 수업</h3>
            {studentDetail.courses.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 text-center text-content-standard-tertiary text-footnote">
                수강 중인 수업이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                    <div className="flex flex-col gap-spacing-50">
                      <span className="font-medium text-body text-content-standard-primary">{course.name}</span>
                      <span className="text-content-standard-tertiary text-footnote">
                        등록: {new Date(course.enrolled_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 text-footnote text-solid-blue">
                      {formatDaysOfWeek(course.days_of_week)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-spacing-300 font-semibold text-body text-content-standard-primary">최근 시험 성적</h3>
            {studentDetail.examScores.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 text-center text-content-standard-tertiary text-footnote">
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
                      className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                      <div className="flex flex-col gap-spacing-50">
                        <span className="font-medium text-body text-content-standard-primary">
                          {score.exam.course.name} - {score.exam.name}
                        </span>
                        <span className="text-content-standard-tertiary text-footnote">
                          {new Date(score.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-spacing-200">
                        <span className="font-medium text-body text-content-standard-primary">
                          {score.score}
                          {score.maxScore !== null && `/${score.maxScore}`}점
                        </span>
                        <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 text-footnote text-solid-blue">
                          {score.rank}/{score.totalStudents}등
                        </span>
                        {isPassed && (
                          <span className="rounded-radius-200 bg-solid-translucent-green px-spacing-200 py-spacing-50 text-footnote text-solid-green">
                            통과
                          </span>
                        )}
                        {isFailed && (
                          <span className="rounded-radius-200 bg-solid-translucent-red px-spacing-200 py-spacing-50 text-core-status-negative text-footnote">
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
            <h3 className="mb-spacing-300 font-semibold text-body text-content-standard-primary">최근 과제 상태</h3>
            {studentDetail.assignmentHistory.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 text-center text-content-standard-tertiary text-footnote">
                과제 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.assignmentHistory.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                    <div className="flex flex-col gap-spacing-50">
                      <span className="font-medium text-body text-content-standard-primary">
                        {assignment.exam.course.name} - {assignment.exam.name}
                      </span>
                      {assignment.note && (
                        <span className="text-content-standard-tertiary text-footnote">{assignment.note}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-spacing-200">
                      <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 text-footnote text-solid-blue">
                        {assignment.exam.examNumber}회차
                      </span>
                      <span
                        className={`rounded-radius-200 px-spacing-200 py-spacing-50 text-footnote ${
                          assignment.status === "완료"
                            ? "bg-solid-translucent-green text-solid-green"
                            : assignment.status === "미흡"
                              ? "bg-solid-translucent-orange text-solid-orange"
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
            <h3 className="mb-spacing-300 font-semibold text-body text-content-standard-primary">최근 클리닉 출석</h3>
            {studentDetail.clinicHistory.length === 0 ? (
              <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-500 text-center text-content-standard-tertiary text-footnote">
                클리닉 출석 기록이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-line-divider overflow-hidden rounded-radius-400 border border-line-outline">
                {studentDetail.clinicHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
                    <div className="flex flex-col gap-spacing-50">
                      <span className="font-medium text-body text-content-standard-primary">{history.clinic.name}</span>
                      {history.note && (
                        <span className="text-content-standard-tertiary text-footnote">{history.note}</span>
                      )}
                    </div>
                    <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 text-footnote text-solid-blue">
                      {new Date(history.attendanceDate).toLocaleDateString("ko-KR")}
                    </span>
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
