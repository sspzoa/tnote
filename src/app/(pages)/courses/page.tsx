"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  created_at: string;
  student_count?: number;
}

interface Student {
  id: string; // primary key (uuid)
  phone_number: string;
  name: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [courseName, setCourseName] = useState("");
  const [saving, setSaving] = useState(false);
  const [enrolledSearchQuery, setEnrolledSearchQuery] = useState("");
  const [unenrolledSearchQuery, setUnenrolledSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchAllStudents();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/courses");
      const result = await response.json();
      setCourses(result.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await fetch("/api/students");
      const result = await response.json();
      setAllStudents(result.data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const fetchEnrolledStudents = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/students`);
      const result = await response.json();
      setEnrolledStudents(result.data || []);
    } catch (error) {
      console.error("Failed to fetch enrolled students:", error);
    }
  };

  const handleCreate = async () => {
    if (!courseName.trim()) {
      alert("코스 이름을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: courseName }),
      });

      if (response.ok) {
        alert("코스가 생성되었습니다.");
        setShowCreateModal(false);
        setCourseName("");
        fetchCourses();
      } else {
        alert("코스 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Create error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCourse || !courseName.trim()) {
      alert("코스 이름을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: courseName }),
      });

      if (response.ok) {
        alert("코스가 수정되었습니다.");
        setShowEditModal(false);
        fetchCourses();
      } else {
        alert("코스 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`"${course.name}" 코스를 삭제하시겠습니까?\n등록된 학생 정보는 유지되지만 수강 기록이 삭제됩니다.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("코스가 삭제되었습니다.");
        fetchCourses();
      } else {
        alert("코스 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const handleEnroll = async (studentId: string) => {
    if (!selectedCourse) return;

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        alert("학생이 등록되었습니다.");
        fetchEnrolledStudents(selectedCourse.id);
        fetchCourses();
      } else {
        const result = await response.json();
        alert(result.error || "학생 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Enroll error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const handleUnenroll = async (studentId: string) => {
    if (!selectedCourse) return;

    if (!confirm("이 학생을 코스에서 제거하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/enroll`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        alert("학생이 제거되었습니다.");
        fetchEnrolledStudents(selectedCourse.id);
        fetchCourses();
      } else {
        alert("학생 제거에 실패했습니다.");
      }
    } catch (error) {
      console.error("Unenroll error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setCourseName(course.name);
    setShowEditModal(true);
  };

  const openEnrollModal = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrollModal(true);
    fetchEnrolledStudents(course.id);
  };

  const getUnenrolledStudents = () => {
    return allStudents.filter(
      (student) => !enrolledStudents.find((enrolled) => enrolled.id === student.id)
    );
  };

  const getFilteredEnrolledStudents = () => {
    return enrolledStudents.filter((student) =>
      student.name.toLowerCase().includes(enrolledSearchQuery.toLowerCase())
    );
  };

  const getFilteredUnenrolledStudents = () => {
    return getUnenrolledStudents().filter((student) =>
      student.name.toLowerCase().includes(unenrolledSearchQuery.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/" className="text-body text-core-accent hover:underline mb-spacing-400 inline-block">
            ← 홈으로 돌아가기
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-title font-bold text-content-standard-primary mb-spacing-200">수업 관리</h1>
              <p className="text-body text-content-standard-secondary">
                전체 {courses.length}개 수업
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-spacing-500 py-spacing-400 bg-core-accent text-solid-white rounded-radius-400 text-body font-semibold hover:opacity-90 transition-opacity">
              + 수업 생성
            </button>
          </div>
        </div>

        {/* 코스 목록 */}
        {loading ? (
          <div className="text-center py-spacing-900 text-content-standard-tertiary">로딩중...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-spacing-900">
            <p className="text-body text-content-standard-tertiary">수업이 없습니다.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-spacing-500 px-spacing-500 py-spacing-400 bg-core-accent text-solid-white rounded-radius-400 text-body font-semibold hover:opacity-90 transition-opacity">
              첫 수업 만들기
            </button>
          </div>
        ) : (
          <div className="bg-components-fill-standard-primary rounded-radius-400 border border-line-outline">
            <table className="w-full rounded-radius-400">
              <thead className="bg-components-fill-standard-secondary">
                <tr>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary">수업명</th>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary">학생 수</th>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary">관리</th>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary w-24"></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-t border-line-divider hover:bg-components-interactive-hover transition-colors">
                    <td className="px-spacing-500 py-spacing-400">
                      <Link href={`/courses/${course.id}`}>
                        <div className="text-body font-medium text-content-standard-primary hover:text-core-accent transition-colors cursor-pointer">
                          {course.name}
                        </div>
                      </Link>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <span className="px-spacing-300 py-spacing-100 bg-solid-translucent-blue text-solid-blue rounded-radius-200 text-footnote font-semibold">
                        {course.student_count || 0}명
                      </span>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="flex gap-spacing-200">
                        <Link href={`/courses/${course.id}`}>
                          <button className="px-spacing-400 py-spacing-200 bg-core-accent text-solid-white rounded-radius-300 text-footnote font-medium hover:opacity-90 transition-opacity">
                            시험 관리
                          </button>
                        </Link>
                        <button
                          onClick={() => openEnrollModal(course)}
                          className="px-spacing-400 py-spacing-200 bg-solid-translucent-blue text-solid-blue rounded-radius-300 text-footnote font-medium hover:bg-solid-translucent-indigo transition-colors">
                          학생 관리
                        </button>
                      </div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400 relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                        className="px-spacing-300 py-spacing-200 hover:bg-components-fill-standard-secondary rounded-radius-200 transition-colors">
                        <svg className="w-5 h-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === course.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-spacing-100 bg-components-fill-standard-primary border border-line-outline rounded-radius-300 shadow-lg py-spacing-200 z-20 min-w-[120px]">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                openEditModal(course);
                              }}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary hover:bg-components-interactive-hover transition-colors">
                              수정
                            </button>
                            <div className="my-spacing-100 border-t border-line-divider" />
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDelete(course);
                              }}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative hover:bg-solid-translucent-red transition-colors">
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 생성 모달 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-solid-black/50 flex items-center justify-center p-spacing-400 z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-components-fill-standard-primary rounded-radius-600 border border-line-outline max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="px-spacing-600 py-spacing-500 border-b border-line-divider">
                <h2 className="text-heading font-bold text-content-standard-primary">수업 생성</h2>
              </div>

              <div className="p-spacing-600">
                <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                  수업 이름 <span className="text-core-status-negative">*</span>
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="예: 웹 프로그래밍 기초"
                  className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                />
              </div>

              <div className="px-spacing-600 py-spacing-500 border-t border-line-divider flex gap-spacing-300">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCourseName("");
                  }}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-300 text-body font-semibold hover:bg-components-interactive-hover transition-colors">
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !courseName.trim()}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-core-accent text-solid-white rounded-radius-300 text-body font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {saving ? "생성 중..." : "생성"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && selectedCourse && (
          <div className="fixed inset-0 bg-solid-black/50 flex items-center justify-center p-spacing-400 z-50" onClick={() => setShowEditModal(false)}>
            <div className="bg-components-fill-standard-primary rounded-radius-600 border border-line-outline max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="px-spacing-600 py-spacing-500 border-b border-line-divider">
                <h2 className="text-heading font-bold text-content-standard-primary">수업 수정</h2>
              </div>

              <div className="p-spacing-600">
                <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                  수업 이름 <span className="text-core-status-negative">*</span>
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                />
              </div>

              <div className="px-spacing-600 py-spacing-500 border-t border-line-divider flex gap-spacing-300">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-300 text-body font-semibold hover:bg-components-interactive-hover transition-colors">
                  취소
                </button>
                <button
                  onClick={handleEdit}
                  disabled={saving || !courseName.trim()}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-core-accent text-solid-white rounded-radius-300 text-body font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 학생 관리 모달 */}
        {showEnrollModal && selectedCourse && (
          <div className="fixed inset-0 bg-solid-black/50 flex items-center justify-center p-spacing-400 z-50" onClick={() => setShowEnrollModal(false)}>
            <div className="bg-components-fill-standard-primary rounded-radius-600 border border-line-outline max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="px-spacing-600 py-spacing-500 border-b border-line-divider">
                <h2 className="text-heading font-bold text-content-standard-primary mb-spacing-100">학생 관리</h2>
                <p className="text-label text-content-standard-secondary">{selectedCourse.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-spacing-600">
                {/* 등록된 학생 */}
                <div className="mb-spacing-600">
                  <h3 className="text-body font-bold text-content-standard-primary mb-spacing-300">
                    등록된 학생 ({enrolledStudents.length}명)
                  </h3>
                  {enrolledStudents.length === 0 ? (
                    <p className="text-label text-content-standard-tertiary">등록된 학생이 없습니다.</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="이름 검색..."
                        value={enrolledSearchQuery}
                        onChange={(e) => setEnrolledSearchQuery(e.target.value)}
                        className="w-full px-spacing-400 py-spacing-200 mb-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-label text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                      />
                      {getFilteredEnrolledStudents().length === 0 ? (
                        <p className="text-label text-content-standard-tertiary">검색 결과가 없습니다.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-spacing-200">
                          {getFilteredEnrolledStudents().map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between px-spacing-300 py-spacing-200 bg-components-fill-standard-secondary rounded-radius-200 border border-line-outline">
                          <div>
                            <div className="text-body text-content-standard-primary font-medium">{student.name}</div>
                            <div className="text-footnote text-content-standard-tertiary">{student.phone_number}</div>
                          </div>
                          <button
                            onClick={() => handleUnenroll(student.id)}
                            className="px-spacing-300 py-spacing-150 bg-solid-translucent-red text-solid-red rounded-radius-200 text-footnote font-medium hover:bg-solid-translucent-pink transition-colors">
                            제거
                          </button>
                        </div>
                      ))}
                    </div>
                      )}
                    </>
                  )}
                </div>

                {/* 미등록 학생 */}
                <div>
                  <h3 className="text-body font-bold text-content-standard-primary mb-spacing-300">
                    학생 추가 ({getUnenrolledStudents().length}명)
                  </h3>
                  {getUnenrolledStudents().length === 0 ? (
                    <p className="text-label text-content-standard-tertiary">모든 학생이 등록되었습니다.</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="이름 검색..."
                        value={unenrolledSearchQuery}
                        onChange={(e) => setUnenrolledSearchQuery(e.target.value)}
                        className="w-full px-spacing-400 py-spacing-200 mb-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-label text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                      />
                      {getFilteredUnenrolledStudents().length === 0 ? (
                        <p className="text-label text-content-standard-tertiary">검색 결과가 없습니다.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-spacing-200">
                          {getFilteredUnenrolledStudents().map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between px-spacing-300 py-spacing-200 bg-components-fill-standard-secondary rounded-radius-200 border border-line-outline">
                          <div>
                            <div className="text-body text-content-standard-primary font-medium">{student.name}</div>
                            <div className="text-footnote text-content-standard-tertiary">{student.phone_number}</div>
                          </div>
                          <button
                            onClick={() => handleEnroll(student.id)}
                            className="px-spacing-300 py-spacing-150 bg-solid-translucent-green text-solid-green rounded-radius-200 text-footnote font-medium hover:bg-solid-translucent-green transition-colors">
                            추가
                          </button>
                        </div>
                      ))}
                    </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="px-spacing-600 py-spacing-500 border-t border-line-divider">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="w-full px-spacing-500 py-spacing-300 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-300 text-body font-semibold hover:bg-components-interactive-hover transition-colors">
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
