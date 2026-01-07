"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Student {
  id: string; // primary key (uuid)
  phone_number: string;
  name: string;
  parent_phone_number: string | null;
  school: string | null;
  birth_year: number | null;
  enrolled_at?: string;
  created_at?: string;
}

interface Course {
  id: string;
  name: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    parentPhoneNumber: "",
    school: "",
    birthYear: "",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    phoneNumber: "",
    parentPhoneNumber: "",
    school: "",
    birthYear: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/exams");
      const result = await response.json();

      if (response.ok && result.data) {
        const uniqueCourses = result.data.reduce((acc: Course[], exam: any) => {
          if (!acc.find((c) => c.id === exam.course.id)) {
            acc.push(exam.course);
          }
          return acc;
        }, []);
        setCourses(uniqueCourses);
      } else {
        console.error("Failed to fetch courses:", result.error || "Unknown error");
        setCourses([]);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourses([]);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const url = selectedCourse === "all" ? "/api/students" : `/api/students?courseId=${selectedCourse}`;
      const response = await fetch(url);
      const result = await response.json();
      setStudents(result.data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAge = (birthYear: number | null) => {
    if (!birthYear) return 0;
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear + 1;
  };

  const getGrade = (birthYear: number | null) => {
    if (!birthYear) return null;
    const age = getAge(birthYear);
    const gradeNumber = age - 7;

    if (gradeNumber <= 0) return "미취학";
    if (gradeNumber <= 6) return `초${gradeNumber}`;
    if (gradeNumber <= 9) return `중${gradeNumber - 6}`;
    if (gradeNumber <= 12) return `고${gradeNumber - 9}`;
    return "졸업";
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name,
      phoneNumber: student.phone_number,
      parentPhoneNumber: student.parent_phone_number || "",
      school: student.school || "",
      birthYear: student.birth_year?.toString() || "",
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleSave = async () => {
    if (!selectedStudent) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          phoneNumber: editForm.phoneNumber,
          parentPhoneNumber: editForm.parentPhoneNumber || null,
          school: editForm.school || null,
          birthYear: editForm.birthYear ? Number.parseInt(editForm.birthYear) : null,
        }),
      });

