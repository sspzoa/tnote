"use client";

import { useSetAtom } from "jotai";
import Link from "next/link";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { type Clinic, selectedClinicAtom } from "./(atoms)/useClinicsStore";
import {
  clinicNameAtom,
  endDateAtom,
  operatingDaysAtom,
  selectedDateAtom,
  startDateAtom,
} from "./(atoms)/useFormStore";
import { showAttendanceModalAtom, showCreateModalAtom, showEditModalAtom } from "./(atoms)/useModalStore";
import AttendanceModal from "./(components)/AttendanceModal";
import ClinicCreateModal from "./(components)/ClinicCreateModal";
import ClinicEditModal from "./(components)/ClinicEditModal";
import ClinicList from "./(components)/ClinicList";
import { useClinicDelete } from "./(hooks)/useClinicDelete";
import { useClinics } from "./(hooks)/useClinics";

export default function ClinicsPage() {
  const { clinics, isLoading, error } = useClinics();
  const { deleteClinic } = useClinicDelete();

  const setShowCreateModal = useSetAtom(showCreateModalAtom);
  const setShowEditModal = useSetAtom(showEditModalAtom);
  const setShowAttendanceModal = useSetAtom(showAttendanceModalAtom);
  const setSelectedClinic = useSetAtom(selectedClinicAtom);
  const setClinicName = useSetAtom(clinicNameAtom);
  const setOperatingDays = useSetAtom(operatingDaysAtom);
  const setStartDate = useSetAtom(startDateAtom);
  const setEndDate = useSetAtom(endDateAtom);
  const setSelectedDate = useSetAtom(selectedDateAtom);

  if (error) {
    return <ErrorComponent errorMessage="클리닉 목록을 불러오는데 실패했습니다." />;
  }

  const handleEdit = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setClinicName(clinic.name);
    setOperatingDays(clinic.operating_days);
    setStartDate(clinic.start_date || "");
    setEndDate(clinic.end_date || "");
    setShowEditModal(true);
  };

  const handleDelete = async (clinic: Clinic) => {
    if (!confirm(`"${clinic.name}" 클리닉을 삭제하시겠습니까?\n출석 기록도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      await deleteClinic(clinic.id);
      alert("클리닉이 삭제되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "클리닉 삭제에 실패했습니다.");
    }
  };

  const handleAttendance = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setShowAttendanceModal(true);
  };

  return (
    <Container>
      <Link href="/" className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
        ← 홈으로 돌아가기
      </Link>

      <Header
        title="클리닉 관리"
        subtitle={`전체 ${clinics.length}개 클리닉`}
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            + 클리닉 생성
          </button>
        }
      />

      {isLoading ? (
        <LoadingComponent />
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
        <ClinicList clinics={clinics} onEdit={handleEdit} onDelete={handleDelete} onAttendance={handleAttendance} />
      )}

      <ClinicCreateModal />
      <ClinicEditModal />
      <AttendanceModal />
    </Container>
  );
}
