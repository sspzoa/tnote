import {
  BookOpen,
  Calendar,
  ClipboardList,
  FileCheck,
  Hospital,
  type LucideIcon,
  MessageSquare,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

/** Single source of truth for owner/admin navigation (desktop sidebar + mobile sheet share this). */
export const adminNavItems: NavItem[] = [
  { href: "/calendar", icon: Calendar, label: "캘린더" },
  { href: "/messages", icon: MessageSquare, label: "문자 관리" },
  { href: "/retakes", icon: ClipboardList, label: "재시험 관리" },
  { href: "/assignments", icon: FileCheck, label: "과제 관리" },
  { href: "/students", icon: Users, label: "학생 관리" },
  { href: "/courses", icon: BookOpen, label: "수업 관리" },
  { href: "/clinics", icon: Hospital, label: "클리닉 관리" },
  { href: "/admins", icon: UserCog, label: "관리자 관리" },
];

/** Single source of truth for student navigation. */
export const studentNavItems: NavItem[] = [
  { href: "/my/calendar", icon: Calendar, label: "내 캘린더" },
  { href: "/my/courses", icon: BookOpen, label: "시험 현황" },
  { href: "/my/assignments", icon: FileCheck, label: "과제 현황" },
  { href: "/my/clinics", icon: Stethoscope, label: "클리닉 출석" },
  { href: "/my/retakes", icon: ClipboardList, label: "재시험 현황" },
];
