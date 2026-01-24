"use client";

import type { ReactNode } from "react";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { formatPhoneNumber } from "@/shared/lib/utils/phone";
import { TAG_COLOR_CLASSES } from "@/shared/lib/utils/tagColors";
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
              const colorClasses = TAG_COLOR_CLASSES[tag.color];
              return (
                <span
                  key={assignment.id}
                  className={`rounded-radius-200 px-spacing-150 py-spacing-50 font-medium text-caption ${colorClasses.bg} ${colorClasses.text}`}>
                  {tag.name}
                </span>
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
  return <LoadingComponent className="py-spacing-600" size="md" />;
}
