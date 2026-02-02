"use client";

import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  type DropdownMenuItem,
  type MenuPosition,
  MoreOptionsButton,
} from "@/shared/components/ui/dropdownMenu";
import { SortableHeader } from "@/shared/components/ui/sortableHeader";
import { useTableSort } from "@/shared/hooks/useTableSort";
import { type Clinic, openMenuIdAtom } from "../(atoms)/useClinicsStore";

interface ClinicListProps {
  clinics: Clinic[];
  onEdit: (clinic: Clinic) => void;
  onDelete: (clinic: Clinic) => void;
  onAttendance: (clinic: Clinic) => void;
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
};

type ClinicSortKey = "name" | "operatingDays";

export default function ClinicList({ clinics, onEdit, onDelete, onAttendance }: ClinicListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

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
    <div className="overflow-x-auto rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
      <table className="w-full rounded-radius-400">
        <thead className="bg-components-fill-standard-secondary">
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
            <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              기간
            </th>
            <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
              관리
            </th>
            <th className="w-24 whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
          </tr>
        </thead>
        <tbody>
          {sortedData.map((clinic) => (
            <tr
              key={clinic.id}
              className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <div className="font-medium text-body text-content-standard-primary">{clinic.name}</div>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <div className="flex gap-spacing-100">
                  {clinic.operating_days.sort().map((day) => (
                    <span
                      key={day}
                      className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-100 font-medium text-footnote text-solid-blue">
                      {dayNames[day]}
                    </span>
                  ))}
                </div>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <span className="text-body text-content-standard-secondary">
                  {formatDate(clinic.start_date)} ~ {formatDate(clinic.end_date)}
                </span>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <button
                  onClick={() => onAttendance(clinic)}
                  className="rounded-radius-300 bg-core-accent px-spacing-400 py-spacing-200 font-medium text-footnote text-solid-white transition-opacity hover:opacity-90">
                  출석 관리
                </button>
              </td>
              <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
                <MoreOptionsButton
                  onClick={(pos) => {
                    if (openMenuId === clinic.id) {
                      setOpenMenuId(null);
                      setMenuPosition(null);
                    } else {
                      setOpenMenuId(clinic.id);
                      setMenuPosition(pos);
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openMenuId && (
        <DropdownMenu
          isOpen={true}
          onClose={() => {
            setOpenMenuId(null);
            setMenuPosition(null);
          }}
          items={getMenuItems(sortedData.find((c) => c.id === openMenuId)!)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
