import type React from "react";
import Sidebar from "@/shared/components/common/Sidebar";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1">{children}</main>
    </div>
  );
}
