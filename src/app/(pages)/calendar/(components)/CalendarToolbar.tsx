import { format } from "date-fns";
import { ko } from "date-fns/locale";

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
          <button
            onClick={onPrevMonth}
            className="rounded-md border border-border bg-muted px-4 py-2 font-medium text-base text-foreground transition-all duration-150 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
            type="button">
            ←
          </button>
          <button
            onClick={onToday}
            className="rounded-md bg-primary px-4 py-2 font-medium text-base text-primary-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            type="button">
            오늘
          </button>
          <button
            onClick={onNextMonth}
            className="rounded-md border border-border bg-muted px-4 py-2 font-medium text-base text-foreground transition-all duration-150 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
            type="button">
            →
          </button>
        </div>

        <h2 className="font-bold text-foreground text-xl md:hidden">
          {format(currentDate, "yyyy년 M월", { locale: ko })}
        </h2>
      </div>

      <h2 className="hidden font-bold text-foreground text-xl md:block">
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
