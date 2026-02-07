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
  Home,
  Hospital,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Modal, SegmentedControl, Skeleton } from "@/shared/components/ui";
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
        <div className="flex flex-col gap-spacing-500">
          <div className="flex flex-col gap-spacing-300">
            <p className="font-medium text-body text-content-standard-primary">테마</p>
            <SegmentedControl items={themeOptions} value={theme} onChange={setTheme} />
          </div>

          <div className="flex flex-col gap-spacing-300 border-line-divider border-t pt-spacing-500">
            <p className="font-medium text-body text-content-standard-primary">계정</p>
            <Button variant="secondary" onClick={() => setShowPasswordModal(true)} className="w-full">
              비밀번호 변경
            </Button>
          </div>

          <div className="flex flex-col gap-spacing-300 border-line-divider border-t pt-spacing-500">
            <p className="font-medium text-body text-content-standard-primary">법적 고지</p>
            <div className="flex flex-col gap-spacing-200">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-spacing-100 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200 font-semibold text-content-standard-primary text-label transition-all duration-150 hover:border-core-accent/30 hover:bg-components-interactive-hover active:scale-[0.98]">
                이용약관
                <ExternalLink className="size-3" />
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-spacing-100 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-200 font-semibold text-content-standard-primary text-label transition-all duration-150 hover:border-core-accent/30 hover:bg-components-interactive-hover active:scale-[0.98]">
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
    if (!confirm("로그아웃 하시겠습니까?")) return;

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
      href: "/calendar",
      icon: Calendar,
      label: "캘린더",
    },
  ];
  const allMenuItems = isAdmin ? [...menuItems, ...adminMenuItems] : studentMenuItems;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      <div className="border-line-divider border-b px-spacing-300 py-spacing-400">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <Link
            href="/"
            className={`group flex items-center gap-spacing-300 rounded-radius-300 p-spacing-200 transition-colors hover:bg-core-accent-translucent ${isCollapsed ? "justify-center" : ""}`}
            onClick={() => setIsOpen(false)}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-radius-300 bg-core-accent">
              <span className="font-bold text-label text-solid-white">T</span>
            </div>
            {!isCollapsed && (
              <div className="flex min-w-0 flex-col">
                <span className="font-bold text-body text-content-standard-primary leading-tight">Tnote</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  userInfo?.workspaceName && (
                    <span className="truncate text-caption text-content-standard-tertiary">
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
              className="rounded-radius-300 p-spacing-200 text-content-standard-tertiary transition-colors hover:bg-components-interactive-hover hover:text-content-standard-primary">
              <ChevronLeft className="size-5" />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="flex w-full items-center justify-center rounded-radius-300 p-spacing-200 text-content-standard-tertiary transition-colors hover:bg-components-interactive-hover hover:text-content-standard-primary">
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-spacing-300 py-spacing-400">
        <div className="flex flex-col gap-spacing-100">
          {isLoading
            ? [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-spacing-300 px-spacing-300 py-spacing-300 ${isCollapsed ? "justify-center" : ""}`}>
                  <Skeleton className="size-5 shrink-0 rounded-radius-100" />
                  {!isCollapsed && <Skeleton className="h-[22px] w-20 rounded-radius-200" />}
                </div>
              ))
            : allMenuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-spacing-300 rounded-radius-300 px-spacing-300 py-spacing-300 transition-all duration-150 ${isCollapsed ? "justify-center" : ""} ${
                      active
                        ? "bg-core-accent text-solid-white"
                        : "text-content-standard-secondary hover:bg-components-interactive-hover hover:text-content-standard-primary"
                    }`}>
                    <item.icon
                      className={`size-5 shrink-0 transition-colors ${active ? "text-solid-white" : "text-content-standard-tertiary group-hover:text-content-standard-secondary"}`}
                    />
                    {!isCollapsed && <span className="font-medium text-label">{item.label}</span>}
                  </Link>
                );
              })}
        </div>
      </nav>

      <div className="border-line-divider border-t p-spacing-300">
        {isLoading ? (
          <div className="flex flex-col gap-spacing-200">
            <div
              className={`flex items-center gap-spacing-300 rounded-radius-300 p-spacing-200 ${isCollapsed ? "justify-center" : ""}`}>
              <Skeleton className="size-9 shrink-0 rounded-full" />
              {!isCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col gap-spacing-100">
                  <Skeleton className="h-[22px] w-16" />
                  <Skeleton className="h-4 w-10" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex gap-spacing-200">
                <Skeleton className="h-[38px] flex-1 rounded-radius-300" />
                <Skeleton className="h-[38px] w-[88px] rounded-radius-300" />
              </div>
            )}
          </div>
        ) : userInfo ? (
          <div className="flex flex-col gap-spacing-200">
            <div
              className={`flex items-center gap-spacing-300 rounded-radius-300 p-spacing-200 transition-colors hover:bg-components-interactive-hover ${isCollapsed ? "justify-center" : ""}`}>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-core-accent-translucent ring-2 ring-core-accent/20">
                <span className="font-semibold text-core-accent text-label">{userInfo.name?.charAt(0) || "U"}</span>
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-content-standard-primary text-label">{userInfo.name}</div>
                  <div className="text-caption text-content-standard-tertiary">
                    {userInfo.role === "owner" ? "소유자" : userInfo.role === "student" ? "학생" : "관리자"}
                  </div>
                </div>
              )}
            </div>
            {isCollapsed ? (
              <div className="flex flex-col gap-spacing-200">
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
              <div className="flex gap-spacing-200">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettingsModal(true)}
                  className="flex flex-1 items-center justify-center gap-spacing-100">
                  <Settings className="size-3.5" />
                  설정
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-spacing-100">
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
    : [{ href: "/calendar", icon: Calendar, label: "캘린더" }];

  return (
    <>
      <nav className="fixed right-0 bottom-0 left-0 z-50 border-line-outline border-t bg-components-fill-standard-primary print:hidden md:hidden">
        <div className="flex items-center justify-around px-spacing-200 py-spacing-300">
          {mobileMenuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-spacing-100 rounded-radius-300 px-spacing-200 py-spacing-200 transition-colors ${
                  active ? "text-core-accent" : "text-content-standard-tertiary"
                }`}>
                <item.icon className="size-5" />
                <span className="text-caption">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-1 flex-col items-center gap-spacing-100 rounded-radius-300 px-spacing-200 py-spacing-200 transition-colors ${
              isOpen ? "text-core-accent" : "text-content-standard-tertiary"
            }`}>
            <Settings className="size-5" />
            <span className="text-caption">더보기</span>
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-solid-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 bottom-[73px] left-0 flex flex-col gap-spacing-400 rounded-t-radius-600 bg-components-fill-standard-primary p-spacing-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-spacing-300">
                <div className="flex size-9 items-center justify-center rounded-full bg-core-accent-translucent ring-2 ring-core-accent/20">
                  <span className="font-semibold text-core-accent text-label">{userInfo?.name?.charAt(0) || "U"}</span>
                </div>
                <div>
                  <div className="font-medium text-content-standard-primary text-label">
                    {isLoading ? <Skeleton className="h-5 w-16" /> : userInfo?.name}
                  </div>
                  <div className="text-caption text-content-standard-tertiary">
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
                <span className="rounded-radius-200 bg-core-accent-translucent px-spacing-200 py-spacing-100 text-caption text-core-accent">
                  {userInfo.workspaceName}
                </span>
              )}
            </div>

            {isAdmin && (
              <div className="grid grid-cols-4 gap-spacing-200">
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
                    className="flex flex-col items-center gap-spacing-100 rounded-radius-300 bg-components-fill-standard-secondary p-spacing-300 transition-colors hover:bg-components-interactive-hover">
                    <item.icon className="size-5 text-content-standard-secondary" />
                    <span className="text-caption text-content-standard-primary">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex gap-spacing-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsOpen(false);
                  setShowSettingsModal(true);
                }}
                className="flex flex-1 items-center justify-center gap-spacing-200">
                <Settings className="size-4" />
                설정
              </Button>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-spacing-200">
                <LogOut className="size-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`fixed top-0 left-0 hidden h-full flex-col border-line-outline border-r bg-components-fill-standard-primary transition-[width] duration-300 print:hidden md:flex ${isCollapsed ? "w-16" : "w-64"}`}>
        {sidebarContent}
      </aside>

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  );
}
