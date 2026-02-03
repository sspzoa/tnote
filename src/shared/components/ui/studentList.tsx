"use client";

import type { ReactNode } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { SkeletonSpinner } from "@/shared/components/ui/skeleton";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import type { StudentTagAssignment } from "@/shared/types";

export interface StudentListStudent {
  id: string;
  name: string;
  phone_number: string;
  school?: string | null;
  tags?: StudentTagAssignment[];
}

interface StudentListContainerProps {
  children: ReactNode;
  className?: string;
}

export function StudentListContainer({ children, className = "" }: StudentListContainerProps) {
  return (
    <div
      className={`overflow-y-auto rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary ${className.includes("flex-1") ? "min-h-0" : "h-80"} ${className}`}>
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
  const activeTags = (student.tags || []).filter((assignment) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(assignment.start_date);
    start.setHours(0, 0, 0, 0);
    if (today < start) return false;
    if (assignment.end_date === null) return true;
    const end = new Date(assignment.end_date);
    end.setHours(0, 0, 0, 0);
    return today <= end;
  });

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
          {activeTags.length > 0 &&
            activeTags.map((assignment) => {
              const tag = assignment.tag;
              if (!tag) return null;
              return (
                <Badge key={assignment.id} variant={tag.color} size="xs">
                  {tag.name}
                </Badge>
              );
            })}
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
  return <SkeletonSpinner className="py-spacing-600" size="md" />;
}

interface StudentListSkeletonProps {
  count?: number;
  showCheckbox?: boolean;
  showRightContent?: boolean;
}

export function StudentListSkeleton({
  count = 5,
  showCheckbox = true,
  showRightContent = false,
}: StudentListSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-spacing-300 border-line-divider border-b px-spacing-400 py-spacing-300 last:border-b-0">
          {showCheckbox && (
            <div className="size-4 shrink-0 animate-pulse rounded-radius-100 bg-components-fill-standard-tertiary" />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-spacing-100">
            <div className="h-6 w-20 animate-pulse rounded-radius-200 bg-components-fill-standard-tertiary" />
            <div className="h-5 w-40 animate-pulse rounded-radius-200 bg-components-fill-standard-tertiary" />
          </div>
          {showRightContent && (
            <div className="h-8 w-16 shrink-0 animate-pulse rounded-radius-200 bg-components-fill-standard-tertiary" />
          )}
        </div>
      ))}
    </>
  );
}
