"use client";

import { useAtom } from "jotai";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterBar, FilterRow } from "@/shared/components/ui/toolbar";
import { showEndedClinicsAtom } from "../(atoms)/useClinicsStore";

export default function ClinicFilters() {
  const [showEndedClinics, setShowEndedClinics] = useAtom(showEndedClinicsAtom);

  return (
    <FilterBar label="필터">
      <FilterRow>
        <FilterButton active={showEndedClinics} onClick={() => setShowEndedClinics(!showEndedClinics)} variant="toggle">
          {showEndedClinics ? "종료된 클리닉 숨기기" : "종료된 클리닉 보기"}
        </FilterButton>
      </FilterRow>
    </FilterBar>
  );
}
