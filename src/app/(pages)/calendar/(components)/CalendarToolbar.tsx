import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils/cn";

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

// Token-driven filter chips, mapped to the same event tokens (course→primary, retake→destructive,
// clinic→event-clinic, assignment→warning). No hardcoded hex.
const FILTER_CONFIG: { key: keyof FilterState; label: string; active: string; dot: string }[] = [
  { key: "course", label: "수업", active: "border-primary/30 bg-primary/10 text-primary", dot: "bg-primary" },
  {
    key: "retake",
    label: "재시험",
    active: "border-destructive/30 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  {
    key: "clinic",
    label: "클리닉",
    active: "border-event-clinic/30 bg-event-clinic/10 text-event-clinic",
    dot: "bg-event-clinic",
  },
  { key: "assignment", label: "과제", active: "border-warning/30 bg-warning/10 text-warning", dot: "bg-warning" },
];

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

        <h2 className="font-semibold text-foreground text-sm md:hidden">
          {format(currentDate, "yyyy년 M월", { locale: ko })}
        </h2>
      </div>

      <h2 className="hidden font-semibold text-foreground text-sm md:block">
        {format(currentDate, "yyyy년 M월", { locale: ko })}
      </h2>

      <div className="flex flex-wrap gap-2">
        {FILTER_CONFIG.map((f) => {
          const isActive = filters[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange({ ...filters, [f.key]: !filters[f.key] })}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-1 text-xs transition-colors duration-150",
                isActive ? f.active : "border-border bg-transparent text-muted-foreground hover:bg-muted/50",
              )}>
              <span className={cn("size-2.5 rounded-sm", isActive ? f.dot : "bg-muted-foreground/40")} />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
