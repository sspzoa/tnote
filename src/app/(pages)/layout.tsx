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
      <main className="hidden flex-1 md:ml-64 md:block">{children}</main>
    </div>
  );
}
