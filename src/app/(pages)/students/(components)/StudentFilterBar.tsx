import { useAtom } from "jotai";
import { Star } from "lucide-react";
import { SearchInput } from "@/shared/components/ui";
import { type Course, searchQueryAtom, selectedCourseAtom, showFavoritesOnlyAtom } from "../(atoms)/useStudentsStore";

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
      <div className="mb-spacing-600 flex flex-wrap gap-spacing-300">
        <button
          onClick={() => setSelectedCourse("all")}
          className={`rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
            selectedCourse === "all"
              ? "bg-core-accent text-solid-white"
              : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
          }`}>
          전체
        </button>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-spacing-200 rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors ${
            showFavoritesOnly
              ? "bg-solid-yellow text-solid-white"
              : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
          }`}>
          <Star className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
          즐겨찾기
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

      {/* 검색 */}
      <div className="mb-spacing-600">
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
