import type React from "react";
import { AppSidebar } from "@/shared/components/common/AppSidebar";
import { CommandBar } from "@/shared/components/common/CommandBar";
import { ErrorBoundary } from "@/shared/components/common/ErrorBoundary";
import { MobileBottomNav } from "@/shared/components/common/MobileBottomNav";
import { PageChromeProvider } from "@/shared/components/common/pageChrome";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // One stable app frame: a counts-aware nav rail + a persistent contextual CommandBar over a
  // PageShell body. Pages teleport their primary action + breadcrumb into the bar via PageChrome.
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <PageChromeProvider>
          <CommandBar />
          <ErrorBoundary>{children}</ErrorBoundary>
        </PageChromeProvider>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
