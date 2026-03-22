"use client";

import { useMemo } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { useUser } from "@/shared/hooks/useUser";
import { type MyClinicRecord, useMyClinicAttendance } from "./(hooks)/useMyClinicAttendance";

const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const formatClinicWeekdays = (days: number[] | null): string => {
  if (!days || days.length === 0) return "";
  return days.map((d) => WEEKDAY_NAMES[d]).join(", ");
};

type ClinicSortKey = "date" | "clinic";

export default function MyClinicPage() {
  const { user } = useUser();
  const { records, isLoading, error } = useMyClinicAttendance(!!user);

  const comparators = useMemo(
    () => ({
      date: (a: MyClinicRecord, b: MyClinicRecord) => a.attendanceDate.localeCompare(b.attendanceDate),
      clinic: (a: MyClinicRecord, b: MyClinicRecord) => a.clinic.name.localeCompare(b.clinic.name, "ko"),
    }),
    [],
  );

  const { sortedData, sortState, toggleSort } = useTableSort<MyClinicRecord, ClinicSortKey>({
    data: records,
    comparators,
    defaultSort: { key: "date", direction: "desc" },
  });

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
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
      />

      {isLoading ? (
        <SkeletonTable
          rows={5}
          columns={[
            "w-32",
            "w-24",
            { width: "w-20", badges: ["w-8", "w-8"] },
            { width: "w-24", badges: ["w-8", "w-8", "w-8"] },
          ]}
        />
      ) : records.length === 0 ? (
        <EmptyState message="클리닉 출석 기록이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
          <table className="w-full rounded-radius-400">
            <thead className="bg-components-fill-standard-secondary">
              <tr>
                <SortableHeader
                  label="날짜"
                  sortKey="date"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <SortableHeader
                  label="클리닉"
                  sortKey="clinic"
                  currentSortKey={sortState.key}
                  currentDirection={sortState.direction}
                  onSort={toggleSort}
                />
                <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                  상태
                </th>
                <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                  활동
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((record) => {
                const date = new Date(`${record.attendanceDate}T00:00:00`);
                const dateStr = date.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                });

                return (
                  <tr
                    key={record.id}
                    className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-primary">
                      {dateStr}
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-primary">
                      {record.clinic.name}
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
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
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
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
      )}
    </Container>
  );
}
