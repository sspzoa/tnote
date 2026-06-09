"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, FileText, KeyRound, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/useToast";
import { useUser } from "@/shared/hooks/useUser";
import { adminNavItems, studentNavItems } from "@/shared/lib/nav";
import { PasswordChangeModal } from "./PasswordChangeModal";

const roleLabel = (role?: string) => (role === "owner" ? "소유자" : role === "student" ? "학생" : "관리자");

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { setOpenMobile } = useSidebar();
  const { user, isLoading, isAdmin } = useUser();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const handleLogout = async () => {
    const ok = await confirm({ title: "로그아웃", message: "로그아웃 하시겠습니까?" });
    if (!ok) return;

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        queryClient.clear();
        router.push("/login");
      } else {
        toast.error("로그아웃에 실패했습니다.");
      }
    } catch {
      toast.error("로그아웃에 실패했습니다.");
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/" onClick={() => setOpenMobile(false)}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <span className="font-bold text-sm">T</span>
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-semibold">Tnote</span>
                    {isLoading ? (
                      <Skeleton className="mt-0.5 h-3 w-16" />
                    ) : (
                      user?.workspaceName && (
                        <span className="truncate text-muted-foreground text-xs">{user.workspaceName}</span>
                      )
                    )}
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
                    <SidebarMenuItem key={i}>
                      <div className="flex h-8 items-center gap-2 rounded-md px-2">
                        <Skeleton className="size-4 shrink-0 rounded-md" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </SidebarMenuItem>
                  ))
                : navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link href={item.href} onClick={() => setOpenMobile(false)}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <div className="flex items-center gap-2 p-2">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="grid flex-1 gap-1">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-medium">{user?.name}</span>
                        <span className="truncate text-muted-foreground text-xs">{roleLabel(user?.role)}</span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="right"
                    sideOffset={8}
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm">{user?.name}</span>
                        {user?.workspaceName && (
                          <span className="text-muted-foreground text-xs">{user.workspaceName}</span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowPasswordModal(true)}>
                      <KeyRound />
                      비밀번호 변경
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/terms" target="_blank" rel="noopener noreferrer">
                        <FileText />
                        이용약관
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/privacy" target="_blank" rel="noopener noreferrer">
                        <Shield />
                        개인정보처리방침
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                      <LogOut />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </>
  );
}
