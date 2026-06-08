"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileCheck,
  Home,
  Hospital,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Settings,
  Stethoscope,
  Sun,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Modal, SegmentedControl, Skeleton } from "@/shared/components/ui";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { useTheme } from "@/shared/hooks/useTheme";
import { useToast } from "@/shared/hooks/useToast";
import { sidebarCollapsedAtom, sidebarOpenAtom } from "./(atoms)/useSidebarStore";
import { PasswordChangeModal } from "./PasswordChangeModal";

interface UserInfo {
  name: string;
  role: string;
  workspaceName: string;
}

const menuItems = [
  {
    href: "/calendar",
    icon: Calendar,
    label: "캘린더",
  },
];

const adminMenuItems = [
  {
    href: "/messages",
    icon: MessageSquare,
    label: "문자 관리",
  },
  {
    href: "/retakes",
    icon: ClipboardList,
    label: "재시험 관리",
  },
  {
    href: "/assignments",
    icon: FileCheck,
    label: "과제 관리",
  },
  {
    href: "/students",
    icon: Users,
    label: "학생 관리",
  },
  {
    href: "/courses",
    icon: BookOpen,
    label: "수업 관리",
  },
  {
    href: "/clinics",
    icon: Hospital,
    label: "클리닉 관리",
  },
  {
    href: "/admins",
    icon: UserCog,
    label: "관리자 관리",
  },
];

const themeOptions = [
  { value: "system" as const, icon: Monitor, label: "시스템" },
  { value: "light" as const, icon: Sun, label: "라이트" },
  { value: "dark" as const, icon: Moon, label: "다크" },
];

