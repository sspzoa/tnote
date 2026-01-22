"use client";

import { addMonths, subMonths } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import Container from "@/shared/components/common/Container";
import Header from "@/shared/components/common/Header";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
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
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
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
      <Link
        href="/"
        className="group mb-spacing-400 inline-flex items-center gap-spacing-100 text-body text-core-accent transition-all duration-150 hover:gap-spacing-200">
        <span className="group-hover:-translate-x-spacing-50 transition-transform duration-150">←</span>
        <span>홈으로 돌아가기</span>
      </Link>

      <Header title="캘린더" subtitle="수업, 재시험, 클리닉 일정을 확인하세요" />

      <div className="overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
        <CalendarToolbar
          currentDate={currentDate}
          filters={filters}
          onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
          onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
          onToday={() => setCurrentDate(new Date())}
          onFilterChange={setFilters}
        />

        {isLoading ? (
          <LoadingComponent className="min-h-[600px]" />
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            events={filteredEvents}
            expandedDay={expandedDay}
            onEventClick={setSelectedEvent}
            onExpandDay={setExpandedDay}
          />
        )}
      </div>

      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </Container>
  );
}
