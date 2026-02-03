"use client";

import { useAtom } from "jotai";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { showEndedClinicsAtom } from "../(atoms)/useClinicsStore";

export default function ClinicFilters() {
  const [showEndedClinics, setShowEndedClinics] = useAtom(showEndedClinicsAtom);

  return (
    <div className="flex flex-col gap-spacing-400 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-400">
      <span className="block font-medium text-content-standard-tertiary text-label">필터</span>

      <div className="flex flex-wrap items-center gap-spacing-300">
        <FilterButton active={showEndedClinics} onClick={() => setShowEndedClinics(!showEndedClinics)} variant="toggle">
          {showEndedClinics ? "종료된 클리닉 숨기기" : "종료된 클리닉 보기"}
        </FilterButton>
      </div>
    </div>
  );
}
