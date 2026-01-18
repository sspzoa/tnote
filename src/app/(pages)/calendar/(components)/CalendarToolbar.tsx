import { format } from "date-fns";
import { ko } from "date-fns/locale";

type FilterState = {
  course: boolean;
  retake: boolean;
  clinic: boolean;
};

type Props = {
  currentDate: Date;
  filters: FilterState;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onFilterChange: (filters: FilterState) => void;
};

const CalendarToolbar = ({ currentDate, filters, onPrevMonth, onNextMonth, onToday, onFilterChange }: Props) => {
  return (
    <div className="mb-spacing-500 flex items-center justify-between">
      <div className="flex items-center gap-spacing-200">
        <button
          onClick={onPrevMonth}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-all duration-150 hover:border-core-accent/30 hover:bg-core-accent-translucent hover:text-core-accent"
          type="button">
          ←
        </button>
        <button
          onClick={onToday}
          className="rounded-radius-300 bg-core-accent px-spacing-400 py-spacing-200 font-medium text-body text-solid-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          type="button">
          오늘
        </button>
        <button
          onClick={onNextMonth}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-all duration-150 hover:border-core-accent/30 hover:bg-core-accent-translucent hover:text-core-accent"
          type="button">
          →
        </button>
      </div>

      <h2 className="font-bold text-content-standard-primary text-heading">
        {format(currentDate, "yyyy년 M월", { locale: ko })}
      </h2>

      <div className="flex gap-spacing-200">
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, course: !filters.course })}
          className={`flex items-center gap-spacing-200 rounded-radius-300 px-spacing-300 py-spacing-100 transition-all ${
            filters.course
              ? "bg-solid-translucent-blue ring-1 ring-solid-blue"
              : "bg-components-fill-standard-secondary opacity-50"
          }`}>
          <div className="size-3 rounded-radius-100 bg-solid-blue" />
          <span className="text-content-standard-secondary text-footnote">수업</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, retake: !filters.retake })}
          className={`flex items-center gap-spacing-200 rounded-radius-300 px-spacing-300 py-spacing-100 transition-all ${
            filters.retake
              ? "bg-solid-translucent-red ring-1 ring-solid-red"
              : "bg-components-fill-standard-secondary opacity-50"
          }`}>
          <div className="size-3 rounded-radius-100 bg-solid-red" />
          <span className="text-content-standard-secondary text-footnote">재시험</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, clinic: !filters.clinic })}
          className={`flex items-center gap-spacing-200 rounded-radius-300 px-spacing-300 py-spacing-100 transition-all ${
            filters.clinic
              ? "bg-solid-translucent-purple ring-1 ring-solid-purple"
              : "bg-components-fill-standard-secondary opacity-50"
          }`}>
          <div className="size-3 rounded-radius-100 bg-solid-purple" />
          <span className="text-content-standard-secondary text-footnote">클리닉</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
