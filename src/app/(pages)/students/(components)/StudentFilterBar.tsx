import { useAtom } from "jotai";
import { Settings } from "lucide-react";
import { SearchInput } from "@/shared/components/ui";
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

  const toggleTag = (tagId: string) => {
    const newSet = new Set(selectedTagIds);
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    setSelectedTagIds(newSet);
  };

  return (
    <div className="flex flex-col gap-spacing-600">
      <div className="flex flex-wrap gap-spacing-300">
        <button
          onClick={() => setSelectedCourse("all")}
          className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
            selectedCourse === "all"
              ? "bg-core-accent text-solid-white"
              : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
          }`}>
          전체
        </button>
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course.id)}
            className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
              selectedCourse === course.id
                ? "bg-core-accent text-solid-white"
                : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
            }`}>
            {course.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-spacing-300">
        <button
          onClick={() => setShowTagManageModal(true)}
          className="flex items-center gap-spacing-100 rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-300 py-spacing-150 font-medium text-content-standard-secondary text-label transition-colors hover:bg-components-interactive-hover hover:text-content-standard-primary">
          <Settings className="size-4" />
          태그 관리
        </button>
        {tags.map((tag) => {
          const isActive = selectedTagIds.has(tag.id);
          const colorClasses = TAG_FILTER_COLOR_CLASSES[tag.color];
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`rounded-radius-300 px-spacing-300 py-spacing-150 font-medium text-label transition-all ${
                isActive
                  ? `${colorClasses.activeBg} ${colorClasses.text} ring-1 ring-current`
                  : `${colorClasses.bg} ${colorClasses.text} hover:opacity-80`
              }`}>
              {tag.name}
            </button>
          );
        })}
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
