"use client";

import { useMemo } from "react";
import { Badge, Button } from "@/shared/components/ui";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/dataTable";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { formatDateDotYMD } from "@/shared/lib/utils/date";
import type { Clinic } from "../(atoms)/useClinicsStore";

interface ClinicListProps {
  clinics: Clinic[];
  onEdit: (clinic: Clinic) => void;
  onDelete: (clinic: Clinic) => void;
  onAttendance: (clinic: Clinic) => void;
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

type ClinicSortKey = "name" | "operatingDays";

export default function ClinicList({ clinics, onEdit, onDelete, onAttendance }: ClinicListProps) {
  const comparators = useMemo(
    () => ({
      name: (a: Clinic, b: Clinic) => a.name.localeCompare(b.name, "ko"),
      operatingDays: (a: Clinic, b: Clinic) => a.operating_days.length - b.operating_days.length,
    }),
    [],
  );

  const getMenuItems = (clinic: Clinic): DropdownMenuItem[] => [
    { label: "수정", onClick: () => onEdit(clinic), dividerAfter: true },
    { label: "삭제", onClick: () => onDelete(clinic), variant: "danger" },
  ];

  const columns: DataTableColumn<Clinic, ClinicSortKey>[] = [
    {
      id: "name",
      header: "클리닉명",
      sortKey: "name",
      cell: (clinic) => <span className="font-medium text-foreground">{clinic.name}</span>,
    },
    {
      id: "operatingDays",
      header: "운영 요일",
      sortKey: "operatingDays",
      cell: (clinic) => (
        <div className="flex gap-1">
          {[...clinic.operating_days].sort().map((day) => (
            <Badge key={day} variant="blue" size="sm">
              {dayNames[day]}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "period",
      header: "기간",
      cell: (clinic) => (
        <span className="text-muted-foreground">
          {formatDateDotYMD(clinic.start_date)} ~ {formatDateDotYMD(clinic.end_date)}
        </span>
      ),
    },
    {
      id: "manage",
      header: "관리",
      cell: (clinic) => (
        <Button size="xs" className="font-medium" onClick={() => onAttendance(clinic)}>
          출석 관리
        </Button>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (clinic) => <DropdownMenu items={getMenuItems(clinic)} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={clinics}
      getRowId={(clinic) => clinic.id}
      comparators={comparators}
      defaultSort={{ key: "name", direction: "asc" }}
    />
  );
}
