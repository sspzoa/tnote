"use client";

import { useAtom } from "jotai";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { openMenuIdAtom, type Retake } from "../(atoms)/useRetakesStore";

interface RetakeListProps {
  retakes: Retake[];
  onViewStudent: (studentId: string) => void;
  onPostpone: (retake: Retake) => void;
  onAbsent: (retake: Retake) => void;
  onComplete: (retake: Retake) => void;
  onViewHistory: (retake: Retake) => void;
  onDelete: (retake: Retake) => void;
  onManagementStatusChange: (retake: Retake) => void;
  onEditDate: (retake: Retake) => void;
}

export default function RetakeList({
  retakes,
  onViewStudent,
  onPostpone,
  onAbsent,
  onComplete,
  onViewHistory,
  onDelete,
  onManagementStatusChange,
  onEditDate,
}: RetakeListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-solid-translucent-yellow text-solid-yellow",
      completed: "bg-solid-translucent-green text-solid-green",
      absent: "bg-solid-translucent-red text-solid-red",
    };
    const labels = {
      pending: "대기중",
      completed: "완료",
      absent: "결석",
    };
    return (
      <span
        className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-semibold text-footnote ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getManagementStatusBadge = (status: string) => {
    const isCompleted = status.includes("완료");

    let bgColor = "bg-solid-translucent-red";
    let textColor = "text-solid-red";

    if (isCompleted) {
      bgColor = "bg-solid-translucent-blue";
      textColor = "text-solid-blue";
    }

    return (
      <span
        className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-footnote ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
          <tr>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              학생
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              시험
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              예정일
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              상태
            </th>
            <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              관리 상태
            </th>
            <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
          </tr>
        </thead>
        <tbody>
          {retakes.map((retake) => (
            <tr
              key={retake.id}
              className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
              <td className="px-spacing-500 py-spacing-400">
                <button
                  onClick={() => onViewStudent(retake.student.id)}
                  className="text-left transition-colors hover:text-core-accent">
                  <div className="font-medium text-body text-content-standard-primary hover:text-core-accent">
                    {retake.student.name}
                  </div>
                  <div className="text-content-standard-tertiary text-footnote">
                    {formatPhoneNumber(retake.student.phone_number)}
                  </div>
                </button>
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <div className="text-body text-content-standard-primary">{retake.exam.name}</div>
                <div className="text-content-standard-secondary text-footnote">
                  {retake.exam.course.name} {retake.exam.exam_number}회차
                </div>
              </td>
              <td className="px-spacing-500 py-spacing-400">
                <div className="text-body text-content-standard-primary">{retake.current_scheduled_date || "-"}</div>
                {(retake.postpone_count > 0 || retake.absent_count > 0) && (
                  <div className="mt-spacing-100 flex gap-spacing-200">
                    {retake.postpone_count > 0 && (
                      <span className="text-content-standard-tertiary text-footnote">
                        연기 {retake.postpone_count}회
                      </span>
                    )}
                    {retake.absent_count > 0 && (
                      <span className="text-content-standard-tertiary text-footnote">결석 {retake.absent_count}회</span>
                    )}
                  </div>
                )}
              </td>
              <td className="px-spacing-500 py-spacing-400">{getStatusBadge(retake.status)}</td>
              <td className="px-spacing-500 py-spacing-400">
                <button
                  onClick={() => onManagementStatusChange(retake)}
                  className="transition-opacity hover:opacity-70">
                  {getManagementStatusBadge(retake.management_status)}
                </button>
              </td>
              <td className="relative px-spacing-500 py-spacing-400">
                <button
                  onClick={() => setOpenMenuId(openMenuId === retake.id ? null : retake.id)}
                  className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
                  <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {openMenuId === retake.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[140px] rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200">
                      {retake.status !== "completed" && (
                        <>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              onPostpone(retake);
                            }}
                            className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                            연기
                          </button>
                          {retake.status === "pending" && (
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onAbsent(retake);
                              }}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                              결석
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              onComplete(retake);
                            }}
                            className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                            완료
                          </button>
                          <div className="my-spacing-100 border-line-divider border-t" />
                        </>
                      )}
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onViewHistory(retake);
                        }}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                        이력 보기
                      </button>
                      {retake.status !== "completed" && (
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onEditDate(retake);
                          }}
                          className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                          수정
                        </button>
                      )}
                      <div className="my-spacing-100 border-line-divider border-t" />
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete(retake);
                        }}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative transition-colors hover:bg-solid-translucent-red">
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
