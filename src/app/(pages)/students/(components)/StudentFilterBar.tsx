import { useAtom } from "jotai";
import { SearchInput } from "@/shared/components/ui";
import { type Course, searchQueryAtom, selectedCourseAtom } from "../(atoms)/useStudentsStore";

interface StudentFilterBarProps {
  courses: Course[];
}

export default function StudentFilterBar({ courses }: StudentFilterBarProps) {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-spacing-500 py-spacing-400 text-body"
        />
      </div>
    </>
  );
}
