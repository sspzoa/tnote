"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {
  BookOpen,
  Calendar,
  ClipboardList,
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
import { Button, Modal, SegmentedControl } from "@/shared/components/ui";
import { useTheme } from "@/shared/hooks/useTheme";
import { sidebarOpenAtom } from "./(atoms)/useSidebarStore";
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
    bgColor: "bg-core-accent-translucent",
    iconColor: "text-core-accent",
  },
];

const adminMenuItems = [
  {
    href: "/messages",
    icon: MessageSquare,
    label: "문자 관리",
    bgColor: "bg-core-accent-translucent",
    iconColor: "text-core-accent",
  },
  {
    href: "/retakes",
    icon: ClipboardList,
    label: "재시험 관리",
    bgColor: "bg-core-accent-translucent",
    iconColor: "text-core-accent",
  },
  {
    href: "/students",
    icon: Users,
    label: "학생 관리",
    bgColor: "bg-core-accent-translucent",
    iconColor: "text-core-accent",
  },
  {
    href: "/courses",
    icon: BookOpen,
    label: "수업 관리",
    bgColor: "bg-core-accent-translucent",
    iconColor: "text-core-accent",
  },
  {
    href: "/clinics",
    icon: Hospital,
    label: "클리닉 관리",
    bgColor: "bg-core-accent-translucent",
    iconColor: "text-core-accent",
  },
];

const ownerMenuItems = [
  {
    href: "/admins",
    icon: UserCog,
    label: "관리자 관리",
    bgColor: "bg-core-accent-translucent",
    iconColor: "text-core-accent",
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
        <div className="space-y-spacing-500">
          <div>
            <p className="mb-spacing-300 font-medium text-body text-content-standard-primary">테마</p>
            <SegmentedControl items={themeOptions} value={theme} onChange={setTheme} />
          </div>

          <div className="border-line-divider border-t pt-spacing-500">
            <p className="mb-spacing-300 font-medium text-body text-content-standard-primary">계정</p>
            <Button variant="secondary" onClick={() => setShowPasswordModal(true)} className="w-full">
              비밀번호 변경
            </Button>
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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);

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
        alert("로그아웃에 실패했습니다.");
      }
    } catch {
      alert("로그아웃에 실패했습니다.");
    }
  };

  const isAdmin = userInfo?.role === "admin" || userInfo?.role === "owner";
  const isOwner = userInfo?.role === "owner";
  const studentMenuItems = [
    {
      href: "/calendar",
      icon: Calendar,
      label: "캘린더",
      bgColor: "bg-core-accent-translucent",
      iconColor: "text-core-accent",
    },
  ];
  const allMenuItems = isAdmin
    ? [...menuItems, ...adminMenuItems, ...(isOwner ? ownerMenuItems : [])]
    : studentMenuItems;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* 로고 */}
      <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
        <Link href="/" className="flex items-center gap-spacing-300" onClick={() => setIsOpen(false)}>
          <h1 className="font-bold text-content-standard-primary text-heading">Tnote</h1>
          {userInfo?.workspaceName && (
            <span className="rounded-radius-200 bg-components-fill-standard-secondary px-spacing-200 py-spacing-100 text-content-standard-tertiary text-footnote">
              {userInfo.workspaceName}
            </span>
          )}
        </Link>
      </div>

      {/* 메뉴 목록 */}
      <nav className="flex-1 overflow-y-auto p-spacing-400">
        <div className="space-y-spacing-100">
          {allMenuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-spacing-300 rounded-radius-300 px-spacing-400 py-spacing-300 transition-all duration-150 ${
                  active ? "bg-core-accent-translucent" : "hover:bg-core-accent-translucent/50"
                }`}>
                {active && (
                  <div className="-translate-y-1/2 absolute top-1/2 left-0 h-6 w-1 rounded-r-full bg-core-accent" />
                )}
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-radius-300 transition-all duration-150 ${active ? "bg-core-accent" : `${item.bgColor} group-hover:scale-105`}`}>
                  <item.icon className={`size-5 ${active ? "text-solid-white" : item.iconColor}`} />
                </div>
                <span
                  className={`font-medium text-body transition-colors duration-150 ${active ? "text-core-accent" : "text-content-standard-primary group-hover:text-core-accent"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {userInfo && (
        <div className="border-line-divider border-t p-spacing-400">
          <div className="mb-spacing-300 flex items-center gap-spacing-300 px-spacing-200">
            <div className="flex size-9 items-center justify-center rounded-full bg-components-fill-standard-secondary">
              <span className="font-semibold text-content-standard-secondary text-label">
                {userInfo.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-body text-content-standard-primary">{userInfo.name}</div>
              <div className="text-content-standard-tertiary text-footnote">
                {userInfo.role === "owner" ? "소유자" : userInfo.role === "student" ? "학생" : "관리자"}
              </div>
            </div>
          </div>
          <div className="flex gap-spacing-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettingsModal(true)}
              className="flex flex-1 items-center justify-center gap-spacing-100">
              <Settings className="size-3" />
              설정
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="flex items-center justify-center gap-spacing-100">
              <LogOut className="size-3" />
              로그아웃
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-components-fill-standard-primary md:hidden">
        <div className="flex items-center justify-between border-line-divider border-b px-spacing-600 py-spacing-500">
          <div className="flex items-center gap-spacing-300">
            <h1 className="font-bold text-content-standard-primary text-heading">Tnote</h1>
            {userInfo?.workspaceName && (
              <span className="rounded-radius-200 bg-components-fill-standard-secondary px-spacing-200 py-spacing-100 text-content-standard-tertiary text-footnote">
                {userInfo.workspaceName}
              </span>
            )}
          </div>
          {userInfo && (
            <div className="flex items-center gap-spacing-200 text-body text-content-standard-primary">
              <span className="text-content-standard-tertiary">
                {userInfo.role === "owner" ? "소유자" : userInfo.role === "student" ? "학생" : "관리자"}
              </span>
              <span className="font-medium">{userInfo.name}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-spacing-600">
          <div className="flex flex-col items-center gap-spacing-600 text-center">
            <p className="text-body text-content-standard-secondary">
              모바일 환경은 지원하지 않습니다.
              <br />
              PC에서 이용해 주세요.
            </p>

            {userInfo && (
              <div className="flex w-full max-w-xs flex-col gap-spacing-300">
                <Button
                  variant="secondary"
                  onClick={() => setShowSettingsModal(true)}
                  className="flex w-full items-center justify-center gap-spacing-200">
                  <Settings className="size-4" />
                  설정
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-spacing-200">
                  <LogOut className="size-4" />
                  로그아웃
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="fixed top-0 left-0 hidden h-full w-64 flex-col border-line-outline border-r bg-components-fill-standard-primary md:flex">
        {sidebarContent}
      </aside>

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  );
}
