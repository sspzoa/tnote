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
      <main className="hidden min-w-0 flex-1 overflow-x-auto md:ml-64 md:block">{children}</main>
    </div>
  );
}
