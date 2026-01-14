"use client";

import { useAtom } from "jotai";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
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

const formatTimestamp = (date: string): string => {
  return new Date(date).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

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
    return <LoadingComponent />;
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
      <div className="flex items-center justify-between">
        <p className="text-content-standard-tertiary text-label">
          총 {pagination.total.toLocaleString()}개 중 {filters.page * ITEMS_PER_PAGE + 1}-
          {Math.min((filters.page + 1) * ITEMS_PER_PAGE, pagination.total)}개 표시
        </p>
      </div>

      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
        <table className="w-full rounded-radius-400">
          <thead className="bg-components-fill-standard-secondary">
            <tr>
              <th className="w-10 whitespace-nowrap px-spacing-500 py-spacing-400" />
              <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                시간
              </th>
              <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                레벨
              </th>
              <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                유저
              </th>
              <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                액션
              </th>
              <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                리소스
              </th>
              <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                경로
              </th>
              <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                상태
              </th>
              <th className="whitespace-nowrap px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                응답시간
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <LogRow
                key={log.id}
                log={log}
                isExpanded={expandedLog === log.id}
                onToggle={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

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

interface LogRowProps {
  log: LogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

function LogRow({ log, isExpanded, onToggle }: LogRowProps) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-line-divider border-t transition-colors hover:bg-components-interactive-hover ${
          log.level === "error"
            ? "bg-solid-translucent-red/30"
            : log.level === "warn"
              ? "bg-solid-translucent-yellow/30"
              : ""
        }`}>
        <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-content-standard-tertiary">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </td>
        <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
          {formatTimestamp(log.created_at)}
        </td>
        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
          <span
            className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-semibold text-footnote ${levelStyles[log.level]}`}>
            {log.level.toUpperCase()}
          </span>
        </td>
        <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-primary">
          {log.user_name || "-"}
        </td>
        <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
          {actionLabels[log.action] || log.action}
        </td>
        <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
          {log.resource}
        </td>
        <td className="px-spacing-500 py-spacing-400">
          <div className="break-all text-body text-content-standard-primary">
            <span className="text-content-standard-tertiary">{log.method}</span> {log.path}
          </div>
        </td>
        <td className="whitespace-nowrap px-spacing-500 py-spacing-400">
          {log.status_code && (
            <span
              className={`rounded-radius-200 px-spacing-300 py-spacing-100 font-semibold text-footnote ${
                log.status_code >= 500
                  ? "bg-solid-translucent-red text-solid-red"
                  : log.status_code >= 400
                    ? "bg-solid-translucent-yellow text-solid-yellow"
                    : "bg-solid-translucent-green text-solid-green"
              }`}>
              {log.status_code}
            </span>
          )}
        </td>
        <td className="whitespace-nowrap px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
          {log.duration_ms !== null ? `${log.duration_ms}ms` : "-"}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td
            colSpan={9}
            className="border-line-divider border-t bg-components-fill-standard-secondary px-spacing-500 py-spacing-400">
            <div className="space-y-spacing-400">
              <div className="text-body text-content-standard-primary">{log.message}</div>

              <div className="grid grid-cols-2 gap-spacing-400 md:grid-cols-4">
                <div>
                  <div className="text-content-standard-tertiary text-footnote">로그 ID</div>
                  <div className="font-mono text-body text-content-standard-secondary">{log.id}</div>
                </div>
                <div>
                  <div className="text-content-standard-tertiary text-footnote">생성 시간</div>
                  <div className="text-body text-content-standard-secondary">
                    {new Date(log.created_at).toLocaleString("ko-KR")}
                  </div>
                </div>
                <div>
                  <div className="text-content-standard-tertiary text-footnote">유저 ID</div>
                  <div className="font-mono text-body text-content-standard-secondary">{log.user_id || "-"}</div>
                </div>
                <div>
                  <div className="text-content-standard-tertiary text-footnote">역할</div>
                  <div className="text-body text-content-standard-secondary">{log.user_role || "-"}</div>
                </div>
                <div>
                  <div className="text-content-standard-tertiary text-footnote">리소스 ID</div>
                  <div className="font-mono text-body text-content-standard-secondary">{log.resource_id || "-"}</div>
                </div>
                <div>
                  <div className="text-content-standard-tertiary text-footnote">워크스페이스</div>
                  <div className="font-mono text-body text-content-standard-secondary">{log.workspace || "-"}</div>
                </div>
                <div>
                  <div className="text-content-standard-tertiary text-footnote">IP 주소</div>
                  <div className="font-mono text-body text-content-standard-secondary">{log.ip_address || "-"}</div>
                </div>
              </div>

              {log.user_agent && (
                <div>
                  <div className="text-content-standard-tertiary text-footnote">User Agent</div>
                  <div className="text-body text-content-standard-secondary">{log.user_agent}</div>
                </div>
              )}

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div>
                  <div className="mb-spacing-200 text-content-standard-tertiary text-footnote">메타데이터</div>
                  <pre className="overflow-auto whitespace-pre-wrap break-all rounded-radius-300 bg-components-fill-standard-primary p-spacing-400 font-mono text-body text-content-standard-secondary">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
