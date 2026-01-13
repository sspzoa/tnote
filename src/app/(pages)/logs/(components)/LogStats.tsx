"use client";

import { useState } from "react";
import { useLogStats } from "../(hooks)/useLogs";

const levelColors: Record<string, string> = {
  info: "bg-solid-translucent-blue text-solid-blue",
  warn: "bg-solid-translucent-yellow text-solid-yellow",
  error: "bg-solid-translucent-red text-solid-red",
  debug: "bg-solid-translucent-gray text-solid-gray",
};

const actionLabels: Record<string, string> = {
  create: "생성",
  read: "조회",
  update: "수정",
  delete: "삭제",
  login: "로그인",
  logout: "로그아웃",
  auth: "인증",
  error: "오류",
  other: "기타",
};

export default function LogStats() {
  const [days, setDays] = useState(7);
  const { stats, isLoading, error } = useLogStats(days);

  if (isLoading) {
    return (
      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
        <div className="animate-pulse space-y-spacing-400">
          <div className="h-6 w-32 rounded-radius-200 bg-components-fill-standard-secondary" />
          <div className="grid grid-cols-4 gap-spacing-400">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-radius-300 bg-components-fill-standard-secondary" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
        <p className="text-body text-content-standard-tertiary">통계를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const sortedDailyActivity = Object.entries(stats.dailyActivity)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  const maxActivity = Math.max(...sortedDailyActivity.map(([, count]) => count), 1);

  return (
    <div className="space-y-spacing-500">
      {/* 기간 선택 */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-content-standard-primary text-heading">로그 통계</h2>
        <div className="flex gap-spacing-200">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
                days === d
                  ? "bg-core-accent text-solid-white"
                  : "bg-components-fill-standard-secondary text-content-standard-primary hover:bg-components-interactive-hover"
              }`}>
              {d}일
            </button>
          ))}
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-spacing-400 lg:grid-cols-4">
        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <p className="mb-spacing-200 text-content-standard-tertiary text-label">총 로그</p>
          <p className="font-bold text-content-standard-primary text-title">{stats.summary.total.toLocaleString()}</p>
        </div>
        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <p className="mb-spacing-200 text-content-standard-tertiary text-label">에러</p>
          <p className="font-bold text-solid-red text-title">{(stats.summary.byLevel.error || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <p className="mb-spacing-200 text-content-standard-tertiary text-label">경고</p>
          <p className="font-bold text-solid-yellow text-title">{(stats.summary.byLevel.warn || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <p className="mb-spacing-200 text-content-standard-tertiary text-label">일평균</p>
          <p className="font-bold text-content-standard-primary text-title">
            {Math.round(stats.summary.total / days).toLocaleString()}
          </p>
        </div>
      </div>

      {/* 일별 활동 차트 */}
      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
        <p className="mb-spacing-400 font-semibold text-body text-content-standard-primary">일별 활동</p>
        <div className="flex h-32 items-end gap-spacing-200">
          {sortedDailyActivity.map(([date, count]) => (
            <div key={date} className="flex flex-1 flex-col items-center gap-spacing-200">
              <div
                className="w-full rounded-radius-200 bg-core-accent transition-all"
                style={{ height: `${(count / maxActivity) * 100}%`, minHeight: count > 0 ? "4px" : "0" }}
              />
              <span className="text-center text-content-standard-tertiary text-footnote">
                {date.slice(5).replace("-", "/")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 레벨/액션 통계 */}
      <div className="grid grid-cols-1 gap-spacing-400 lg:grid-cols-2">
        {/* 레벨별 */}
        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <p className="mb-spacing-400 font-semibold text-body text-content-standard-primary">레벨별</p>
          <div className="space-y-spacing-300">
            {Object.entries(stats.summary.byLevel).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <span className={`rounded-radius-200 px-spacing-300 py-spacing-100 text-label ${levelColors[level]}`}>
                  {level.toUpperCase()}
                </span>
                <span className="font-medium text-body text-content-standard-primary">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 액션별 */}
        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <p className="mb-spacing-400 font-semibold text-body text-content-standard-primary">액션별</p>
          <div className="space-y-spacing-300">
            {Object.entries(stats.summary.byAction)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-body text-content-standard-secondary">{actionLabels[action] || action}</span>
                  <span className="font-medium text-body text-content-standard-primary">{count.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 최근 에러 */}
      {stats.recentErrors.length > 0 && (
        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <p className="mb-spacing-400 font-semibold text-body text-content-standard-primary">최근 에러</p>
          <div className="space-y-spacing-300">
            {stats.recentErrors.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="rounded-radius-300 border border-solid-translucent-red bg-solid-translucent-red/30 p-spacing-400">
                <div className="mb-spacing-200 flex items-center justify-between">
                  <span className="font-medium text-label text-solid-red">{log.resource}</span>
                  <span className="text-content-standard-tertiary text-footnote">
                    {new Date(log.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                <p className="text-body text-content-standard-primary">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
