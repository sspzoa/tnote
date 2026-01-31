import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ScoreProgress } from "./ScoreProgress";

interface ExamScore {
  id: string;
  score: number;
  maxScore: number | null;
  cutline: number | null;
  rank: number;
  totalStudents: number;
  createdAt: string;
  exam: {
    id: string;
    name: string;
    examNumber: number;
    course: {
      id: string;
      name: string;
    };
  };
}

interface Assignment {
  id: string;
  status: "완료" | "미흡" | "미제출";
  note: string | null;
  exam: {
    id: string;
    name: string;
    examNumber: number;
    course: {
      id: string;
      name: string;
    };
  };
}

interface ExamResultCardProps {
  examScore: ExamScore;
  assignment?: Assignment;
}

export const ExamResultCard = ({ examScore, assignment }: ExamResultCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPassed = examScore.cutline !== null && examScore.score >= examScore.cutline;
  const isFailed = examScore.cutline !== null && examScore.score < examScore.cutline;

  const getAssignmentStatusStyle = (status: string) => {
    if (status === "완료") return "bg-solid-translucent-green text-core-status-positive";
    if (status === "미흡") return "bg-solid-translucent-yellow text-core-status-warning";
    return "bg-solid-translucent-red text-core-status-negative";
  };

  return (
    <div className="border-line-divider border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-spacing-300 px-spacing-500 py-spacing-400 text-left transition-colors hover:bg-components-fill-standard-secondary">
        <div className="flex min-w-0 flex-1 flex-col gap-spacing-100">
          <div className="flex items-center gap-spacing-200">
            <span className="truncate font-medium text-body text-content-standard-primary">
              {examScore.exam.course.name}
            </span>
            <span className="shrink-0 rounded-radius-200 bg-components-fill-standard-tertiary px-spacing-150 py-spacing-50 text-content-standard-secondary text-footnote">
              {examScore.exam.examNumber}회차
            </span>
          </div>
          <span className="text-content-standard-secondary text-footnote">{examScore.exam.name}</span>
        </div>

        <div className="flex shrink-0 items-center gap-spacing-300">
          <div className="flex items-center gap-spacing-200">
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
            {assignment && (
              <span
                className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${getAssignmentStatusStyle(assignment.status)}`}>
                과제 {assignment.status}
              </span>
            )}
          </div>
          <span className="font-semibold text-body text-content-standard-primary">
            {examScore.score}
            {examScore.maxScore !== null && `/${examScore.maxScore}`}점
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
          <div className="space-y-spacing-400 border-line-divider border-t bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
            <div className="space-y-spacing-200">
              <div className="flex items-center justify-between text-label">
                <span className="text-content-standard-secondary">점수</span>
                <span className="font-medium text-content-standard-primary">
                  {examScore.score}점 {examScore.maxScore !== null && `(만점 ${examScore.maxScore}점)`}
                  {examScore.cutline !== null && ` · 커트라인 ${examScore.cutline}점`}
                </span>
              </div>
              <ScoreProgress score={examScore.score} maxScore={examScore.maxScore} cutline={examScore.cutline} />
            </div>

            <div className="flex items-center justify-between text-label">
              <span className="text-content-standard-secondary">등수</span>
              <span className="font-medium text-content-standard-primary">
                {examScore.rank}등 / {examScore.totalStudents}명
              </span>
            </div>

            {assignment && (
              <div className="flex items-center justify-between text-label">
                <span className="text-content-standard-secondary">과제 상태</span>
                <div className="flex items-center gap-spacing-200">
                  <span
                    className={`rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-footnote ${getAssignmentStatusStyle(assignment.status)}`}>
                    {assignment.status}
                  </span>
                  {assignment.note && <span className="text-content-standard-tertiary">({assignment.note})</span>}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-label">
              <span className="text-content-standard-secondary">응시일</span>
              <span className="text-content-standard-primary">
                {new Date(examScore.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
