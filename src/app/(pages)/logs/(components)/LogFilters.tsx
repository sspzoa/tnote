"use client";

import { SearchInput } from "@/shared/components/ui/searchInput";
import { useAtom } from "jotai";
import { logFilterAtom } from "../(atoms)/useFilterStore";

const levels = [
  { value: "", label: "전체 레벨" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "debug", label: "Debug" },
];

const actions = [
  { value: "", label: "전체 액션" },
  { value: "create", label: "생성" },
  { value: "read", label: "조회" },
  { value: "update", label: "수정" },
  { value: "delete", label: "삭제" },
  { value: "login", label: "로그인" },
  { value: "logout", label: "로그아웃" },
  { value: "auth", label: "인증" },
  { value: "error", label: "오류" },
];

const resources = [
  { value: "", label: "전체 리소스" },
  { value: "students", label: "학생" },
  { value: "courses", label: "수업" },
  { value: "retakes", label: "재시험" },
  { value: "clinics", label: "클리닉" },
  { value: "exams", label: "시험" },
  { value: "admins", label: "관리자" },
  { value: "consultations", label: "상담" },
  { value: "auth", label: "인증" },
  { value: "calendar", label: "캘린더" },
];

export default function LogFilters() {
  const [filters, setFilters] = useAtom(logFilterAtom);

  const handleReset = () => {
    setFilters({
      level: "",
      action: "",
      resource: "",
      search: "",
      startDate: "",
      endDate: "",
      page: 0,
    });
  };

  const hasFilters =
    filters.level || filters.action || filters.resource || filters.search || filters.startDate || filters.endDate;

  return (
    <div className="space-y-spacing-400">
      {/* 통합 검색 */}
      <SearchInput
        size="lg"
        placeholder="유저, 메시지, 경로로 검색..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
      />

      {/* 필터 */}
      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
        <div className="mb-spacing-400 flex items-center justify-between">
          <h3 className="font-semibold text-body text-content-standard-primary">필터</h3>
          {hasFilters && (
            <button onClick={handleReset} className="text-core-accent text-label hover:underline">
              초기화
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-spacing-400 md:grid-cols-2 lg:grid-cols-5">
          {/* 레벨 */}
          <div>
            <label htmlFor="level" className="mb-spacing-200 block text-content-standard-tertiary text-label">
              레벨
            </label>
            <select
              id="level"
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 0 })}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent">
              {levels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* 액션 */}
          <div>
            <label htmlFor="action" className="mb-spacing-200 block text-content-standard-tertiary text-label">
              액션
            </label>
            <select
              id="action"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 0 })}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent">
              {actions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          {/* 리소스 */}
          <div>
            <label htmlFor="resource" className="mb-spacing-200 block text-content-standard-tertiary text-label">
              리소스
            </label>
            <select
              id="resource"
              value={filters.resource}
              onChange={(e) => setFilters({ ...filters, resource: e.target.value, page: 0 })}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent">
              {resources.map((resource) => (
                <option key={resource.value} value={resource.value}>
                  {resource.label}
                </option>
              ))}
            </select>
          </div>

          {/* 시작일 */}
          <div>
            <label htmlFor="startDate" className="mb-spacing-200 block text-content-standard-tertiary text-label">
              시작일
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 0 })}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
            />
          </div>

          {/* 종료일 */}
          <div>
            <label htmlFor="endDate" className="mb-spacing-200 block text-content-standard-tertiary text-label">
              종료일
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 0 })}
              className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary outline-none focus:border-core-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
