"use client";

import { useAtom } from "jotai";
import { X } from "lucide-react";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterRow } from "@/shared/components/ui/toolbar";
import { showEndedClinicsAtom } from "../(atoms)/useClinicsStore";

export default function ClinicFilters() {
  const [showEndedClinics, setShowEndedClinics] = useAtom(showEndedClinicsAtom);

  const isFilterActive = showEndedClinics;

  const handleResetFilters = () => {
    setShowEndedClinics(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <FilterRow>
        <FilterButton active={showEndedClinics} onClick={() => setShowEndedClinics(!showEndedClinics)} variant="toggle">
          {showEndedClinics ? "종료된 클리닉 숨기기" : "종료된 클리닉 보기"}
        </FilterButton>
      </FilterRow>

      {isFilterActive && (
        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex w-fit items-center gap-1 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground">
          <X className="size-3" />
          필터 초기화
        </button>
      )}
    </div>
  );
}
