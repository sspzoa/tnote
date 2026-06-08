import { useAtom } from "jotai";
import { Settings } from "lucide-react";
import { useMemo } from "react";
import { SearchInput } from "@/shared/components/ui";
import { FilterButton } from "@/shared/components/ui/filterButton";
import { TAG_FILTER_COLOR_CLASSES } from "@/shared/lib/utils/tagColors";
import type { Course, StudentTag } from "@/shared/types";
import { showTagManageModalAtom } from "../(atoms)/useModalStore";
import { searchQueryAtom, selectedCourseAtom, selectedTagIdsAtom } from "../(atoms)/useStudentsStore";

interface StudentFilterBarProps {
  courses: Course[];
  tags: StudentTag[];
}

export default function StudentFilterBar({ courses, tags }: StudentFilterBarProps) {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
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

  const getTagButtonClassName = (tag: StudentTag) => {
    const isActive = selectedTagIds.has(tag.id);
    const colorClasses = TAG_FILTER_COLOR_CLASSES[tag.color];
    return isActive
      ? `rounded-md px-3 py-1.5 font-medium text-sm transition-all duration-150 ${colorClasses.activeBg} ${colorClasses.text} ring-1 ring-current`
      : `rounded-md px-3 py-1.5 font-medium text-sm transition-all duration-150 ${colorClasses.bg} ${colorClasses.text} hover:opacity-80`;
  };

  const tagManageButtonClassName =
    "flex items-center gap-1 rounded-md border border-border bg-muted px-3 py-1.5 font-medium text-muted-foreground text-sm transition-all duration-150 hover:border-primary/30 hover:bg-accent hover:text-foreground";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <span className="block font-medium text-muted-foreground text-sm">필터</span>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
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
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setShowTagManageModal(true)} className={tagManageButtonClassName}>
              <Settings className="size-4" />
              태그 관리
            </button>
            {hiddenTags.map((tag) => (
              <button key={tag.id} onClick={() => toggleTag(tag.id)} className={getTagButtonClassName(tag)}>
                {tag.name}
              </button>
            ))}
            {visibleTags.map((tag) => (
              <button key={tag.id} onClick={() => toggleTag(tag.id)} className={getTagButtonClassName(tag)}>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SearchInput
        placeholder="학생 검색..."
        size="lg"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
