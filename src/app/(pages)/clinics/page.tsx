"use client";

import { useSetAtom } from "jotai";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import LoadingComponent from "@/shared/components/common/LoadingComponent";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
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
      <Header
        title="클리닉 관리"
        subtitle={`전체 ${clinics.length}개 클리닉`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={<Button onClick={() => setShowCreateModal(true)}>+ 클리닉 생성</Button>}
      />

      {isLoading ? (
        <LoadingComponent />
      ) : clinics.length === 0 ? (
        <EmptyState
          message="클리닉이 없습니다."
          actionLabel="첫 클리닉 만들기"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <ClinicList clinics={clinics} onEdit={handleEdit} onDelete={handleDelete} onAttendance={handleAttendance} />
      )}

      <ClinicCreateModal />
      <ClinicEditModal />
      <AttendanceModal />
    </Container>
  );
}
