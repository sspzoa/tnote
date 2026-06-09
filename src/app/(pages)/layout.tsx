import type React from "react";
import { AppHeader } from "@/shared/components/common/AppHeader";
import { AppSidebar } from "@/shared/components/common/AppSidebar";
import { ErrorBoundary } from "@/shared/components/common/ErrorBoundary";
import { MobileBottomNav } from "@/shared/components/common/MobileBottomNav";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <ErrorBoundary>{children}</ErrorBoundary>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
