"use client";

import { format, getDay, parse, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { BookOpen, ClipboardList, Hospital, ScrollText, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/app/calendar-custom.css";
import { PasswordChangeModal } from "@/shared/components/common/PasswordChangeModal";
import type { CalendarEvent } from "@/shared/types";

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
}: {
  onNavigate: (action: "PREV" | "NEXT" | "TODAY" | "DATE", newDate?: Date) => void;
  date: Date;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
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
        <div className="flex items-center gap-spacing-200 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-300 py-spacing-100">
          <div className="h-3 w-3 rounded-radius-100 bg-[#3B82F6]" />
          <span className="text-content-standard-secondary text-footnote">수업</span>
        </div>
        <div className="flex items-center gap-spacing-200 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-300 py-spacing-100">
          <div className="h-3 w-3 rounded-radius-100 bg-[#EF4444]" />
          <span className="text-content-standard-secondary text-footnote">재시험</span>
        </div>
        <div className="flex items-center gap-spacing-200 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-300 py-spacing-100">
          <div className="h-3 w-3 rounded-radius-100 bg-[#8B5CF6]" />
          <span className="text-content-standard-secondary text-footnote">클리닉</span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [retakesLoading, setRetakesLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userRole === "student" && userId) {
      fetchCalendarEvents();
    }
  }, [userRole, userId, currentDate]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const result = await response.json();
      if (result.user) {
        setUserName(result.user.name);
        setUserId(result.user.id);
        setUserRole(result.user.role);
        setWorkspaceName(result.user.workspaceName || "");
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    setRetakesLoading(true);
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await fetch(
        `/api/calendar?start=${start.toISOString().split("T")[0]}&end=${end.toISOString().split("T")[0]}`,
      );
      const result = await response.json();

      if (response.ok) {
        const events = result.data.map((e: CalendarEvent) => ({
          ...e,
          start: new Date(e.date),
          end: new Date(e.date),
        }));
        setCalendarEvents(events);
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
    } finally {
      setRetakesLoading(false);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "";
    let borderColor = "";

    switch (event.type) {
      case "course":
        backgroundColor = "#3B82F6"; // solid-blue
        borderColor = "#2563EB";
        break;
      case "retake":
        if (event.metadata?.status === "completed") {
          backgroundColor = "#10B981"; // solid-green (완료)
          borderColor = "#059669";
        } else if (event.metadata?.status === "absent") {
          backgroundColor = "#6B7280"; // solid-gray (결석)
          borderColor = "#4B5563";
        } else {
          backgroundColor = "#EF4444"; // solid-red (예정)
          borderColor = "#DC2626";
        }
        break;
      case "clinic":
        if (event.metadata?.status === "attended") {
          backgroundColor = "#10B981"; // solid-green
          borderColor = "#059669";
        } else if (event.metadata?.status === "absent") {
          backgroundColor = "#6B7280"; // solid-gray
          borderColor = "#4B5563";
        } else {
          backgroundColor = "#8B5CF6"; // solid-purple
          borderColor = "#7C3AED";
        }
        break;
    }

    return {
      style: {
        backgroundColor,
        color: "#FFFFFF",
        border: `1px solid ${borderColor}`,
        borderRadius: "4px",
        fontSize: "0.875rem",
        padding: "2px 4px",
      },
    };
  };

  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
      } else {
        alert("로그아웃에 실패했습니다.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-body text-content-standard-tertiary">로딩중...</div>
      </div>
    );
  }

  if (userRole === "student") {
    return (
      <div className="min-h-screen p-spacing-600 md:p-spacing-800">
        <div className="mx-auto max-w-5xl">
          {/* 헤더 */}
          <div className="mb-spacing-800">
            <div className="mb-spacing-200 flex items-start justify-between">
              <div className="flex items-center gap-spacing-400">
                <h1 className="font-bold text-content-standard-primary text-display">Tnote</h1>
                {workspaceName && (
                  <span className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-body text-content-standard-secondary">
                    {workspaceName}
                  </span>
                )}
              </div>
              {userName && (
                <div className="flex items-center gap-spacing-300">
                  <span className="font-medium text-body text-content-standard-primary">{userName}</span>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                    비밀번호 변경
                  </button>
                  <button
                    onClick={handleLogout}
                    className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                    로그아웃
                  </button>
                </div>
              )}
            </div>
            <p className="text-body text-content-standard-secondary">수업 관련 서비스를 한 곳에서 확인하세요</p>
          </div>

          {/* 캘린더 */}
          <div className="rounded-radius-600 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
            {retakesLoading ? (
              <div className="flex min-h-[700px] items-center justify-center">
                <p className="text-body text-content-standard-tertiary">로딩 중...</p>
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                date={currentDate}
                onNavigate={handleNavigate}
                onSelectEvent={(event) => setSelectedEvent(event)}
                eventPropGetter={eventStyleGetter}
                components={{
                  toolbar: (props) => (
                    <CustomToolbar {...props} currentDate={currentDate} setCurrentDate={setCurrentDate} />
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
                style={{ height: "700px" }}
              />
            )}
          </div>
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
                    <label className="mb-spacing-100 block font-semibold text-content-standard-secondary text-label">
                      상태
                    </label>
                    <span
                      className={`inline-block rounded-radius-300 px-spacing-300 py-spacing-100 font-medium text-footnote ${
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

        <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-spacing-800">
          <div className="mb-spacing-200 flex items-start justify-between">
            <div className="flex items-center gap-spacing-400">
              <h1 className="font-bold text-content-standard-primary text-display">Tnote</h1>
              {workspaceName && (
                <span className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-body text-content-standard-secondary">
                  {workspaceName}
                </span>
              )}
            </div>
            {userName && (
              <div className="flex items-center gap-spacing-300">
                <span className="font-medium text-body text-content-standard-primary">{userName}</span>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  비밀번호 변경
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  로그아웃
                </button>
              </div>
            )}
          </div>
          <p className="text-body text-content-standard-secondary">선생님을 위한 학생 관리 서비스</p>
        </div>

        {/* 메뉴 카드 */}
        <div className="grid grid-cols-1 gap-spacing-500 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/retakes"
            className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
            <div className="mb-spacing-500 flex items-center gap-spacing-300">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-core-accent-translucent">
                <ClipboardList className="h-6 w-6 text-core-accent" />
              </div>
              <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                재시험 관리
              </h2>
            </div>
            <p className="mb-spacing-400 text-body text-content-standard-secondary">
              학생들의 재시험을 할당하고 관리합니다
            </p>
            <div className="font-semibold text-core-accent text-label">바로가기 →</div>
          </Link>

          <Link
            href="/students"
            className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
            <div className="mb-spacing-500 flex items-center gap-spacing-300">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-solid-translucent-green">
                <Users className="h-6 w-6 text-solid-green" />
              </div>
              <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                학생 관리
              </h2>
            </div>
            <p className="mb-spacing-400 text-body text-content-standard-secondary">학생 정보를 관리합니다</p>
            <div className="font-semibold text-core-accent text-label">바로가기 →</div>
          </Link>

          <Link
            href="/courses"
            className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
            <div className="mb-spacing-500 flex items-center gap-spacing-300">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-solid-translucent-purple">
                <BookOpen className="h-6 w-6 text-solid-purple" />
              </div>
              <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                수업 관리
              </h2>
            </div>
            <p className="mb-spacing-400 text-body text-content-standard-secondary">수업을 관리합니다</p>
            <div className="font-semibold text-core-accent text-label">바로가기 →</div>
          </Link>

          <Link
            href="/clinics"
            className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
            <div className="mb-spacing-500 flex items-center gap-spacing-300">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-solid-translucent-orange">
                <Hospital className="h-6 w-6 text-solid-orange" />
              </div>
              <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                클리닉 관리
              </h2>
            </div>
            <p className="mb-spacing-400 text-body text-content-standard-secondary">자유 출석 클리닉을 관리합니다</p>
            <div className="font-semibold text-core-accent text-label">바로가기 →</div>
          </Link>

          {userRole === "owner" && (
            <>
              <Link
                href="/admins"
                className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
                <div className="mb-spacing-500 flex items-center gap-spacing-300">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-solid-translucent-blue">
                    <UserCog className="h-6 w-6 text-solid-blue" />
                  </div>
                  <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                    관리자 관리
                  </h2>
                </div>
                <p className="mb-spacing-400 text-body text-content-standard-secondary">
                  워크스페이스 관리자를 관리합니다
                </p>
                <div className="font-semibold text-core-accent text-label">바로가기 →</div>
              </Link>

              <Link
                href="/logs"
                className="group rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600 transition-all hover:border-core-accent hover:shadow-lg">
                <div className="mb-spacing-500 flex items-center gap-spacing-300">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-radius-400 bg-solid-translucent-brown">
                    <ScrollText className="h-6 w-6 text-solid-brown" />
                  </div>
                  <h2 className="font-bold text-content-standard-primary text-heading transition-colors group-hover:text-core-accent">
                    시스템 로그
                  </h2>
                </div>
                <p className="mb-spacing-400 text-body text-content-standard-secondary">
                  API 활동 로그와 통계를 확인합니다
                </p>
                <div className="font-semibold text-core-accent text-label">바로가기 →</div>
              </Link>
            </>
          )}
        </div>
      </div>

      <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
}
