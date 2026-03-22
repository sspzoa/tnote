"use client";

import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonSpinner } from "@/shared/components/ui/skeleton";
import { useUser } from "@/shared/hooks/useUser";
import { useMyClinicAttendance } from "./(hooks)/useMyClinicAttendance";

const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const formatClinicWeekdays = (days: number[] | null): string => {
  if (!days || days.length === 0) return "";
  return days.map((d) => WEEKDAY_NAMES[d]).join(", ");
};

export default function MyClinicPage() {
  const { user } = useUser();
  const { records, isLoading, error } = useMyClinicAttendance(!!user);

  if (error) return <ErrorComponent errorMessage="클리닉 출석을 불러오는데 실패했습니다." />;

  return (
    <Container>
      <Header
        title="클리닉 출석"
        subtitle={
          user?.requiredClinicWeekdays && user.requiredClinicWeekdays.length > 0
            ? `필참요일: ${formatClinicWeekdays(user.requiredClinicWeekdays)}`
            : undefined
        }
      />

      {isLoading ? (
        <SkeletonSpinner className="py-spacing-900" size="md" />
      ) : records.length === 0 ? (
        <EmptyState message="클리닉 출석 기록이 없습니다." />
      ) : (
        <div className="flex flex-col gap-spacing-400">
          <div className="overflow-hidden rounded-radius-400 border border-line-outline">
            <table className="w-full">
              <thead>
                <tr className="border-line-outline border-b bg-components-fill-standard-secondary">
                  <th className="px-spacing-400 py-spacing-300 text-left font-medium text-content-standard-secondary text-label">
                    날짜
                  </th>
                  <th className="px-spacing-400 py-spacing-300 text-left font-medium text-content-standard-secondary text-label">
                    클리닉
                  </th>
                  <th className="px-spacing-400 py-spacing-300 text-left font-medium text-content-standard-secondary text-label">
                    상태
                  </th>
                  <th className="px-spacing-400 py-spacing-300 text-left font-medium text-content-standard-secondary text-label">
                    활동
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-divider">
                {records.map((record) => {
                  const date = new Date(`${record.attendanceDate}T00:00:00`);
                  const dateStr = date.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  });

                  return (
                    <tr key={record.id} className="transition-colors hover:bg-components-fill-standard-secondary">
                      <td className="px-spacing-400 py-spacing-300 text-body text-content-standard-primary">
                        {dateStr}
                      </td>
                      <td className="px-spacing-400 py-spacing-300 text-body text-content-standard-primary">
                        {record.clinic.name}
                      </td>
                      <td className="px-spacing-400 py-spacing-300">
                        <div className="flex items-center gap-spacing-100">
                          {record.status === "absent" ? (
                            <Badge variant="danger" size="xs">
                              결석
                            </Badge>
                          ) : (
                            <Badge variant="success" size="xs">
                              출석
                            </Badge>
                          )}
                          {record.isRequired ? (
                            <Badge variant="blue" size="xs">
                              필참
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="xs">
                              자율
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-spacing-400 py-spacing-300">
                        <div className="flex items-center gap-spacing-100">
                          {record.didRetakeExam && (
                            <Badge variant="purple" size="xs">
                              재시험
                            </Badge>
                          )}
                          {record.didHomeworkCheck && (
                            <Badge variant="green" size="xs">
                              숙제검사
                            </Badge>
                          )}
                          {record.didQa && (
                            <Badge variant="orange" size="xs">
                              질의응답
                            </Badge>
                          )}
                          {!record.didRetakeExam && !record.didHomeworkCheck && !record.didQa && (
                            <span className="text-content-standard-quaternary text-footnote">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
}
