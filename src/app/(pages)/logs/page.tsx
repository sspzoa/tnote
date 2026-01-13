"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "@/shared/components/common/container";
import LogFilters from "./(components)/LogFilters";
import LogList from "./(components)/LogList";
import LogStats from "./(components)/LogStats";

type TabType = "list" | "stats";

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("list");

  return (
    <Container>
      <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
        ← 홈으로 돌아가기
      </Link>

      <div className="mb-spacing-700">
        <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">API 로그</h1>
        <p className="text-body text-content-standard-secondary">시스템 활동 로그를 확인합니다</p>
      </div>

      {/* 탭 */}
      <div className="mb-spacing-500 flex gap-spacing-200 border-line-divider border-b pb-spacing-400">
        <button
          onClick={() => setActiveTab("list")}
          className={`rounded-radius-300 px-spacing-500 py-spacing-300 font-medium text-body transition-colors ${
            activeTab === "list"
              ? "bg-core-accent text-solid-white"
              : "bg-components-fill-standard-secondary text-content-standard-primary hover:bg-components-interactive-hover"
          }`}>
          로그 목록
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`rounded-radius-300 px-spacing-500 py-spacing-300 font-medium text-body transition-colors ${
            activeTab === "stats"
              ? "bg-core-accent text-solid-white"
              : "bg-components-fill-standard-secondary text-content-standard-primary hover:bg-components-interactive-hover"
          }`}>
          통계
        </button>
      </div>

      {/* 컨텐츠 */}
      {activeTab === "list" ? (
        <div className="space-y-spacing-500">
          <LogFilters />
          <LogList />
        </div>
      ) : (
        <LogStats />
      )}
    </Container>
  );
}
