"use client";

import { useAtom } from "jotai";
import { DropdownMenu, type DropdownMenuItem, MoreOptionsButton } from "@/shared/components/ui/dropdownMenu";
import { type Clinic, openMenuIdAtom } from "../(atoms)/useClinicsStore";

interface ClinicListProps {
  clinics: Clinic[];
  onEdit: (clinic: Clinic) => void;
  onDelete: (clinic: Clinic) => void;
  onAttendance: (clinic: Clinic) => void;
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

export default function ClinicList({ clinics, onEdit, onDelete, onAttendance }: ClinicListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);

  const getMenuItems = (clinic: Clinic): DropdownMenuItem[] => [
    { label: "수정", onClick: () => onEdit(clinic), dividerAfter: true },
    { label: "삭제", onClick: () => onDelete(clinic), variant: "danger" },
  ];

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <div className="space-y-spacing-300 md:hidden">
        {clinics.map((clinic) => (
          <div
            key={clinic.id}
            className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-400">
            <div className="mb-spacing-300 flex items-start justify-between">
              <div className="font-medium text-body text-content-standard-primary">{clinic.name}</div>
              <div className="relative">
                <MoreOptionsButton onClick={() => setOpenMenuId(openMenuId === clinic.id ? null : clinic.id)} />
                <DropdownMenu
                  isOpen={openMenuId === clinic.id}
                  onClose={() => setOpenMenuId(null)}
                  items={getMenuItems(clinic)}
                />
              </div>
            </div>

            <div className="mb-spacing-300 flex flex-wrap gap-spacing-100">
              {clinic.operating_days.sort().map((day) => (
                <span
                  key={day}
                  className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-100 font-medium text-footnote text-solid-blue">
                  {dayNames[day]}
                </span>
              ))}
            </div>

            <button
              onClick={() => onAttendance(clinic)}
              className="w-full rounded-radius-300 bg-core-accent px-spacing-400 py-spacing-200 font-medium text-footnote text-solid-white transition-opacity hover:opacity-90">
              출석 관리
            </button>
          </div>
        ))}
      </div>

      {/* 데스크탑 테이블 뷰 */}
      <div className="hidden rounded-radius-400 border border-line-outline bg-components-fill-standard-primary md:block">
        <table className="w-full rounded-radius-400">
          <thead className="bg-components-fill-standard-secondary">
            <tr>
              <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                클리닉명
              </th>
              <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                운영 요일
              </th>
              <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                관리
              </th>
              <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary" />
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic) => (
              <tr
                key={clinic.id}
                className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                <td className="px-spacing-500 py-spacing-400">
                  <div className="font-medium text-body text-content-standard-primary">{clinic.name}</div>
                </td>
                <td className="px-spacing-500 py-spacing-400">
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
                <td className="px-spacing-500 py-spacing-400">
                  <button
                    onClick={() => onAttendance(clinic)}
                    className="rounded-radius-300 bg-core-accent px-spacing-400 py-spacing-200 font-medium text-footnote text-solid-white transition-opacity hover:opacity-90">
                    출석 관리
                  </button>
                </td>
                <td className="relative px-spacing-500 py-spacing-400">
                  <MoreOptionsButton onClick={() => setOpenMenuId(openMenuId === clinic.id ? null : clinic.id)} />
                  <DropdownMenu
                    isOpen={openMenuId === clinic.id}
                    onClose={() => setOpenMenuId(null)}
                    items={getMenuItems(clinic)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
