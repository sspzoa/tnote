"use client";

import { useAtom } from "jotai";
import { type Clinic, openMenuIdAtom } from "../(atoms)/useClinicsStore";

interface ClinicListProps {
  clinics: Clinic[];
  onEdit: (clinic: Clinic) => void;
  onDelete: (clinic: Clinic) => void;
  onAttendance: (clinic: Clinic) => void;
}

export default function ClinicList({ clinics, onEdit, onDelete, onAttendance }: ClinicListProps) {
  const [openMenuId, setOpenMenuId] = useAtom(openMenuIdAtom);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
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
            <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
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
                <button
                  onClick={() => setOpenMenuId(openMenuId === clinic.id ? null : clinic.id)}
                  className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
                  <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {openMenuId === clinic.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[120px] rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200 shadow-lg">
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onEdit(clinic);
                        }}
                        className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                        수정
                      </button>
                      <div className="my-spacing-100 border-line-divider border-t" />
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete(clinic);
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
