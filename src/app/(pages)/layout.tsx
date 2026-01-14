import type React from "react";
import Sidebar from "@/shared/components/common/Sidebar";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      {/* Mobile: add top padding for header, Desktop: add left margin for sidebar */}
      <main className="flex-1 pt-14 md:ml-64 md:pt-0">{children}</main>
    </div>
  );
}
