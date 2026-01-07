"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/retakes" className="text-body text-core-accent hover:underline mb-spacing-400 inline-block">
            ← 재시험 관리로 돌아가기
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-title font-bold text-content-standard-primary mb-spacing-200">재시험 할당</h1>
              <p className="text-body text-content-standard-secondary">학생들에게 재시험을 할당합니다</p>
            </div>
            <Link
              href="/exams/create"
              className="px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-300 text-body font-medium hover:bg-components-interactive-hover transition-colors border border-line-outline">
              + 시험 생성
            </Link>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-components-fill-standard-primary rounded-radius-400 border border-line-outline p-spacing-600">
          <div className="space-y-spacing-400">
            {/* 코스 선택 */}
            <div>
              <label className="block text-body font-semibold text-content-standard-primary mb-spacing-200">
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
                className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all">
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
                <label className="block text-body font-semibold text-content-standard-primary mb-spacing-200">
                  시험 선택 <span className="text-core-status-negative">*</span>
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  required
                  className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all">
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
              <label className="block text-body font-semibold text-content-standard-primary mb-spacing-200">
                재시험 예정일 <span className="text-core-status-negative">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
              />
            </div>

            {/* 학생 선택 */}
            {selectedCourse && (
              <div>
                <label className="block text-body font-semibold text-content-standard-primary mb-spacing-200">
                  학생 선택 <span className="text-core-status-negative">*</span>
                  <span className="text-content-standard-tertiary font-normal ml-spacing-200">
                    ({selectedStudents.length}명 선택됨)
                  </span>
                </label>
                {students.length === 0 ? (
                  <div className="bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 p-spacing-300">
                    <p className="text-body text-content-standard-tertiary text-center py-spacing-400">
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
                      className="w-full px-spacing-400 py-spacing-300 mb-spacing-200 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                    <div className="bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 p-spacing-300 max-h-80 overflow-y-auto">
                      {filteredStudents.length === 0 ? (
                        <p className="text-body text-content-standard-tertiary text-center py-spacing-400">
                          검색 결과가 없습니다.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-spacing-200">
                          {filteredStudents.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center gap-spacing-200 px-spacing-300 py-spacing-200 hover:bg-components-interactive-hover rounded-radius-200 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4 accent-core-accent"
                          />
                          <div>
                            <div className="text-body text-content-standard-primary">{student.name}</div>
                            <div className="text-footnote text-content-standard-tertiary">{student.phone_number}</div>
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
              <label className="block text-body font-semibold text-content-standard-primary mb-spacing-200">메모 (선택)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="재시험 관련 메모를 입력하세요"
                className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all resize-none"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-spacing-300 pt-spacing-300">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-spacing-500 py-spacing-400 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-400 text-body font-semibold hover:bg-components-interactive-hover transition-colors">
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !selectedExam || selectedStudents.length === 0 || !scheduledDate}
                className="flex-1 px-spacing-500 py-spacing-400 bg-core-accent text-solid-white rounded-radius-400 text-body font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {loading ? "할당 중..." : "재시험 할당"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
