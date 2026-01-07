"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Course {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  name: string;
  exam_number: number;
  course: Course;
}

interface Student {
  id: string; // primary key (uuid)
  phone_number: string;
  name: string;
  school: string;
}

export default function AssignRetakePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchExams(selectedCourse);
      fetchStudents(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/exams");
      const result = await response.json();
      const uniqueCourses = result.data.reduce((acc: Course[], exam: Exam) => {
        if (!acc.find((c) => c.id === exam.course.id)) {
          acc.push(exam.course);
        }
        return acc;
      }, []);
      setCourses(uniqueCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchExams = async (courseId: string) => {
    try {
      const response = await fetch(`/api/exams?courseId=${courseId}`);
      const result = await response.json();
      setExams(result.data || []);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    }
  };

  const fetchStudents = async (courseId: string) => {
    try {
      // CourseEnrollments를 통해 해당 코스의 학생 조회
      const response = await fetch(`/api/courses/${courseId}/students`);
      const result = await response.json();
      setStudents(result.data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      // 임시로 빈 배열 설정
      setStudents([]);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExam || selectedStudents.length === 0 || !scheduledDate) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/retakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam,
          studentIds: selectedStudents,
          scheduledDate,
          note,
        }),
      });

      if (response.ok) {
        alert("재시험이 할당되었습니다.");
        router.push("/retakes");
      } else {
        const result = await response.json();
        alert(result.error || "재시험 할당에 실패했습니다.");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/retakes" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 재시험 관리로 돌아가기
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">재시험 할당</h1>
              <p className="text-body text-content-standard-secondary">학생들에게 재시험을 할당합니다</p>
            </div>
            <Link
              href="/exams/create"
              className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 font-medium text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
              + 시험 생성
            </Link>
          </div>
        </div>

        {/* 폼 */}
        <form
          onSubmit={handleSubmit}
          className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary p-spacing-600">
          <div className="space-y-spacing-400">
            {/* 코스 선택 */}
            <div>
              <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                코스 선택 <span className="text-core-status-negative">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedExam("");
                  setSelectedStudents([]);
                }}
                required
                className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
                <option value="">코스를 선택하세요</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 시험 선택 */}
            {selectedCourse && (
              <div>
                <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                  시험 선택 <span className="text-core-status-negative">*</span>
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  required
                  className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent">
                  <option value="">시험을 선택하세요</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.exam_number}회차 - {exam.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 예정일 */}
            <div>
              <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                재시험 예정일 <span className="text-core-status-negative">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
              />
            </div>

            {/* 학생 선택 */}
            {selectedCourse && (
              <div>
                <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                  학생 선택 <span className="text-core-status-negative">*</span>
                  <span className="ml-spacing-200 font-normal text-content-standard-tertiary">
                    ({selectedStudents.length}명 선택됨)
                  </span>
                </label>
                {students.length === 0 ? (
                  <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-300">
                    <p className="py-spacing-400 text-center text-body text-content-standard-tertiary">
                      이 코스에 등록된 학생이 없습니다.
                    </p>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="학생 이름 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-spacing-200 w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                    <div className="max-h-80 overflow-y-auto rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary p-spacing-300">
                      {filteredStudents.length === 0 ? (
                        <p className="py-spacing-400 text-center text-body text-content-standard-tertiary">
                          검색 결과가 없습니다.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-spacing-200">
                          {filteredStudents.map((student) => (
                            <label
                              key={student.id}
                              className="flex cursor-pointer items-center gap-spacing-200 rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-interactive-hover">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => toggleStudent(student.id)}
                                className="h-4 w-4 accent-core-accent"
                              />
                              <div>
                                <div className="text-body text-content-standard-primary">{student.name}</div>
                                <div className="text-content-standard-tertiary text-footnote">
                                  {student.phone_number}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 메모 */}
            <div>
              <label className="mb-spacing-200 block font-semibold text-body text-content-standard-primary">
                메모 (선택)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="재시험 관련 메모를 입력하세요"
                className="w-full resize-none rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-spacing-300 pt-spacing-300">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-radius-400 bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !selectedExam || selectedStudents.length === 0 || !scheduledDate}
                className="flex-1 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? "할당 중..." : "재시험 할당"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
