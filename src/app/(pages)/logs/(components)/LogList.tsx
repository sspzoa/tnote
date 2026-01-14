"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import { logFilterAtom, selectedLogAtom } from "../(atoms)/useFilterStore";
import { type LogEntry, useLogs } from "../(hooks)/useLogs";

const levelStyles: Record<string, string> = {
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

const ITEMS_PER_PAGE = 50;

export default function LogList() {
  const [filters, setFilters] = useAtom(logFilterAtom);
  const [_selectedLog, _setSelectedLog] = useAtom(selectedLogAtom);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const { logs, pagination, isLoading, error } = useLogs({
    level: filters.level || undefined,
    action: filters.action || undefined,
    resource: filters.resource || undefined,
    search: filters.search || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    limit: ITEMS_PER_PAGE,
    offset: filters.page * ITEMS_PER_PAGE,
  });

  if (isLoading) {
    return (
      <div className="space-y-spacing-300">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
            <div className="flex items-center gap-spacing-400">
              <div className="h-6 w-16 rounded-radius-200 bg-components-fill-standard-secondary" />
              <div className="h-4 w-24 rounded-radius-200 bg-components-fill-standard-secondary" />
              <div className="h-4 flex-1 rounded-radius-200 bg-components-fill-standard-secondary" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
        <p className="text-center text-body text-content-standard-tertiary">로그를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-900">
        <p className="text-center text-body text-content-standard-tertiary">조건에 맞는 로그가 없습니다.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-spacing-400">
      {/* 결과 정보 */}
      <div className="flex items-center justify-between">
        <p className="text-content-standard-tertiary text-label">
          총 {pagination.total.toLocaleString()}개 중 {filters.page * ITEMS_PER_PAGE + 1}-
          {Math.min((filters.page + 1) * ITEMS_PER_PAGE, pagination.total)}개 표시
        </p>
      </div>

      {/* 로그 목록 */}
      <div className="space-y-spacing-300">
        {logs.map((log) => (
          <LogItem
            key={log.id}
            log={log}
            isExpanded={expandedLog === log.id}
            onToggle={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-spacing-200">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(0, filters.page - 1) })}
            disabled={filters.page === 0}
            className="rounded-radius-300 bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover disabled:opacity-50">
            이전
          </button>

          <div className="flex items-center gap-spacing-100">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (filters.page < 3) {
                pageNum = i;
              } else if (filters.page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = filters.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setFilters({ ...filters, page: pageNum })}
                  className={`min-w-[36px] rounded-radius-300 px-spacing-300 py-spacing-200 text-body transition-colors ${
                    filters.page === pageNum
                      ? "bg-core-accent text-solid-white"
                      : "bg-components-fill-standard-secondary text-content-standard-primary hover:bg-components-interactive-hover"
                  }`}>
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setFilters({ ...filters, page: Math.min(totalPages - 1, filters.page + 1) })}
            disabled={filters.page >= totalPages - 1}
            className="rounded-radius-300 bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover disabled:opacity-50">
            다음
          </button>
        </div>
      )}
    </div>
  );
}

interface LogItemProps {
  log: LogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

function LogItem({ log, isExpanded, onToggle }: LogItemProps) {
  const timestamp = new Date(log.created_at).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const shortTimestamp = new Date(log.created_at).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`rounded-radius-400 border bg-components-fill-standard-primary transition-colors ${
        log.level === "error"
          ? "border-solid-translucent-red"
          : log.level === "warn"
            ? "border-solid-translucent-yellow"
            : "border-line-outline"
      }`}>
      <button
        onClick={onToggle}
        className="flex w-full flex-col gap-spacing-200 p-spacing-400 text-left hover:bg-components-interactive-hover/50 md:p-spacing-500">
        {/* 모바일 레이아웃 */}
        <div className="flex w-full flex-col gap-spacing-200 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-spacing-200">
              <span
                className={`shrink-0 rounded-radius-200 px-spacing-200 py-spacing-50 font-medium text-caption ${levelStyles[log.level]}`}>
                {log.level.toUpperCase()}
              </span>
              {log.status_code && (
                <span
                  className={`text-footnote ${
                    log.status_code >= 500
                      ? "text-solid-red"
                      : log.status_code >= 400
                        ? "text-solid-yellow"
                        : "text-solid-green"
                  }`}>
                  {log.status_code}
                </span>
              )}
            </div>
            <span className="text-caption text-content-standard-tertiary">{shortTimestamp}</span>
          </div>
          <div className="flex items-center gap-spacing-200">
            <span className="font-medium text-content-standard-primary text-label">{log.user_name || "-"}</span>
            <span className="text-caption text-content-standard-tertiary">
              {actionLabels[log.action] || log.action}
            </span>
          </div>
          <div className="truncate font-mono text-content-standard-secondary text-footnote">
            {log.method} {log.path}
          </div>
          <div className="flex items-center justify-between">
            <span className="truncate text-content-standard-tertiary text-footnote">{log.message}</span>
            <span className="shrink-0 text-caption text-content-standard-tertiary">{isExpanded ? "▲" : "▼"}</span>
          </div>
        </div>

        {/* 데스크탑 레이아웃 */}
        <div className="hidden w-full items-center gap-spacing-500 md:flex">
          <span
            className={`shrink-0 rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-footnote ${levelStyles[log.level]}`}>
            {log.level.toUpperCase()}
          </span>
          <span className="shrink-0 text-content-standard-tertiary text-footnote">{timestamp}</span>
          <span className="shrink-0 font-medium text-content-standard-primary text-label">{log.user_name || "-"}</span>
          <span className="shrink-0 text-content-standard-secondary text-footnote">
            {actionLabels[log.action] || log.action}
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-content-standard-primary text-label">
            {log.method} {log.path}
          </span>
          {log.status_code && (
            <span
              className={`shrink-0 text-label ${
                log.status_code >= 500
                  ? "text-solid-red"
                  : log.status_code >= 400
                    ? "text-solid-yellow"
                    : "text-solid-green"
              }`}>
              {log.status_code}
            </span>
          )}
          {log.duration_ms !== null && (
            <span className="shrink-0 text-content-standard-tertiary text-footnote">{log.duration_ms}ms</span>
          )}
          <span className="shrink-0 text-content-standard-tertiary">{isExpanded ? "▲" : "▼"}</span>
        </div>

        {/* 데스크탑 메시지 줄 */}
        <div className="hidden items-center gap-spacing-300 pl-spacing-100 md:flex">
          <span className="truncate text-body text-content-standard-secondary">{log.message}</span>
        </div>
      </button>

      {/* 상세 정보 */}
      {isExpanded && (
        <div className="border-line-divider border-t bg-components-fill-standard-secondary p-spacing-500">
          <div className="grid grid-cols-1 gap-spacing-400 md:grid-cols-2 lg:grid-cols-3">
            {/* 기본 정보 */}
            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">로그 ID</p>
              <p className="break-all font-mono text-body text-content-standard-primary">{log.id}</p>
            </div>

            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">생성 시간</p>
              <p className="text-body text-content-standard-primary">
                {new Date(log.created_at).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  fractionalSecondDigits: 3,
                })}
              </p>
            </div>

            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">레벨</p>
              <span
                className={`inline-block rounded-radius-200 px-spacing-300 py-spacing-100 font-medium text-label ${levelStyles[log.level]}`}>
                {log.level.toUpperCase()}
              </span>
            </div>

            {/* 요청 정보 */}
            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">HTTP 메서드</p>
              <p className="font-mono text-body text-content-standard-primary">{log.method || "-"}</p>
            </div>

            <div className="md:col-span-2">
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">경로</p>
              <p className="break-all font-mono text-body text-content-standard-primary">{log.path || "-"}</p>
            </div>

            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">액션</p>
              <p className="text-body text-content-standard-primary">{actionLabels[log.action] || log.action}</p>
            </div>

            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">리소스</p>
              <p className="text-body text-content-standard-primary">{log.resource}</p>
            </div>

            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">리소스 ID</p>
              <p className="break-all font-mono text-body text-content-standard-primary">{log.resource_id || "-"}</p>
            </div>

            {/* 응답 정보 */}
            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">상태 코드</p>
              <p
                className={`font-mono text-body ${
                  log.status_code && log.status_code >= 500
                    ? "text-solid-red"
                    : log.status_code && log.status_code >= 400
                      ? "text-solid-yellow"
                      : "text-solid-green"
                }`}>
                {log.status_code || "-"}
              </p>
            </div>

            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">처리 시간</p>
              <p className="text-body text-content-standard-primary">
                {log.duration_ms !== null ? `${log.duration_ms}ms` : "-"}
              </p>
            </div>

            {/* 사용자 정보 */}
            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">사용자 ID</p>
              <p className="break-all font-mono text-body text-content-standard-primary">{log.user_id || "-"}</p>
            </div>

            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">사용자 이름</p>
              <p className="text-body text-content-standard-primary">{log.user_name || "익명"}</p>
            </div>

            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">사용자 역할</p>
              <p className="text-body text-content-standard-primary">{log.user_role || "-"}</p>
            </div>

            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">워크스페이스</p>
              <p className="break-all font-mono text-body text-content-standard-primary">{log.workspace || "-"}</p>
            </div>

            {/* 클라이언트 정보 */}
            <div>
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">IP 주소</p>
              <p className="font-mono text-body text-content-standard-primary">{log.ip_address || "-"}</p>
            </div>

            {log.user_agent && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">User Agent</p>
                <p className="break-all text-body text-content-standard-secondary">{log.user_agent}</p>
              </div>
            )}

            {/* 메시지 */}
            <div className="md:col-span-2 lg:col-span-3">
              <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">메시지</p>
              <p className="text-body text-content-standard-primary">{log.message}</p>
            </div>

            {/* 메타데이터 */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="mb-spacing-100 font-medium text-content-standard-tertiary text-label">메타데이터</p>
                <pre className="overflow-auto rounded-radius-300 bg-components-fill-standard-primary p-spacing-400 font-mono text-body text-content-standard-secondary">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
