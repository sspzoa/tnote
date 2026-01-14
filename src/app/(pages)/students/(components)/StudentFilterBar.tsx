import { useAtom } from "jotai";
import { Star } from "lucide-react";
import { SearchInput } from "@/shared/components/ui";
import type { Course } from "@/shared/types";
import { searchQueryAtom, selectedCourseAtom, showFavoritesOnlyAtom } from "../(atoms)/useStudentsStore";

interface StudentFilterBarProps {
  courses: Course[];
}

export default function StudentFilterBar({ courses }: StudentFilterBarProps) {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [showFavoritesOnly, setShowFavoritesOnly] = useAtom(showFavoritesOnlyAtom);

  return (
    <>
      {/* 반 필터 */}
      <div className="mb-spacing-400 flex flex-wrap gap-spacing-200 md:mb-spacing-600 md:gap-spacing-300">
        <button
          onClick={() => setSelectedCourse("all")}
          className={`rounded-radius-300 px-spacing-300 py-spacing-150 font-medium text-footnote transition-colors md:px-spacing-400 md:py-spacing-200 md:text-label ${
            selectedCourse === "all"
              ? "bg-core-accent text-solid-white"
              : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
          }`}>
          전체
        </button>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-spacing-150 rounded-radius-300 px-spacing-300 py-spacing-150 font-medium text-footnote transition-colors md:gap-spacing-200 md:px-spacing-400 md:py-spacing-200 md:text-label ${
            showFavoritesOnly
              ? "bg-solid-yellow text-solid-white"
              : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
          }`}>
          <Star className={`h-3.5 w-3.5 md:h-4 md:w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
          즐겨찾기
        </button>
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course.id)}
            className={`rounded-radius-300 px-spacing-300 py-spacing-150 font-medium text-footnote transition-colors md:px-spacing-400 md:py-spacing-200 md:text-label ${
              selectedCourse === course.id
                ? "bg-core-accent text-solid-white"
                : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
            }`}>
            {course.name}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="mb-spacing-400 md:mb-spacing-600">
        <SearchInput
          placeholder="학생 이름 검색..."
          size="lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </>
  );
}
