"use client";

import { useMemo } from "react";
import { Badge, Button } from "@/shared/components/ui";
import { DropdownMenu, type DropdownMenuItem } from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
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

  const { sortedData, sortState, toggleSort } = useTableSort<Clinic, ClinicSortKey>({
    data: clinics,
    comparators,
    defaultSort: { key: "name", direction: "asc" },
  });

  const getMenuItems = (clinic: Clinic): DropdownMenuItem[] => [
    { label: "수정", onClick: () => onEdit(clinic), dividerAfter: true },
    { label: "삭제", onClick: () => onDelete(clinic), variant: "danger" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full rounded-lg">
        <thead className="bg-muted">
          <tr>
            <SortableHeader
              label="클리닉명"
              sortKey="name"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <SortableHeader
              label="운영 요일"
              sortKey="operatingDays"
              currentSortKey={sortState.key}
              currentDirection={sortState.direction}
              onSort={toggleSort}
            />
            <th className="whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground">기간</th>
            <th className="whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground">관리</th>
            <th className="w-24 whitespace-nowrap px-5 py-4 text-left font-semibold text-base text-foreground" />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((clinic) => (
            <tr key={clinic.id} className="border-border border-t transition-colors hover:bg-accent">
              <td className="whitespace-nowrap px-5 py-4">
                <div className="font-medium text-base text-foreground">{clinic.name}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <div className="flex gap-1">
                  {clinic.operating_days.sort().map((day) => (
                    <Badge key={day} variant="blue" size="sm">
                      {dayNames[day]}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <span className="text-base text-muted-foreground">
                  {formatDateDotYMD(clinic.start_date)} ~ {formatDateDotYMD(clinic.end_date)}
                </span>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <Button size="xs" className="font-medium" onClick={() => onAttendance(clinic)}>
                  출석 관리
                </Button>
              </td>
              <td className="whitespace-nowrap px-5 py-4">
                <DropdownMenu items={getMenuItems(clinic)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
