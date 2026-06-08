"use client";

import { useAtom } from "jotai";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { showEndedClinicsAtom } from "../(atoms)/useClinicsStore";

export default function ClinicFilters() {
  const [showEndedClinics, setShowEndedClinics] = useAtom(showEndedClinicsAtom);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <span className="block font-medium text-muted-foreground text-sm">필터</span>

      <div className="flex flex-wrap items-center gap-3">
        <FilterButton active={showEndedClinics} onClick={() => setShowEndedClinics(!showEndedClinics)} variant="toggle">
          {showEndedClinics ? "종료된 클리닉 숨기기" : "종료된 클리닉 보기"}
        </FilterButton>
      </div>
    </div>
  );
}
