"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { SkeletonTable } from "@/shared/components/ui/skeleton";
import { getTodayKST } from "@/shared/lib/utils/date";
import { type Clinic, selectedClinicAtom, showEndedClinicsAtom } from "./(atoms)/useClinicsStore";
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
import ClinicFilters from "./(components)/ClinicFilters";
import ClinicList from "./(components)/ClinicList";
import { useClinicDelete } from "./(hooks)/useClinicDelete";
import { useClinics } from "./(hooks)/useClinics";

export default function ClinicsPage() {
  const { clinics, isLoading, error } = useClinics();
  const { deleteClinic } = useClinicDelete();
  const showEndedClinics = useAtomValue(showEndedClinicsAtom);

  const setShowCreateModal = useSetAtom(showCreateModalAtom);
  const setShowEditModal = useSetAtom(showEditModalAtom);
  const setShowAttendanceModal = useSetAtom(showAttendanceModalAtom);
  const setSelectedClinic = useSetAtom(selectedClinicAtom);
  const setClinicName = useSetAtom(clinicNameAtom);
  const setOperatingDays = useSetAtom(operatingDaysAtom);
  const setStartDate = useSetAtom(startDateAtom);
  const setEndDate = useSetAtom(endDateAtom);
  const setSelectedDate = useSetAtom(selectedDateAtom);

  const filteredClinics = useMemo(() => {
    if (showEndedClinics) {
      return clinics;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return clinics.filter((clinic) => {
      if (!clinic.end_date) {
        return true;
      }
      const endDate = new Date(clinic.end_date);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= today;
    });
  }, [clinics, showEndedClinics]);

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
    setSelectedDate(getTodayKST());
    setShowAttendanceModal(true);
  };

  return (
    <Container>
      <Header
        title="클리닉 관리"
        subtitle={`전체 ${clinics.length}개 클리닉 (${filteredClinics.length}개 표시)`}
        backLink={{ href: "/", label: "홈으로 돌아가기" }}
        action={<Button onClick={() => setShowCreateModal(true)}>+ 클리닉 생성</Button>}
      />

      <div className="flex flex-col gap-spacing-600">
        <ClinicFilters />

        {isLoading ? (
          <SkeletonTable
            rows={5}
            columns={[
              "w-20",
              { width: "w-16", badges: ["w-6", "w-6", "w-6"] },
              { width: "w-20", buttons: ["w-20"] },
              "action",
            ]}
          />
        ) : filteredClinics.length === 0 ? (
          <EmptyState
            message={showEndedClinics ? "클리닉이 없습니다." : "진행 중인 클리닉이 없습니다."}
            actionLabel="첫 클리닉 만들기"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <ClinicList
            clinics={filteredClinics}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAttendance={handleAttendance}
          />
        )}
      </div>

      <ClinicCreateModal />
      <ClinicEditModal />
      <AttendanceModal />
    </Container>
  );
}
