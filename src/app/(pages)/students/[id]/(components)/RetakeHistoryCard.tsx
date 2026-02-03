"use client";

import { Calendar, ChevronDown, Clock, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";
import {
  getActionBadgeVariant,
  getActionLabel,
  getManagementStatusVariant,
  getRetakeStatusVariant,
  RETAKE_STATUS_LABELS,
} from "./utils";

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

interface RetakeInfo {
  id: string;
  status: "pending" | "completed" | "absent";
  managementStatus: string;
  scheduledDate: string | null;
  postponeCount: number;
  absentCount: number;
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

interface RetakeHistoryCardProps {
  retake: RetakeInfo;
}

const getStatusChangeText = (status: string) => {
  if (status === "pending") return "대기중";
  if (status === "completed") return "완료";
  return "결석";
};

export const RetakeHistoryCard = ({ retake }: RetakeHistoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<RetakeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleToggle = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);

    if (!hasLoaded) {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(`/api/retakes/${retake.id}/history`);
        const data = await response.json();
        setHistory(data.data || []);
      } catch {
        setHistory([]);
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    }
  };

  return (
    <div className="border-line-divider border-b last:border-b-0">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-spacing-400 px-spacing-500 py-spacing-400 text-left transition-colors hover:bg-components-fill-standard-secondary">
        <div className="flex min-w-0 flex-1 flex-col gap-spacing-200">
          <div className="flex items-center gap-spacing-200">
            <span className="truncate font-medium text-body text-content-standard-primary">
              {retake.exam.course.name}
            </span>
            <span className="shrink-0 rounded-radius-200 bg-components-fill-standard-tertiary px-spacing-150 py-spacing-50 text-content-standard-secondary text-footnote">
              {retake.exam.examNumber}회차
            </span>
          </div>

          <div className="flex items-center gap-spacing-300">
            <span className="text-content-standard-secondary text-label">{retake.exam.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-spacing-200">
            <span className="flex items-center gap-spacing-100 text-content-standard-secondary text-label">
              <Calendar className="h-3.5 w-3.5" />
              {retake.scheduledDate
                ? new Date(retake.scheduledDate).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })
                : "날짜 미정"}
            </span>

            {retake.managementStatus && (
              <Badge variant={getManagementStatusVariant(retake.managementStatus)} size="xs">
                {retake.managementStatus}
              </Badge>
            )}

            {retake.postponeCount > 0 && (
              <Badge variant="blue" size="xs">
                연기 {retake.postponeCount}회
              </Badge>
            )}

            {retake.absentCount > 0 && (
              <Badge variant="red" size="xs">
                결석 {retake.absentCount}회
              </Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-spacing-300">
          <Badge variant={getRetakeStatusVariant(retake.status)} size="sm">
            {RETAKE_STATUS_LABELS[retake.status]}
          </Badge>
          <ChevronDown
            className={`h-5 w-5 text-content-standard-tertiary transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="border-line-divider border-t bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
            {isLoading ? (
              <div className="flex flex-col gap-spacing-300">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-radius-300" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center gap-spacing-200 py-spacing-400">
                <Clock className="h-8 w-8 text-content-standard-quaternary" />
                <p className="text-center text-content-standard-secondary text-label">이력이 없습니다.</p>
              </div>
            ) : (
              <div className="relative flex flex-col gap-spacing-300">
                <div className="absolute top-spacing-400 bottom-spacing-400 left-[11px] w-0.5 bg-line-divider" />

                {history.map((item, index) => (
                  <div key={item.id} className="relative flex gap-spacing-300">
                    <div
                      className={`relative z-10 mt-spacing-50 h-6 w-6 shrink-0 rounded-radius-full ${
                        index === 0
                          ? "bg-core-accent"
                          : "border-2 border-line-outline bg-components-fill-standard-primary"
                      }`}
                    />

                    <div className="flex-1 rounded-radius-300 border border-line-outline bg-components-fill-standard-primary p-spacing-400">
                      <div className="flex items-start justify-between gap-spacing-300">
                        <div className="flex flex-col gap-spacing-200">
                          <Badge variant={getActionBadgeVariant(item.action_type)} size="xs">
                            {getActionLabel(item.action_type)}
                          </Badge>

                          <div className="text-content-standard-primary text-label">
                            {item.action_type === "assign" && (
                              <span>{item.new_date ? `예정일: ${item.new_date}` : "예정일 미지정"}</span>
                            )}
                            {(item.action_type === "postpone" ||
                              item.action_type === "date_edit" ||
                              item.action_type === "complete") &&
                              item.new_date && (
                                <span className="flex items-center gap-spacing-200">
                                  <span className="text-content-standard-tertiary">
                                    {item.previous_date || "미지정"}
                                  </span>
                                  <span className="text-content-standard-quaternary">→</span>
                                  <span className="font-medium">{item.new_date}</span>
                                </span>
                              )}
                            {item.action_type === "status_change" && item.previous_status && item.new_status && (
                              <span className="flex items-center gap-spacing-200">
                                <span className="text-content-standard-tertiary">
                                  {getStatusChangeText(item.previous_status)}
                                </span>
                                <span className="text-content-standard-quaternary">→</span>
                                <span className="font-medium">{getStatusChangeText(item.new_status)}</span>
                              </span>
                            )}
                            {item.action_type === "management_status_change" &&
                              item.previous_management_status &&
                              item.new_management_status && (
                                <span className="flex items-center gap-spacing-200">
                                  <span className="text-content-standard-tertiary">
                                    {item.previous_management_status}
                                  </span>
                                  <span className="text-content-standard-quaternary">→</span>
                                  <span className="font-medium">{item.new_management_status}</span>
                                </span>
                              )}
                          </div>

                          {item.note && <p className="text-content-standard-secondary text-label">{item.note}</p>}
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-spacing-100 text-label">
                          <span className="text-content-standard-secondary">
                            {new Date(item.created_at).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {item.performed_by && (
                            <span className="flex items-center gap-spacing-100 text-content-standard-tertiary">
                              <User className="h-3.5 w-3.5" />
                              {item.performed_by.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
