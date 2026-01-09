"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Clinic {
  id: string;
  name: string;
  operating_days: number[];
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: string;
  name: string;
  phone_number: string;
  school?: string;
}

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  note?: string;
  student: Student;
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinicName, setClinicName] = useState("");
  const [operatingDays, setOperatingDays] = useState<number[]>([1, 2, 3, 4, 5]); // 기본값: 월-금
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Attendance modal state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState("");

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    fetchClinics();
    fetchAllStudents();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clinics");
      const result = await response.json();
      setClinics(result.data || []);
    } catch (error) {
      console.error("Failed to fetch clinics:", error);
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

  const fetchAttendance = async (clinicId: string, date: string) => {
    try {
      const response = await fetch(`/api/clinics/${clinicId}/attendance?date=${date}`);
      const result = await response.json();

      // Set selected student IDs from existing records
      setSelectedStudentIds(result.data.map((record: AttendanceRecord) => record.student.id));
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    }
  };

  const handleCreate = async () => {
    if (!clinicName.trim()) {
      alert("클리닉 이름을 입력해주세요.");
      return;
    }

    if (operatingDays.length === 0) {
      alert("운영 요일을 선택해주세요.");
      return;
    }

    if (!startDate || !endDate) {
      alert("시작 날짜와 종료 날짜를 입력해주세요.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clinicName,
          operatingDays: operatingDays,
          startDate,
          endDate,
        }),
      });

      if (response.ok) {
        alert("클리닉이 생성되었습니다.");
        setShowCreateModal(false);
        setClinicName("");
        setOperatingDays([1, 2, 3, 4, 5]);
        setStartDate("");
        setEndDate("");
        fetchClinics();
      } else {
        const result = await response.json();
        alert(result.error || "클리닉 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Create error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedClinic || !clinicName.trim()) {
      alert("클리닉 이름을 입력해주세요.");
      return;
    }

    if (operatingDays.length === 0) {
      alert("운영 요일을 선택해주세요.");
      return;
    }

    if (!startDate || !endDate) {
      alert("시작 날짜와 종료 날짜를 입력해주세요.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/clinics/${selectedClinic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clinicName,
          operatingDays: operatingDays,
          startDate,
          endDate,
        }),
      });

      if (response.ok) {
        alert("클리닉이 수정되었습니다.");
        setShowEditModal(false);
        fetchClinics();
      } else {
        const result = await response.json();
        alert(result.error || "클리닉 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clinic: Clinic) => {
    if (!confirm(`"${clinic.name}" 클리닉을 삭제하시겠습니까?\n출석 기록도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/clinics/${clinic.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("클리닉이 삭제되었습니다.");
        fetchClinics();
      } else {
        alert("클리닉 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedClinic || !selectedDate) {
      alert("날짜를 선택해주세요.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/clinics/${selectedClinic.id}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          date: selectedDate,
        }),
      });

      if (response.ok) {
        alert("출석이 저장되었습니다.");
        fetchAttendance(selectedClinic.id, selectedDate);
      } else {
        const result = await response.json();
        alert(result.error || "출석 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Attendance save error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setClinicName(clinic.name);
    setOperatingDays(clinic.operating_days);
    setStartDate(clinic.start_date || "");
    setEndDate(clinic.end_date || "");
    setShowEditModal(true);
  };

  const openAttendanceModal = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setSelectedDate(new Date().toISOString().split("T")[0]); // 오늘 날짜
    setAttendanceSearchQuery(""); // 검색어 초기화
    setShowAttendanceModal(true);
  };

  useEffect(() => {
    if (showAttendanceModal && selectedClinic && selectedDate) {
      fetchAttendance(selectedClinic.id, selectedDate);
    }
  }, [selectedDate, showAttendanceModal]);

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const filteredAttendanceStudents = allStudents.filter((student) =>
    student.name.toLowerCase().includes(attendanceSearchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen p-spacing-600 md:p-spacing-800">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-spacing-700">
          <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
            ← 홈으로 돌아가기
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">클리닉 관리</h1>
              <p className="text-body text-content-standard-secondary">전체 {clinics.length}개 클리닉</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
              + 클리닉 생성
            </button>
          </div>
        </div>

        {/* 클리닉 목록 */}
        {loading ? (
          <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
        ) : clinics.length === 0 ? (
          <div className="py-spacing-900 text-center">
            <p className="text-body text-content-standard-tertiary">클리닉이 없습니다.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-spacing-500 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
              첫 클리닉 만들기
            </button>
          </div>
        ) : (
          <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
            <table className="w-full rounded-radius-400">
              <thead className="bg-components-fill-standard-secondary">
                <tr>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    클리닉명
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    운영 요일
                  </th>
                  <th className="px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary">
                    관리
                  </th>
                  <th className="w-24 px-spacing-500 py-spacing-400 text-left font-semibold text-body text-content-standard-primary"></th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((clinic) => (
                  <tr
                    key={clinic.id}
                    className="border-line-divider border-t transition-colors hover:bg-components-interactive-hover">
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="font-medium text-body text-content-standard-primary">{clinic.name}</div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <div className="flex gap-spacing-100">
                        {clinic.operating_days.sort().map((day) => (
                          <span
                            key={day}
                            className="rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-100 font-medium text-footnote text-solid-blue">
                            {dayNames[day]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-spacing-500 py-spacing-400">
                      <button
                        onClick={() => openAttendanceModal(clinic)}
                        className="rounded-radius-300 bg-core-accent px-spacing-400 py-spacing-200 font-medium text-footnote text-solid-white transition-opacity hover:opacity-90">
                        출석 관리
                      </button>
                    </td>
                    <td className="relative px-spacing-500 py-spacing-400">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === clinic.id ? null : clinic.id)}
                        className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
                        <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === clinic.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[120px] rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200 shadow-lg">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                openEditModal(clinic);
                              }}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                              수정
                            </button>
                            <div className="my-spacing-100 border-line-divider border-t" />
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDelete(clinic);
                              }}
                              className="w-full px-spacing-400 py-spacing-200 text-left text-body text-core-status-negative transition-colors hover:bg-solid-translucent-red">
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowCreateModal(false)}>
            <div
              className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-heading">클리닉 생성</h2>
              </div>

              <div className="space-y-spacing-500 p-spacing-600">
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    클리닉 이름 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="ex. 수학 클리닉"
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                  />
                </div>

                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    운영 요일 <span className="text-core-status-negative">*</span>
                  </label>
                  <div className="grid grid-cols-7 gap-spacing-200">
                    {dayNames.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const newDays = operatingDays.includes(index)
                            ? operatingDays.filter((d) => d !== index)
                            : [...operatingDays, index].sort();
                          setOperatingDays(newDays);
                        }}
                        className={`rounded-radius-300 py-spacing-200 font-medium text-footnote transition-colors ${
                          operatingDays.includes(index)
                            ? "bg-core-accent text-solid-white"
                            : "border border-line-outline bg-components-fill-standard-secondary text-content-standard-secondary"
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-spacing-400">
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      시작 날짜 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      종료 날짜 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setClinicName("");
                    setOperatingDays([1, 2, 3, 4, 5]);
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !clinicName.trim() || operatingDays.length === 0 || !startDate || !endDate}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? "생성 중..." : "생성"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && selectedClinic && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowEditModal(false)}>
            <div
              className="w-full max-w-md rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="font-bold text-content-standard-primary text-heading">클리닉 수정</h2>
              </div>

              <div className="space-y-spacing-500 p-spacing-600">
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    클리닉 이름 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                  />
                </div>

                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    운영 요일 <span className="text-core-status-negative">*</span>
                  </label>
                  <div className="grid grid-cols-7 gap-spacing-200">
                    {dayNames.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const newDays = operatingDays.includes(index)
                            ? operatingDays.filter((d) => d !== index)
                            : [...operatingDays, index].sort();
                          setOperatingDays(newDays);
                        }}
                        className={`rounded-radius-300 py-spacing-200 font-medium text-footnote transition-colors ${
                          operatingDays.includes(index)
                            ? "bg-core-accent text-solid-white"
                            : "border border-line-outline bg-components-fill-standard-secondary text-content-standard-secondary"
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-spacing-400">
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      시작 날짜 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                    />
                  </div>
                  <div>
                    <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                      종료 날짜 <span className="text-core-status-negative">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
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
                  onClick={handleEdit}
                  disabled={saving || !clinicName.trim() || operatingDays.length === 0 || !startDate || !endDate}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 출석 관리 모달 */}
        {showAttendanceModal && selectedClinic && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
            onClick={() => setShowAttendanceModal(false)}>
            <div
              className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-radius-600 border border-line-outline bg-components-fill-standard-primary"
              onClick={(e) => e.stopPropagation()}>
              <div className="border-line-divider border-b px-spacing-600 py-spacing-500">
                <h2 className="mb-spacing-100 font-bold text-content-standard-primary text-heading">출석 관리</h2>
                <p className="text-content-standard-secondary text-label">{selectedClinic.name}</p>
              </div>

              <div className="flex-1 space-y-spacing-500 overflow-y-auto p-spacing-600">
                <div>
                  <label className="mb-spacing-200 block font-semibold text-content-standard-primary text-label">
                    날짜 선택 <span className="text-core-status-negative">*</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary transition-all focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                  />
                </div>

                <div>
                  <h3 className="mb-spacing-300 font-bold text-body text-content-standard-primary">
                    참석 학생 선택 ({allStudents.length}명)
                  </h3>
                  {allStudents.length === 0 ? (
                    <p className="text-content-standard-tertiary text-label">학생이 없습니다.</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="이름 검색..."
                        value={attendanceSearchQuery}
                        onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                        className="mb-spacing-300 w-full rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-200 text-content-standard-primary text-label transition-all placeholder:text-content-standard-tertiary focus:border-core-accent focus:outline-none focus:ring-2 focus:ring-core-accent-translucent"
                      />
                      {filteredAttendanceStudents.length === 0 ? (
                        <p className="text-content-standard-tertiary text-label">검색 결과가 없습니다.</p>
                      ) : (
                        <div className="rounded-radius-300 border border-line-outline bg-components-fill-standard-secondary">
                          <div className="max-h-80 overflow-y-auto">
                            {filteredAttendanceStudents.map((student) => (
                              <label
                                key={student.id}
                                className="flex cursor-pointer items-center gap-spacing-300 border-line-divider border-b px-spacing-400 py-spacing-300 transition-colors last:border-b-0 hover:bg-components-interactive-hover">
                                <input
                                  type="checkbox"
                                  checked={selectedStudentIds.includes(student.id)}
                                  onChange={() => toggleStudentSelection(student.id)}
                                  className="h-4 w-4 cursor-pointer rounded border-line-outline text-core-accent focus:ring-2 focus:ring-core-accent-translucent"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-body text-content-standard-primary">
                                    {student.name}
                                  </div>
                                  <div className="text-content-standard-tertiary text-footnote">
                                    {student.phone_number} {student.school && `· ${student.school}`}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-spacing-300 border-line-divider border-t px-spacing-600 py-spacing-500">
                <button
                  onClick={() => {
                    setShowAttendanceModal(false);
                    setAttendanceSearchQuery("");
                  }}
                  className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
                  취소
                </button>
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving || !selectedDate}
                  className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? "저장 중..." : "출석 저장"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
