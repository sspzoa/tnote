"use client";

import { format, getDay, parse, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/app/calendar-custom.css";
import Container from "@/shared/components/common/Container";
import Header from "@/shared/components/common/Header";
import type { CalendarEvent } from "@/shared/types";
import { useCalendarEvents } from "./(hooks)/useCalendarEvents";

interface FilterState {
  course: boolean;
  retake: boolean;
  clinic: boolean;
}

const locales = {
  ko: ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CustomToolbar = ({
  onNavigate,
  date,
  currentDate,
  setCurrentDate,
  filters,
  setFilters,
}: {
  onNavigate: (action: "PREV" | "NEXT" | "TODAY" | "DATE", newDate?: Date) => void;
  date: Date;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}) => {
  const goToBack = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    onNavigate("PREV");
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    onNavigate("NEXT");
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onNavigate("TODAY");
  };

  return (
    <div className="mb-spacing-500 flex flex-col gap-spacing-400 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-spacing-300">
        <button
          onClick={goToBack}
          className="rounded-radius-300 bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover"
          type="button">
          ←
        </button>
        <button
          onClick={goToToday}
          className="rounded-radius-300 bg-core-accent px-spacing-400 py-spacing-200 font-medium text-body text-solid-white transition-opacity hover:opacity-90"
          type="button">
          오늘
        </button>
        <button
          onClick={goToNext}
          className="rounded-radius-300 bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover"
          type="button">
          →
        </button>
      </div>

      <h2 className="font-bold text-content-standard-primary text-heading">
        {format(date, "yyyy년 M월", { locale: ko })}
      </h2>

      <div className="flex flex-wrap gap-spacing-200">
        <button
          type="button"
          onClick={() => setFilters({ ...filters, course: !filters.course })}
          className={`flex items-center gap-spacing-200 rounded-radius-300 px-spacing-300 py-spacing-100 transition-all ${
            filters.course
              ? "bg-[#3B82F6]/20 ring-1 ring-[#3B82F6]"
              : "bg-components-fill-standard-secondary opacity-50"
          }`}>
          <div className="h-3 w-3 rounded-radius-100 bg-[#3B82F6]" />
          <span className="text-content-standard-secondary text-footnote">수업</span>
        </button>
        <button
          type="button"
          onClick={() => setFilters({ ...filters, retake: !filters.retake })}
          className={`flex items-center gap-spacing-200 rounded-radius-300 px-spacing-300 py-spacing-100 transition-all ${
            filters.retake
              ? "bg-[#EF4444]/20 ring-1 ring-[#EF4444]"
              : "bg-components-fill-standard-secondary opacity-50"
          }`}>
          <div className="h-3 w-3 rounded-radius-100 bg-[#EF4444]" />
          <span className="text-content-standard-secondary text-footnote">재시험</span>
        </button>
        <button
          type="button"
          onClick={() => setFilters({ ...filters, clinic: !filters.clinic })}
          className={`flex items-center gap-spacing-200 rounded-radius-300 px-spacing-300 py-spacing-100 transition-all ${
            filters.clinic
              ? "bg-[#8B5CF6]/20 ring-1 ring-[#8B5CF6]"
              : "bg-components-fill-standard-secondary opacity-50"
          }`}>
          <div className="h-3 w-3 rounded-radius-100 bg-[#8B5CF6]" />
          <span className="text-content-standard-secondary text-footnote">클리닉</span>
        </button>
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<FilterState>({
    course: true,
    retake: true,
    clinic: true,
  });

  const { events, isLoading } = useCalendarEvents(currentDate);

  // Hide overlay when modal opens
  useEffect(() => {
    if (selectedEvent) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [selectedEvent]);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let color = "";
    let backgroundColor = "";
    let borderColor = "";

    switch (event.type) {
      case "course":
        color = "#2563EB";
        backgroundColor = "rgba(59, 130, 246, 0.12)";
        borderColor = "rgba(59, 130, 246, 0.3)";
        break;
      case "retake":
        if (event.metadata?.status === "completed") {
          color = "#059669";
          backgroundColor = "rgba(16, 185, 129, 0.12)";
          borderColor = "rgba(16, 185, 129, 0.3)";
        } else if (event.metadata?.status === "absent") {
          color = "#4B5563";
          backgroundColor = "rgba(107, 114, 128, 0.12)";
          borderColor = "rgba(107, 114, 128, 0.3)";
        } else {
          color = "#DC2626";
          backgroundColor = "rgba(239, 68, 68, 0.12)";
          borderColor = "rgba(239, 68, 68, 0.3)";
        }
        break;
      case "clinic":
        if (event.metadata?.status === "attended") {
          color = "#059669";
          backgroundColor = "rgba(16, 185, 129, 0.12)";
          borderColor = "rgba(16, 185, 129, 0.3)";
        } else if (event.metadata?.status === "absent") {
          color = "#4B5563";
          backgroundColor = "rgba(107, 114, 128, 0.12)";
          borderColor = "rgba(107, 114, 128, 0.3)";
        } else {
          color = "#7C3AED";
          backgroundColor = "rgba(139, 92, 246, 0.12)";
          borderColor = "rgba(139, 92, 246, 0.3)";
        }
        break;
    }

    return {
      style: {
        backgroundColor,
        color,
        borderLeft: `3px solid ${color}`,
        borderTop: `1px solid ${borderColor}`,
        borderRight: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`,
      },
    };
  };

  const filteredEvents = events.filter((event) => {
    if (event.type === "course" && !filters.course) return false;
    if (event.type === "retake" && !filters.retake) return false;
    if (event.type === "clinic" && !filters.clinic) return false;
    return true;
  });

  return (
    <Container>
      <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
        ← 홈으로 돌아가기
      </Link>

      <Header title="캘린더" subtitle="수업, 재시험, 클리닉 일정을 확인하세요" />

      <div className="rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
        {isLoading ? (
          <div className="flex min-h-[600px] items-center justify-center">
            <p className="text-body text-content-standard-tertiary">로딩 중...</p>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={handleNavigate}
            onSelectEvent={(event) => setSelectedEvent(event)}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: (props) => (
                <CustomToolbar
                  {...props}
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  filters={filters}
                  setFilters={setFilters}
                />
              ),
            }}
            messages={{
              today: "오늘",
              previous: "이전",
              next: "다음",
              month: "월",
              week: "주",
              day: "일",
              agenda: "일정",
              date: "날짜",
              time: "시간",
              event: "이벤트",
              noEventsInRange: "이 범위에 일정이 없습니다.",
              showMore: (total: number) => `+${total} 더보기`,
            }}
            culture="ko"
            views={["month"]}
            defaultView="month"
            popup
            style={{ height: "600px" }}
          />
        )}
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
          onClick={() => setSelectedEvent(null)}>
          <div
            className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
            onClick={(e) => e.stopPropagation()}>
            <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
              <h2 className="font-bold text-content-standard-primary text-heading">일정 상세</h2>
            </div>

            <div className="space-y-spacing-400 p-spacing-600">
              <div>
                <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
                  타입
                </label>
                <div className="flex items-center gap-spacing-200">
                  <div
                    className="h-4 w-4 rounded-radius-100"
                    style={{
                      backgroundColor:
                        selectedEvent.type === "course"
                          ? "#3B82F6"
                          : selectedEvent.type === "retake"
                            ? "#EF4444"
                            : selectedEvent.metadata?.status === "attended"
                              ? "#10B981"
                              : selectedEvent.metadata?.status === "absent"
                                ? "#6B7280"
                                : "#8B5CF6",
                    }}
                  />
                  <span className="text-body text-content-standard-primary">
                    {selectedEvent.type === "course" ? "수업" : selectedEvent.type === "retake" ? "재시험" : "클리닉"}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
                  제목
                </label>
                <p className="text-body text-content-standard-primary">{selectedEvent.title}</p>
              </div>

              <div>
                <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
                  날짜
                </label>
                <p className="text-body text-content-standard-primary">
                  {format(selectedEvent.start ?? new Date(selectedEvent.date), "yyyy년 M월 d일 (EEE)", {
                    locale: ko,
                  })}
                </p>
              </div>

              {selectedEvent.type === "clinic" && selectedEvent.metadata?.status && (
                <div>
                  <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
                    상태
                  </label>
                  <span
                    className={`inline-block rounded-radius-300 px-spacing-300 py-spacing-100 font-medium text-footnote ${
                      selectedEvent.metadata.status === "attended"
                        ? "bg-solid-translucent-green text-solid-green"
                        : selectedEvent.metadata.status === "absent"
                          ? "bg-solid-translucent-red text-solid-red"
                          : "bg-solid-translucent-purple text-solid-purple"
                    }`}>
                    {selectedEvent.metadata.status === "attended"
                      ? "출석"
                      : selectedEvent.metadata.status === "absent"
                        ? "결석"
                        : "예정"}
                  </span>
                </div>
              )}

              {selectedEvent.type === "retake" && selectedEvent.metadata?.status && (
                <div>
                  <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
                    상태
                  </label>
                  <span
                    className={`inline-block rounded-radius-300 px-spacing-300 py-spacing-100 font-medium text-footnote ${
                      selectedEvent.metadata.status === "completed"
                        ? "bg-solid-translucent-green text-solid-green"
                        : selectedEvent.metadata.status === "absent"
                          ? "bg-solid-translucent-red text-solid-red"
                          : selectedEvent.metadata.status === "postponed"
                            ? "bg-solid-translucent-yellow text-solid-yellow"
                            : "bg-solid-translucent-blue text-solid-blue"
                    }`}>
                    {selectedEvent.metadata.status === "completed"
                      ? "완료"
                      : selectedEvent.metadata.status === "absent"
                        ? "결석"
                        : selectedEvent.metadata.status === "postponed"
                          ? "연기"
                          : "예정"}
                  </span>
                </div>
              )}
            </div>

            <div className="border-line-divider border-t px-spacing-600 py-spacing-500">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
