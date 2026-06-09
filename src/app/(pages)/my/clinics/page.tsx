"use client";

import { useMemo } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import { useUser } from "@/shared/hooks/useUser";
import { formatClinicWeekdays } from "@/shared/lib/utils/date";
import { type MyClinicRecord, useMyClinicAttendance } from "./(hooks)/useMyClinicAttendance";

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

  const columns: DataTableColumn<MyClinicRecord, ClinicSortKey>[] = [
    {
      id: "date",
      header: "날짜",
      sortKey: "date",
      cell: (record) => {
        const date = new Date(`${record.attendanceDate}T00:00:00`);
        const dateStr = date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "short",
          day: "numeric",
          weekday: "short",
        });
        return <span className="text-foreground">{dateStr}</span>;
      },
    },
    {
      id: "clinic",
      header: "클리닉",
      sortKey: "clinic",
      cell: (record) => (
        <>
          <span className="text-foreground">{record.clinic.name}</span>
          {record.isRequired && <span className="ml-1 text-primary text-xs">필참</span>}
        </>
      ),
    },
    {
      id: "status",
      header: "상태",
      cell: (record) => (
        <Badge variant={record.status === "absent" ? "danger" : "success"} size="sm">
          {record.status === "absent" ? "결석" : "출석"}
        </Badge>
      ),
    },
    {
      id: "activity",
      header: "활동",
      cell: (record) => {
        const activities: string[] = [];
        if (record.didRetakeExam) activities.push("재시험");
        if (record.didHomeworkCheck) activities.push("숙제검사");
        if (record.didQa) activities.push("질의응답");
        return (
          <span className="text-muted-foreground text-xs">{activities.length > 0 ? activities.join(", ") : "-"}</span>
        );
      },
    },
  ];

  if (error) return <ErrorComponent errorMessage="클리닉 출석을 불러오는데 실패했습니다." />;

  return (
    <Container>
      <Header
        title="클리닉 출석"
        subtitle={
          user?.requiredClinicWeekdays && user.requiredClinicWeekdays.length > 0
            ? `필참요일: ${formatClinicWeekdays(user.requiredClinicWeekdays, "")}`
            : undefined
        }
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
      />

      {isLoading ? (
        <SkeletonTable rows={5} columns={["w-32", "w-24", { width: "w-20", badges: ["w-8"] }, "w-24"]} />
      ) : records.length === 0 ? (
        <EmptyState message="클리닉 출석 기록이 없습니다." />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          getRowId={(record) => record.id}
          comparators={comparators}
          defaultSort={{ key: "date", direction: "desc" }}
        />
      )}
    </Container>
  );
}
