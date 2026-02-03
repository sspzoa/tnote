"use client";

import { useAtom } from "jotai";
import type React from "react";
import { sidebarCollapsedAtom } from "@/shared/components/common/(atoms)/useSidebarStore";
import Sidebar from "@/shared/components/common/Sidebar";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed] = useAtom(sidebarCollapsedAtom);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className={`min-w-0 flex-1 overflow-x-auto pb-20 transition-[margin] duration-300 md:pb-0 ${isCollapsed ? "md:ml-16" : "md:ml-64"}`}>
        {children}
      </main>
    </div>
  );
}
