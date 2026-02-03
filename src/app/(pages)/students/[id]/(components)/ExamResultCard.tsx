import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
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

  const getAssignmentVariant = (status: string): "success" | "warning" | "danger" => {
    if (status === "완료") return "success";
    if (status === "미흡") return "warning";
    return "danger";
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
              <Badge variant={getAssignmentVariant(assignment.status)} size="xs">
                과제 {assignment.status}
              </Badge>
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
                  <Badge variant={getAssignmentVariant(assignment.status)} size="xs">
                    {assignment.status}
                  </Badge>
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
