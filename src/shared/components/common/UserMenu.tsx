"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, FileText, KeyRound, LogOut, Shield, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/useToast";
import { useUser } from "@/shared/hooks/useUser";
import { PasswordChangeModal } from "./PasswordChangeModal";

const roleLabel = (role?: string) => (role === "owner" ? "소유자" : role === "student" ? "학생" : "관리자");

/** The account menu — lives in the CommandBar (hoisted out of the sidebar footer). */
export function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { user, isLoading } = useUser();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  if (isLoading) {
    return <Skeleton className="size-8 rounded-lg" />;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="계정 메뉴"
            className="flex items-center gap-1.5 rounded-lg p-0.5 pr-1.5 text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent">
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <UserRound className="size-4" />
            </span>
            {user?.name && <span className="hidden font-medium text-foreground text-sm sm:block">{user.name}</span>}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-sm">{user?.name}</span>
              <span className="text-muted-foreground text-xs">
                {roleLabel(user?.role)}
                {user?.workspaceName ? ` · ${user.workspaceName}` : ""}
              </span>
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

      <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </>
  );
}
