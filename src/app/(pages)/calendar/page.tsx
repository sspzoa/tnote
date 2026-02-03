"use client";

import { addMonths, subMonths } from "date-fns";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import Header from "@/shared/components/common/Header";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { CalendarEvent } from "@/shared/types";
import CalendarGrid from "./(components)/CalendarGrid";
import CalendarToolbar from "./(components)/CalendarToolbar";
import EventDetailModal from "./(components)/EventDetailModal";
import { useCalendarEvents } from "./(hooks)/useCalendarEvents";

interface FilterState {
  course: boolean;
  retake: boolean;
  clinic: boolean;
}

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    course: true,
    retake: true,
    clinic: true,
  });

  const { events, isLoading } = useCalendarEvents(currentDate);

  const filteredEvents = events.filter((event) => {
    if (event.type === "course" && !filters.course) return false;
    if (event.type === "retake" && !filters.retake) return false;
    if (event.type === "clinic" && !filters.clinic) return false;
    return true;
  });

  return (
    <Container>
      <Header
        title="캘린더"
        subtitle="수업, 재시험, 클리닉 일정을 확인하세요"
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
      />

      <div className="flex flex-col gap-spacing-500 overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
        <CalendarToolbar
          currentDate={currentDate}
          filters={filters}
          onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
          onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
          onToday={() => setCurrentDate(new Date())}
          onFilterChange={setFilters}
        />

        {isLoading ? (
          <div className="overflow-hidden rounded-radius-300 border border-line-outline">
            <div className="grid grid-cols-7 border-line-outline border-b bg-components-fill-standard-secondary">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div
                  key={day}
                  className="border-line-outline border-r px-spacing-200 py-spacing-300 text-center font-semibold text-content-standard-secondary text-label last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {[...Array(35)].map((_, i) => {
                const isLastColumn = i % 7 === 6;
                const isLastRow = i >= 28;
                return (
                  <div
                    key={i}
                    className={`flex min-h-[120px] flex-col gap-spacing-100 p-spacing-200 ${!isLastColumn ? "border-line-outline border-r" : ""} ${!isLastRow ? "border-line-outline border-b" : ""}`}>
                    <div className="flex justify-end">
                      <Skeleton className="size-7 rounded-full" />
                    </div>
                    <div className="flex flex-col gap-spacing-100">
                      <Skeleton className="h-6 w-full rounded-radius-200" />
                      <Skeleton className="h-6 w-4/5 rounded-radius-200" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            events={filteredEvents}
            expandedDays={expandedDays}
            onEventClick={setSelectedEvent}
            onToggleExpand={(day: Date) => {
              setExpandedDays((prev) => {
                const key = day.toISOString();
                const next = new Set(prev);
                if (next.has(key)) {
                  next.delete(key);
                } else {
                  next.add(key);
                }
                return next;
              });
            }}
          />
        )}
      </div>

      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </Container>
  );
}
