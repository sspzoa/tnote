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
        <SkeletonTable rows={5} columns={["w-32", "w-24", { width: "w-20", badges: ["w-8"] }, "w-24"]} />
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

                const activities: string[] = [];
                if (record.didRetakeExam) activities.push("재시험");
                if (record.didHomeworkCheck) activities.push("숙제검사");
                if (record.didQa) activities.push("질의응답");

                return (
                  <tr
                    key={record.id}
                    className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-primary">
                      {dateStr}
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                      <span className="text-body text-content-standard-primary">{record.clinic.name}</span>
                      {record.isRequired && <span className="ml-spacing-100 text-core-accent text-footnote">필참</span>}
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                      <Badge variant={record.status === "absent" ? "danger" : "success"} size="sm">
                        {record.status === "absent" ? "결석" : "출석"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-content-standard-secondary text-footnote">
                      {activities.length > 0 ? activities.join(", ") : "-"}
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
