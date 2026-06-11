import { useAtom } from "jotai";
import { Settings, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { FilterRow } from "@/shared/components/ui/toolbar";
import { cn } from "@/shared/lib/utils/cn";
import { TAG_FILTER_COLOR_CLASSES } from "@/shared/lib/utils/tagColors";
import type { Course, StudentTag } from "@/shared/types";
import { showTagManageModalAtom } from "../(atoms)/useModalStore";
import { selectedCourseAtom, selectedTagIdsAtom } from "../(atoms)/useStudentsStore";

interface StudentFilterBarProps {
  courses: Course[];
  tags: StudentTag[];
}

export default function StudentFilterBar({ courses, tags }: StudentFilterBarProps) {
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [selectedTagIds, setSelectedTagIds] = useAtom(selectedTagIdsAtom);
  const [, setShowTagManageModal] = useAtom(showTagManageModalAtom);

  const { hiddenTags, visibleTags } = useMemo(() => {
    const hidden = tags.filter((tag) => tag.hidden_by_default);
    const visible = tags.filter((tag) => !tag.hidden_by_default);
    return { hiddenTags: hidden, visibleTags: visible };
  }, [tags]);

  const toggleTag = (tagId: string) => {
    const newSet = new Set(selectedTagIds);
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    setSelectedTagIds(newSet);
  };

  const handleResetFilters = () => {
    setSelectedCourse("all");
    setSelectedTagIds(new Set<string>());
  };

  const isFilterActive = selectedCourse !== "all" || selectedTagIds.size > 0;

  const getTagButtonClassName = (tag: StudentTag) => {
    const isActive = selectedTagIds.has(tag.id);
    const colorClasses = TAG_FILTER_COLOR_CLASSES[tag.color];
    return cn(
      "inline-flex h-8 items-center rounded-md px-2.5 font-medium text-xs transition-all",
      isActive
        ? cn(colorClasses.activeBg, colorClasses.text, "ring-1 ring-current")
        : cn(colorClasses.bg, colorClasses.text, "hover:opacity-80"),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <FilterRow>
        <FilterButton active={selectedCourse === "all"} onClick={() => setSelectedCourse("all")}>
          전체
        </FilterButton>
        {courses.map((course) => (
          <FilterButton
            key={course.id}
            active={selectedCourse === course.id}
            onClick={() => setSelectedCourse(course.id)}>
            {course.name}
          </FilterButton>
        ))}
      </FilterRow>

      <FilterRow>
        <Button variant="outline" size="sm" onClick={() => setShowTagManageModal(true)}>
          <Settings className="size-4" />
          태그 관리
        </Button>
        {hiddenTags.map((tag) => (
          <button type="button" key={tag.id} onClick={() => toggleTag(tag.id)} className={getTagButtonClassName(tag)}>
            {tag.name}
          </button>
        ))}
        {visibleTags.map((tag) => (
          <button type="button" key={tag.id} onClick={() => toggleTag(tag.id)} className={getTagButtonClassName(tag)}>
            {tag.name}
          </button>
        ))}
      </FilterRow>

      {isFilterActive && (
        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex w-fit items-center gap-1 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground">
          <X className="size-3" />
          필터 초기화
        </button>
      )}
    </div>
  );
}
