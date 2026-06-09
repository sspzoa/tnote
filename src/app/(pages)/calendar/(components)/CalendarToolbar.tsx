import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface FilterState {
  course: boolean;
  retake: boolean;
  clinic: boolean;
  assignment: boolean;
}

interface Props {
  currentDate: Date;
  filters: FilterState;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onFilterChange: (filters: FilterState) => void;
}

export default function CalendarToolbar({
  currentDate,
  filters,
  onPrevMonth,
  onNextMonth,
  onToday,
  onFilterChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center justify-between gap-2 md:justify-start">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={onPrevMonth} type="button" aria-label="이전 달">
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="sm" onClick={onToday} type="button">
            오늘
          </Button>
          <Button variant="outline" size="icon-sm" onClick={onNextMonth} type="button" aria-label="다음 달">
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <h2 className="font-semibold text-base text-foreground md:hidden">
          {format(currentDate, "yyyy년 M월", { locale: ko })}
        </h2>
      </div>

      <h2 className="hidden font-semibold text-base text-foreground md:block">
        {format(currentDate, "yyyy년 M월", { locale: ko })}
      </h2>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, course: !filters.course })}
          className={`flex items-center gap-2 rounded-md px-3 py-1 transition-all ${
            filters.course ? "bg-[#3B82F6]/20 ring-1 ring-[#3B82F6]" : "bg-muted opacity-50"
          }`}>
          <div className="h-3 w-3 rounded-sm bg-[#3B82F6]" />
          <span className="text-muted-foreground text-xs">수업</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, retake: !filters.retake })}
          className={`flex items-center gap-2 rounded-md px-3 py-1 transition-all ${
            filters.retake ? "bg-[#EF4444]/20 ring-1 ring-[#EF4444]" : "bg-muted opacity-50"
          }`}>
          <div className="h-3 w-3 rounded-sm bg-[#EF4444]" />
          <span className="text-muted-foreground text-xs">재시험</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, clinic: !filters.clinic })}
          className={`flex items-center gap-2 rounded-md px-3 py-1 transition-all ${
            filters.clinic ? "bg-[#8B5CF6]/20 ring-1 ring-[#8B5CF6]" : "bg-muted opacity-50"
          }`}>
          <div className="h-3 w-3 rounded-sm bg-[#8B5CF6]" />
          <span className="text-muted-foreground text-xs">클리닉</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, assignment: !filters.assignment })}
          className={`flex items-center gap-2 rounded-md px-3 py-1 transition-all ${
            filters.assignment ? "bg-[#F59E0B]/20 ring-1 ring-[#F59E0B]" : "bg-muted opacity-50"
          }`}>
          <div className="h-3 w-3 rounded-sm bg-[#F59E0B]" />
          <span className="text-muted-foreground text-xs">과제</span>
        </button>
      </div>
    </div>
  );
}
