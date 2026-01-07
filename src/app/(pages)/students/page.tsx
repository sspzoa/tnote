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
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 홈으로 돌아가기
          </Link>
          <div className="mb-spacing-500 flex items-end justify-between">
            <div>
              <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">학생 관리</h1>
              <p className="text-body text-content-standard-secondary">전체 학생 {students.length}명</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
              + 학생 추가
            </button>
          </div>

          {/* 검색 */}
          <input
            type="text"
            placeholder="학생 이름 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
          />
        </div>

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

        {/* 학생 목록 */}
        {loading ? (
          <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-spacing-900 text-center">
            <p className="text-body text-content-standard-tertiary">
              {students.length === 0 ? "학생이 없습니다." : "검색 결과가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <table className="w-full rounded-radius-400">
              <thead className="bg-components-fill-standard-secondary">
                <tr>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    이름
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    학년
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    전화번호
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    학부모 번호
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    학교
                  </th>
                  <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="font-medium text-body text-content-standard-primary">{student.name}</div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      {student.birth_year && getGrade(student.birth_year) && (
                        <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
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
                    <td className="relative px-spacing-500 py-spacing-400">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                        className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
                        <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === student.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[160px] rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200 shadow-lg">
                            <button
                              onClick={() => handleEditClick(student)}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                              정보 수정
                            </button>
                            <button
                              onClick={() => handleResetPassword(student)}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                              비밀번호 초기화
                            </button>
                            <div className="my-spacing-100 border-line-divider border-t" />
                            <button
                              onClick={() => handleDelete(student)}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative transition-colors hover:bg-solid-translucent-red">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowCreateModal(false)}>
            <div
              className="flex w-full max-w-2xl flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-heading">학생 추가</h2>
                <p className="mt-spacing-100 text-content-standard-secondary text-label">
                  새로운 학생을 추가합니다. 비밀번호는 전화번호로 자동 설정됩니다.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-spacing-600">
                <div className="space-y-spacing-400">
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      이름 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      required
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      전화번호 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="tel"
                      value={createForm.phoneNumber}
                      onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                      required
                      placeholder="01012345678"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      부모님 전화번호
                    </label>
                    <input
                      type="tel"
                      value={createForm.parentPhoneNumber}
                      onChange={(e) => setCreateForm({ ...createForm, parentPhoneNumber: e.target.value })}
                      placeholder="01012345678"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      학교
                    </label>
                    <input
                      type="text"
                      value={createForm.school}
                      onChange={(e) => setCreateForm({ ...createForm, school: e.target.value })}
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      출생년도
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={createForm.birthYear}
                      onChange={(e) => setCreateForm({ ...createForm, birthYear: e.target.value })}
                      placeholder="2010"
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !createForm.name || !createForm.phoneNumber}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? "추가 중..." : "추가"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && selectedStudent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowEditModal(false)}>
            <div
              className="flex w-full max-w-2xl flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-heading">학생 정보 수정</h2>
                <p className="mt-spacing-100 text-content-standard-secondary text-label">
                  {selectedStudent.name} 학생의 정보를 수정합니다
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-spacing-600">
                <div className="space-y-spacing-400">
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      이름 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      전화번호 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      required
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      부모님 전화번호
                    </label>
                    <input
                      type="tel"
                      value={editForm.parentPhoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, parentPhoneNumber: e.target.value })}
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      학교
                    </label>
                    <input
                      type="text"
                      value={editForm.school}
                      onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>

                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      출생년도
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={editForm.birthYear}
                      onChange={(e) => setEditForm({ ...editForm, birthYear: e.target.value })}
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editForm.name || !editForm.phoneNumber}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
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
