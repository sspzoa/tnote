"use client";

import type { ReactNode } from "react";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";

export interface StudentListStudent {
  id: string;
  name: string;
  phone_number: string;
  school?: string | null;
}

interface StudentListContainerProps {
  children: ReactNode;
  className?: string;
}

export function StudentListContainer({ children, className = "" }: StudentListContainerProps) {
  return (
    <div
      className={`h-80 overflow-y-auto rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary ${className}`}>
      {children}
    </div>
  );
}

interface StudentListItemProps {
  student: StudentListStudent;
  selected?: boolean;
  onToggle?: () => void;
  highlighted?: boolean;
  badge?: ReactNode;
  rightContent?: ReactNode;
  extraInfo?: ReactNode;
}

export function StudentListItem({
  student,
  selected,
  onToggle,
  highlighted = false,
  badge,
  rightContent,
  extraInfo,
}: StudentListItemProps) {
  const content = (
    <>
      {onToggle !== undefined && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="size-4 shrink-0 cursor-pointer accent-core-accent"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-spacing-200">
          <span className="truncate font-medium text-body text-content-standard-primary">{student.name}</span>
          {badge}
        </div>
        <div className="truncate text-content-standard-tertiary text-footnote">
          {formatPhoneNumber(student.phone_number)}
          {student.school && ` · ${student.school}`}
          {extraInfo}
        </div>
      </div>
      {rightContent && <div className="shrink-0">{rightContent}</div>}
    </>
  );

  const baseClassName = `flex items-center gap-spacing-300 border-line-divider border-b px-spacing-400 py-spacing-300 last:border-b-0 ${
    highlighted ? "bg-solid-translucent-red/30" : ""
  }`;

  if (onToggle !== undefined) {
    return (
      <label
        className={`${baseClassName} cursor-pointer transition-all duration-150 hover:bg-core-accent-translucent/50`}>
        {content}
      </label>
    );
  }

  return <div className={baseClassName}>{content}</div>;
}

interface StudentListEmptyProps {
  message?: string;
}

export function StudentListEmpty({ message = "학생이 없습니다." }: StudentListEmptyProps) {
  return <div className="py-spacing-600 text-center text-content-standard-tertiary">{message}</div>;
}

interface StudentListLoadingProps {
  message?: string;
}

export function StudentListLoading(_props: StudentListLoadingProps) {
  return <LoadingComponent className="py-spacing-600" size="md" />;
}