      if (response.ok) {
        alert("학생 정보가 수정되었습니다.");
        setShowEditModal(false);
        fetchStudents();
      } else {
        alert("정보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (student: Student) => {
    setOpenMenuId(null);
    if (!confirm(`${student.name} 학생의 비밀번호를 전화번호(${student.phone_number})로 초기화하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${student.id}/reset-password`, {
        method: "POST",
      });

      if (response.ok) {
        alert("비밀번호가 전화번호로 초기화되었습니다.");
      } else {
        alert("비밀번호 재설정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const handleDelete = async (student: Student) => {
    setOpenMenuId(null);
    if (
      !confirm(`${student.name} 학생을 삭제하시겠습니까?\n관련된 모든 데이터(수강 정보, 재시험 등)가 함께 삭제됩니다.`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("학생이 삭제되었습니다.");
        fetchStudents();
      } else {
        const result = await response.json();
        alert(result.error || "학생 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          phoneNumber: createForm.phoneNumber,
          parentPhoneNumber: createForm.parentPhoneNumber || null,
          school: createForm.school || null,
          birthYear: createForm.birthYear || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("학생이 추가되었습니다.");
        setShowCreateModal(false);
        setCreateForm({ name: "", phoneNumber: "", parentPhoneNumber: "", school: "", birthYear: "" });
        fetchStudents();
      } else {
        alert(result.error || "학생 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Create error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/" className="text-body text-core-accent hover:underline mb-spacing-400 inline-block">
            ← 홈으로 돌아가기
          </Link>
          <div className="flex justify-between items-end mb-spacing-500">
            <div>
              <h1 className="text-title font-bold text-content-standard-primary mb-spacing-200">학생 관리</h1>
              <p className="text-body text-content-standard-secondary">전체 학생 {students.length}명</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-spacing-500 py-spacing-400 bg-core-accent text-solid-white rounded-radius-400 text-body font-semibold hover:opacity-90 transition-opacity">
              + 학생 추가
            </button>
          </div>

          {/* 검색 */}
          <input
            type="text"
            placeholder="학생 이름 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-spacing-500 py-spacing-400 bg-components-fill-standard-secondary border border-line-outline rounded-radius-400 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
          />
        </div>

        {/* 반 필터 */}
        <div className="flex gap-spacing-300 mb-spacing-600 flex-wrap">
          <button
            onClick={() => setSelectedCourse("all")}
            className={`px-spacing-400 py-spacing-200 rounded-radius-300 text-label font-medium transition-colors ${
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
              className={`px-spacing-400 py-spacing-200 rounded-radius-300 text-label font-medium transition-colors ${
                selectedCourse === course.id
                  ? "bg-core-accent text-solid-white"
                  : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
              }`}>
              {course.name}
            </button>
          ))}
        </div>

        {/* 학생 목록 */}
        {loading ? (
          <div className="text-center py-spacing-900 text-content-standard-tertiary">로딩중...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-spacing-900">
            <p className="text-body text-content-standard-tertiary">
              {students.length === 0 ? "학생이 없습니다." : "검색 결과가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="bg-components-fill-standard-primary rounded-radius-400 border border-line-outline">
            <table className="w-full rounded-radius-400">
              <thead className="bg-components-fill-standard-secondary">
                <tr>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary">
                    이름
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary">
                    학년
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary">
                    전화번호
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary">
                    학부모 번호
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary">
                    학교
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left text-body font-semibold text-content-standard-primary w-24"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-t border-line-divider hover:bg-components-interactive-hover transition-colors">
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="text-body font-medium text-content-standard-primary">{student.name}</div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      {student.birth_year && getGrade(student.birth_year) && (
                        <span className="px-spacing-300 py-spacing-100 bg-solid-translucent-blue text-solid-blue rounded-radius-200 text-footnote font-semibold">
                          {getGrade(student.birth_year)}
                        </span>
                      )}
                    </td>
                    <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                      {student.phone_number}
                    </td>
                    <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                      {student.parent_phone_number || "-"}
                    </td>
                    <td className="px-spacing-500 py-spacing-400 text-body text-content-standard-secondary">
                      {student.school || "-"}
                    </td>
                    <td className="px-spacing-500 py-spacing-400 relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                        className="px-spacing-300 py-spacing-200 hover:bg-components-fill-standard-secondary rounded-radius-200 transition-colors">
                        <svg className="w-5 h-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === student.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-spacing-100 bg-components-fill-standard-primary border border-line-outline rounded-radius-300 shadow-lg py-spacing-200 z-20 min-w-[160px]">
                            <button
                              onClick={() => handleEditClick(student)}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary hover:bg-components-interactive-hover transition-colors">
                              정보 수정
                            </button>
                            <button
                              onClick={() => handleResetPassword(student)}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary hover:bg-components-interactive-hover transition-colors">
                              비밀번호 초기화
                            </button>
                            <div className="my-spacing-100 border-t border-line-divider" />
                            <button
                              onClick={() => handleDelete(student)}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative hover:bg-solid-translucent-red transition-colors">
                              학생 삭제
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

        {/* 학생 추가 모달 */}
        {showCreateModal && (
          <div
            className="fixed inset-0 bg-solid-black/50 flex items-center justify-center p-spacing-400 z-50"
            onClick={() => setShowCreateModal(false)}>
            <div
              className="bg-components-fill-standard-primary rounded-radius-600 border border-line-outline max-w-2xl w-full overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              <div className="px-spacing-600 py-spacing-500 border-b border-line-divider">
                <h2 className="text-heading font-bold text-content-standard-primary">학생 추가</h2>
                <p className="text-label text-content-standard-secondary mt-spacing-100">
                  새로운 학생을 추가합니다. 비밀번호는 전화번호로 자동 설정됩니다.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-spacing-600">
                <div className="space-y-spacing-400">
                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      이름 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      required
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      전화번호 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="tel"
                      value={createForm.phoneNumber}
                      onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                      required
                      placeholder="01012345678"
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      부모님 전화번호
                    </label>
                    <input
                      type="tel"
                      value={createForm.parentPhoneNumber}
                      onChange={(e) => setCreateForm({ ...createForm, parentPhoneNumber: e.target.value })}
                      placeholder="01012345678"
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      학교
                    </label>
                    <input
                      type="text"
                      value={createForm.school}
                      onChange={(e) => setCreateForm({ ...createForm, school: e.target.value })}
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      출생년도
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={createForm.birthYear}
                      onChange={(e) => setCreateForm({ ...createForm, birthYear: e.target.value })}
                      placeholder="2010"
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="px-spacing-600 py-spacing-500 border-t border-line-divider flex gap-spacing-300">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-300 text-body font-semibold hover:bg-components-interactive-hover transition-colors">
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !createForm.name || !createForm.phoneNumber}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-core-accent text-solid-white rounded-radius-300 text-body font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {saving ? "추가 중..." : "추가"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && selectedStudent && (
          <div
            className="fixed inset-0 bg-solid-black/50 flex items-center justify-center p-spacing-400 z-50"
            onClick={() => setShowEditModal(false)}>
            <div
              className="bg-components-fill-standard-primary rounded-radius-600 border border-line-outline max-w-2xl w-full overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              <div className="px-spacing-600 py-spacing-500 border-b border-line-divider">
                <h2 className="text-heading font-bold text-content-standard-primary">학생 정보 수정</h2>
                <p className="text-label text-content-standard-secondary mt-spacing-100">
                  {selectedStudent.name} 학생의 정보를 수정합니다
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-spacing-600">
                <div className="space-y-spacing-400">
                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      이름 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      전화번호 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      required
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      부모님 전화번호
                    </label>
                    <input
                      type="tel"
                      value={editForm.parentPhoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, parentPhoneNumber: e.target.value })}
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      학교
                    </label>
                    <input
                      type="text"
                      value={editForm.school}
                      onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-label font-semibold text-content-standard-primary mb-spacing-200">
                      출생년도
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={editForm.birthYear}
                      onChange={(e) => setEditForm({ ...editForm, birthYear: e.target.value })}
                      className="w-full px-spacing-400 py-spacing-300 bg-components-fill-standard-secondary border border-line-outline rounded-radius-300 text-body text-content-standard-primary focus:outline-none focus:border-core-accent focus:ring-2 focus:ring-core-accent-translucent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="px-spacing-600 py-spacing-500 border-t border-line-divider flex gap-spacing-300">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-components-fill-standard-secondary text-content-standard-primary rounded-radius-300 text-body font-semibold hover:bg-components-interactive-hover transition-colors">
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editForm.name || !editForm.phoneNumber}
                  className="flex-1 px-spacing-500 py-spacing-300 bg-core-accent text-solid-white rounded-radius-300 text-body font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
