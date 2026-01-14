"use client";

import { useAtom } from "jotai";
import { SearchInput } from "@/shared/components/ui/searchInput";
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

  const isFilterActive =
    filters.level || filters.action || filters.resource || filters.search || filters.startDate || filters.endDate;

  return (
    <div className="space-y-spacing-400">
      {/* 필터 드롭다운 */}
      <div className="flex flex-wrap gap-spacing-300">
        <select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 0 })}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
          {levels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>

        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 0 })}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
          {actions.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>

        <select
          value={filters.resource}
          onChange={(e) => setFilters({ ...filters, resource: e.target.value, page: 0 })}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
          {resources.map((resource) => (
            <option key={resource.value} value={resource.value}>
              {resource.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 0 })}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 0 })}
          className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 font-medium text-content-standard-primary text-label transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
        />

        {isFilterActive && (
          <button
            onClick={handleReset}
            className="px-spacing-200 font-medium text-content-standard-tertiary text-label transition-colors hover:text-content-standard-primary">
            초기화
          </button>
        )}
      </div>

      {/* 레벨 필터 버튼 */}
      <div className="flex flex-wrap gap-spacing-300">
        <button
          onClick={() => setFilters({ ...filters, level: "", page: 0 })}
          className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
            filters.level === ""
              ? "bg-core-accent text-solid-white"
              : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
          }`}>
          전체
        </button>
        {levels.slice(1).map((level) => (
          <button
            key={level.value}
            onClick={() => setFilters({ ...filters, level: level.value, page: 0 })}
            className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
              filters.level === level.value
                ? "bg-core-accent text-solid-white"
                : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
            }`}>
            {level.label}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <SearchInput
        placeholder="유저, 메시지, 경로로 검색..."
        size="lg"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
      />
    </div>
  );
}
