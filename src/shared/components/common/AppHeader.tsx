"use client";

import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 print:hidden">
      <SidebarTrigger className="-ml-1.5" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
