"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/shared/components/common/Container";
import Header from "@/shared/components/common/Header";
import type { CalendarEvent } from "@/shared/types";

interface FilterState {
  course: boolean;
  retake: boolean;
  clinic: boolean;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const getEventStyle = (event: CalendarEvent) => {
  switch (event.type) {
    case "course":
      return {
        color: "#2563EB",
        backgroundColor: "rgba(59, 130, 246, 0.12)",
        borderColor: "rgba(59, 130, 246, 0.3)",
      };
    case "retake":
      if (event.metadata?.status === "completed") {
        return {
          color: "#059669",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          borderColor: "rgba(16, 185, 129, 0.3)",
        };
      }
      if (event.metadata?.status === "absent") {
        return {
          color: "#4B5563",
          backgroundColor: "rgba(107, 114, 128, 0.12)",
          borderColor: "rgba(107, 114, 128, 0.3)",
        };
      }
      return {
        color: "#DC2626",
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        borderColor: "rgba(239, 68, 68, 0.3)",
      };
    case "clinic":
      if (event.metadata?.status === "attended") {
        return {
          color: "#059669",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          borderColor: "rgba(16, 185, 129, 0.3)",
        };
      }
      if (event.metadata?.status === "absent") {
        return {
          color: "#4B5563",
          backgroundColor: "rgba(107, 114, 128, 0.12)",
          borderColor: "rgba(107, 114, 128, 0.3)",
        };
      }
      return {
        color: "#7C3AED",
        backgroundColor: "rgba(139, 92, 246, 0.12)",
        borderColor: "rgba(139, 92, 246, 0.3)",
      };
    default:
      return {
        color: "#6B7280",
        backgroundColor: "rgba(107, 114, 128, 0.12)",
        borderColor: "rgba(107, 114, 128, 0.3)",
      };
  }
};

export default function CalendarPage() {
  const [loading, setLoading] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    course: true,
    retake: true,
    clinic: true,
  });

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]);

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await fetch(
        `/api/calendar?start=${start.toISOString().split("T")[0]}&end=${end.toISOString().split("T")[0]}`,
      );
      const result = await response.json();

      if (response.ok) {
        setCalendarEvents(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const filteredEvents = calendarEvents.filter((event) => {
    if (event.type === "course" && !filters.course) return false;
    if (event.type === "retake" && !filters.retake) return false;
    if (event.type === "clinic" && !filters.clinic) return false;
    return true;
  });

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => isSameDay(new Date(event.date), day));
  };

  return (
    <Container>
      <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
        ← 홈으로 돌아가기
      </Link>

      <Header title="캘린더" subtitle="수업, 재시험, 클리닉 일정을 확인하세요" />

      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-300 md:rounded-radius-600 md:p-spacing-600">
        <div className="mb-spacing-400 flex flex-col gap-spacing-300 md:mb-spacing-500 md:flex-row md:items-center md:justify-between md:gap-spacing-400">
          <div className="flex items-center justify-between gap-spacing-300 md:justify-start">
            <div className="flex items-center gap-spacing-200 md:gap-spacing-300">
              <button
                onClick={goToPrevMonth}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-300 bg-components-fill-standard-secondary font-medium text-content-standard-primary text-label transition-colors hover:bg-components-interactive-hover md:min-h-0 md:min-w-0 md:px-spacing-400 md:py-spacing-200 md:text-body"
                type="button">
                ←
              </button>
              <button
                onClick={goToToday}
                className="min-h-[44px] rounded-radius-300 bg-core-accent px-spacing-300 py-spacing-200 font-medium text-label text-solid-white transition-opacity hover:opacity-90 md:min-h-0 md:px-spacing-400 md:text-body"
                type="button">
                오늘
              </button>
              <button
                onClick={goToNextMonth}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-300 bg-components-fill-standard-secondary font-medium text-content-standard-primary text-label transition-colors hover:bg-components-interactive-hover md:min-h-0 md:min-w-0 md:px-spacing-400 md:py-spacing-200 md:text-body"
                type="button">
                →
              </button>
            </div>

            <h2 className="font-bold text-body text-content-standard-primary md:hidden">
              {format(currentDate, "yyyy년 M월", { locale: ko })}
            </h2>
          </div>

          <h2 className="hidden font-bold text-content-standard-primary text-heading md:block">
            {format(currentDate, "yyyy년 M월", { locale: ko })}
          </h2>

          <div className="flex flex-wrap gap-spacing-150 md:gap-spacing-200">
            <button
              type="button"
              onClick={() => setFilters({ ...filters, course: !filters.course })}
              className={`flex min-h-[36px] items-center gap-spacing-150 rounded-radius-300 px-spacing-200 py-spacing-100 transition-all md:min-h-0 md:gap-spacing-200 md:px-spacing-300 ${
                filters.course
                  ? "bg-[#3B82F6]/20 ring-1 ring-[#3B82F6]"
                  : "bg-components-fill-standard-secondary opacity-50"
              }`}>
              <div className="h-2.5 w-2.5 rounded-radius-100 bg-[#3B82F6] md:h-3 md:w-3" />
              <span className="text-caption text-content-standard-secondary md:text-footnote">수업</span>
            </button>
            <button
              type="button"
              onClick={() => setFilters({ ...filters, retake: !filters.retake })}
              className={`flex min-h-[36px] items-center gap-spacing-150 rounded-radius-300 px-spacing-200 py-spacing-100 transition-all md:min-h-0 md:gap-spacing-200 md:px-spacing-300 ${
                filters.retake
                  ? "bg-[#EF4444]/20 ring-1 ring-[#EF4444]"
                  : "bg-components-fill-standard-secondary opacity-50"
              }`}>
              <div className="h-2.5 w-2.5 rounded-radius-100 bg-[#EF4444] md:h-3 md:w-3" />
              <span className="text-caption text-content-standard-secondary md:text-footnote">재시험</span>
            </button>
            <button
              type="button"
              onClick={() => setFilters({ ...filters, clinic: !filters.clinic })}
              className={`flex min-h-[36px] items-center gap-spacing-150 rounded-radius-300 px-spacing-200 py-spacing-100 transition-all md:min-h-0 md:gap-spacing-200 md:px-spacing-300 ${
                filters.clinic
                  ? "bg-[#8B5CF6]/20 ring-1 ring-[#8B5CF6]"
                  : "bg-components-fill-standard-secondary opacity-50"
              }`}>
              <div className="h-2.5 w-2.5 rounded-radius-100 bg-[#8B5CF6] md:h-3 md:w-3" />
              <span className="text-caption text-content-standard-secondary md:text-footnote">클리닉</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-spacing-600">
            <p className="text-content-standard-tertiary text-label md:text-body">로딩 중...</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-radius-300 border border-line-outline">
            <div className="grid grid-cols-7 border-line-outline border-b bg-components-fill-standard-secondary">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="border-line-outline border-r px-spacing-100 py-spacing-200 text-center font-semibold text-content-standard-secondary text-footnote last:border-r-0 md:px-spacing-200 md:py-spacing-300 md:text-label">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const isExpanded = expandedDay && isSameDay(day, expandedDay);
                const maxVisibleEvents = 2;
                const hasMoreEvents = dayEvents.length > maxVisibleEvents;

                return (
                  <div
                    key={day.toISOString()}
                    className={`relative flex min-h-[80px] flex-col border-line-outline border-b border-r p-spacing-100 md:min-h-[100px] md:p-spacing-200 ${
                      idx % 7 === 6 ? "border-r-0" : ""
                    } ${idx >= calendarDays.length - 7 ? "border-b-0" : ""} ${
                      !isCurrentMonth ? "bg-components-fill-standard-secondary/50" : ""
                    } ${isTodayDate ? "bg-core-accent/10" : ""}`}>
                    <div
                      className={`mb-spacing-100 text-right text-footnote ${
                        !isCurrentMonth
                          ? "text-content-standard-quaternary"
                          : isTodayDate
                            ? "font-bold text-core-accent"
                            : "text-content-standard-tertiary"
                      }`}>
                      {format(day, "d")}
                    </div>

                    <div className="flex flex-1 flex-col gap-spacing-50">
                      {dayEvents.slice(0, isExpanded ? dayEvents.length : maxVisibleEvents).map((event) => {
                        const style = getEventStyle(event);
                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setSelectedEvent(event)}
                            className="w-full truncate rounded-radius-200 px-spacing-100 py-spacing-50 text-left text-caption transition-transform hover:scale-[1.02] md:px-spacing-150 md:text-footnote"
                            style={{
                              backgroundColor: style.backgroundColor,
                              color: style.color,
                              borderLeft: `2px solid ${style.color}`,
                            }}>
                            {event.title}
                          </button>
                        );
                      })}

                      {hasMoreEvents && !isExpanded && (
                        <button
                          type="button"
                          onClick={() => setExpandedDay(day)}
                          className="rounded-radius-200 px-spacing-100 py-spacing-50 text-left text-caption text-core-accent transition-colors hover:bg-core-accent/10 md:text-footnote">
                          +{dayEvents.length - maxVisibleEvents}
                        </button>
                      )}

                      {isExpanded && (
                        <button
                          type="button"
                          onClick={() => setExpandedDay(null)}
                          className="rounded-radius-200 px-spacing-100 py-spacing-50 text-left text-caption text-content-standard-tertiary transition-colors hover:bg-components-fill-standard-secondary md:text-footnote">
                          접기
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-solid-black/50 p-spacing-300 md:items-center md:p-spacing-400"
          onClick={() => setSelectedEvent(null)}>
          <div
            className="w-full max-w-md rounded-t-radius-600 border border-line-outline bg-components-fill-standard-primary md:rounded-radius-600"
            onClick={(e) => e.stopPropagation()}>
            <div className="border-line-divider border-b px-spacing-400 py-spacing-400 md:px-spacing-600 md:py-spacing-500">
              <h2 className="font-bold text-body text-content-standard-primary md:text-heading">일정 상세</h2>
            </div>

            <div className="space-y-spacing-300 p-spacing-400 md:space-y-spacing-400 md:p-spacing-600">
              <div>
                <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-footnote md:text-label">
                  타입
                </label>
                <div className="flex items-center gap-spacing-200">
                  <div
                    className="h-3.5 w-3.5 rounded-radius-100 md:h-4 md:w-4"
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
                  <span className="text-content-standard-primary text-label md:text-body">
                    {selectedEvent.type === "course" ? "수업" : selectedEvent.type === "retake" ? "재시험" : "클리닉"}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-footnote md:text-label">
                  제목
                </label>
                <p className="text-content-standard-primary text-label md:text-body">{selectedEvent.title}</p>
              </div>

              <div>
                <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-footnote md:text-label">
                  날짜
                </label>
                <p className="text-content-standard-primary text-label md:text-body">
                  {format(new Date(selectedEvent.date), "yyyy년 M월 d일 (EEE)", { locale: ko })}
                </p>
              </div>

              {selectedEvent.type === "clinic" && selectedEvent.metadata?.status && (
                <div>
                  <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-footnote md:text-label">
                    상태
                  </label>
                  <span
                    className={`inline-block rounded-radius-300 px-spacing-200 py-spacing-100 font-medium text-caption md:px-spacing-300 md:text-footnote ${
                      selectedEvent.metadata.status === "attended"
                        ? "bg-solid-translucent-green text-solid-green"
                        : selectedEvent.metadata.status === "absent"
                          ? "bg-solid-translucent-gray text-solid-gray"
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
                  <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-footnote md:text-label">
                    상태
                  </label>
                  <span
                    className={`inline-block rounded-radius-300 px-spacing-200 py-spacing-100 font-medium text-caption md:px-spacing-300 md:text-footnote ${
                      selectedEvent.metadata.status === "completed"
                        ? "bg-solid-translucent-green text-solid-green"
                        : selectedEvent.metadata.status === "absent"
                          ? "bg-solid-translucent-gray text-solid-gray"
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

            <div className="border-line-divider border-t px-spacing-400 py-spacing-400 md:px-spacing-600 md:py-spacing-500">
              <button
                onClick={() => setSelectedEvent(null)}
                className="min-h-[44px] w-full rounded-radius-300 bg-core-accent px-spacing-400 py-spacing-300 font-semibold text-label text-solid-white transition-opacity hover:opacity-90 md:min-h-0 md:px-spacing-500 md:text-body">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
