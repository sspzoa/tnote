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
      ? `rounded-radius-300 px-spacing-300 py-spacing-150 font-medium text-label transition-all duration-150 ${colorClasses.activeBg} ${colorClasses.text} ring-1 ring-current`
      : `rounded-radius-300 px-spacing-300 py-spacing-150 font-medium text-label transition-all duration-150 ${colorClasses.bg} ${colorClasses.text} hover:opacity-80`;
  };

  const tagManageButtonClassName =
    "flex items-center gap-spacing-100 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-150 font-medium text-content-standard-secondary text-label transition-all duration-150 hover:border-core-accent/30 hover:bg-components-interactive-hover hover:text-content-standard-primary";

  return (
    <div className="flex flex-col gap-spacing-400">
      <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-400">
        <span className="mb-spacing-400 block font-medium text-content-standard-tertiary text-label">필터</span>

        <div className="flex flex-col gap-spacing-400">
          <div className="flex flex-wrap items-center gap-spacing-300">
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

          <div className="flex flex-wrap items-center gap-spacing-300">
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