function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <Modal
        isOpen={isOpen}
        title="설정"
        onClose={onClose}
        footer={
          <Button variant="secondary" onClick={onClose} className="flex-1">
            닫기
          </Button>
        }>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="font-medium text-base text-foreground">테마</p>
            <SegmentedControl items={themeOptions} value={theme} onChange={setTheme} />
          </div>

          <div className="flex flex-col gap-3 border-border border-t pt-6">
            <p className="font-medium text-base text-foreground">계정</p>
            <Button variant="secondary" onClick={() => setShowPasswordModal(true)} className="w-full">
              비밀번호 변경
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-border border-t pt-6">
            <p className="font-medium text-base text-foreground">법적 고지</p>
            <div className="flex flex-col gap-2">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-md border border-border bg-muted px-3 py-2 font-semibold text-foreground text-sm transition-all duration-150 hover:border-primary/30 hover:bg-accent active:scale-[0.98]">
                이용약관
                <ExternalLink className="size-3" />
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-md border border-border bg-muted px-3 py-2 font-semibold text-foreground text-sm transition-all duration-150 hover:border-primary/30 hover:bg-accent active:scale-[0.98]">
                개인정보처리방침
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </Modal>

      <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      const result = await response.json();
      if (result.user) {
        setUserInfo({
          name: result.user.name,
          role: result.user.role,
          workspaceName: result.user.workspaceName || "",
        });
      }
    } catch {
      // noop
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  const isAdmin = userInfo?.role === "admin" || userInfo?.role === "owner";
  const studentMenuItems = [
    {
      href: "/my/calendar",
      icon: Calendar,
      label: "내 캘린더",
    },
    {
      href: "/my/courses",
      icon: BookOpen,
      label: "시험 현황",
    },
    {
      href: "/my/assignments",
      icon: FileCheck,
      label: "과제 현황",
    },
    {
      href: "/my/clinics",
      icon: Stethoscope,
      label: "클리닉 출석",
    },
    {
      href: "/my/retakes",
      icon: ClipboardList,
      label: "재시험 현황",
    },
  ];
  const allMenuItems = isAdmin ? [...menuItems, ...adminMenuItems] : studentMenuItems;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      <div className="border-border border-b px-3 py-4">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <Link
            href="/"
            className={`group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-primary/10 ${isCollapsed ? "justify-center" : ""}`}
            onClick={() => setIsOpen(false)}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary">
              <span className="font-bold text-sm text-primary-foreground">T</span>
            </div>
            {!isCollapsed && (
              <div className="flex min-w-0 flex-col">
                <span className="font-bold text-base text-foreground leading-tight">Tnote</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  userInfo?.workspaceName && (
                    <span className="truncate text-[10px] text-muted-foreground leading-4">
                      {userInfo.workspaceName}
                    </span>
                  )
                )}
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <ChevronLeft className="size-5" />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">
          {isLoading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-3 ${isCollapsed ? "justify-center" : ""}`}>
                  <Skeleton className="size-5 shrink-0 rounded-sm" />
                  {!isCollapsed && <Skeleton className="h-[22px] w-20 rounded-sm" />}
                </div>
              ))
            : allMenuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all duration-150 ${isCollapsed ? "justify-center" : ""} ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}>
                    <item.icon
                      className={`size-5 shrink-0 transition-colors ${active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-muted-foreground"}`}
                    />
                    {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </Link>
                );
              })}
        </div>
      </nav>

      <div className="border-border border-t p-3">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-3 rounded-md p-2 ${isCollapsed ? "justify-center" : ""}`}>
              <Skeleton className="size-9 shrink-0 rounded-full" />
              {!isCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Skeleton className="h-[22px] w-16" />
                  <Skeleton className="h-4 w-10" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex gap-2">
                <Skeleton className="h-[38px] flex-1 rounded-md" />
                <Skeleton className="h-[38px] w-[88px] rounded-md" />
              </div>
            )}
          </div>
        ) : userInfo ? (
          <div className="flex flex-col gap-2">
            <div
              className={`flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent ${isCollapsed ? "justify-center" : ""}`}>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                <span className="font-semibold text-primary text-sm">{userInfo.name?.charAt(0) || "U"}</span>
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground text-sm">{userInfo.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-4">
                    {userInfo.role === "owner" ? "소유자" : userInfo.role === "student" ? "학생" : "관리자"}
                  </div>
                </div>
              )}
            </div>
            {isCollapsed ? (
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettingsModal(true)}
                  title="설정"
                  className="flex items-center justify-center">
                  <Settings className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  title="로그아웃"
                  className="flex items-center justify-center">
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettingsModal(true)}
                  className="flex flex-1 items-center justify-center gap-1">
                  <Settings className="size-3.5" />
                  설정
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1">
                  <LogOut className="size-3.5" />
                  로그아웃
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  );

  const mobileMenuItems = isAdmin
    ? [
        { href: "/", icon: Home, label: "홈" },
        { href: "/retakes", icon: ClipboardList, label: "재시험" },
        { href: "/students", icon: Users, label: "학생" },
        { href: "/courses", icon: BookOpen, label: "수업" },
      ]
    : [
        { href: "/", icon: Home, label: "홈" },
        { href: "/my/calendar", icon: Calendar, label: "캘린더" },
        { href: "/my/courses", icon: BookOpen, label: "시험" },
        { href: "/my/assignments", icon: FileCheck, label: "과제" },
      ];

  return (
    <>
      <nav className="fixed right-0 bottom-0 left-0 z-50 border-border border-t bg-card md:hidden print:hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {mobileMenuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                <item.icon className="size-5" />
                <span className="text-[10px] leading-4">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 transition-colors ${
              isOpen ? "text-primary" : "text-muted-foreground"
            }`}>
            <Settings className="size-5" />
            <span className="text-[10px] leading-4">더보기</span>
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-solid-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 bottom-[73px] left-0 flex flex-col gap-4 rounded-t-xl bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                  <span className="font-semibold text-primary text-sm">{userInfo?.name?.charAt(0) || "U"}</span>
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">
                    {isLoading ? <Skeleton className="h-5 w-16" /> : userInfo?.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-4">
                    {isLoading ? (
                      <Skeleton className="h-4 w-10" />
                    ) : userInfo?.role === "owner" ? (
                      "소유자"
                    ) : userInfo?.role === "student" ? (
                      "학생"
                    ) : (
                      "관리자"
                    )}
                  </div>
                </div>
              </div>
              {!isLoading && userInfo?.workspaceName && (
                <span className="rounded-sm bg-primary/10 px-2 py-1 text-[10px] text-primary leading-4">
                  {userInfo.workspaceName}
                </span>
              )}
            </div>

            {isAdmin && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { href: "/calendar", icon: Calendar, label: "캘린더" },
                  { href: "/messages", icon: MessageSquare, label: "문자" },
                  { href: "/clinics", icon: Hospital, label: "클리닉" },
                  { href: "/admins", icon: UserCog, label: "관리자" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center gap-1 rounded-md bg-muted p-3 transition-colors hover:bg-accent">
                    <item.icon className="size-5 text-muted-foreground" />
                    <span className="text-[10px] text-foreground leading-4">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsOpen(false);
                  setShowSettingsModal(true);
                }}
                className="flex flex-1 items-center justify-center gap-2">
                <Settings className="size-4" />
                설정
              </Button>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-2">
                <LogOut className="size-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`fixed top-0 left-0 hidden h-full flex-col border-border border-r bg-card transition-[width] duration-300 md:flex print:hidden ${isCollapsed ? "w-16" : "w-64"}`}>
        {sidebarContent}
      </aside>

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  );
}
