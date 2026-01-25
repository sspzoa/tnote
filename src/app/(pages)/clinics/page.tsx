"use client";

import { useSetAtom } from "jotai";
import Container from "@/shared/components/common/Container";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import Header from "@/shared/components/common/Header";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getTodayKST } from "@/shared/lib/utils/date";
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
    setSelectedDate(getTodayKST());
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
        <div className="rounded-radius-400 border border-line-outline bg-components-fill-standard-primary">
          <table className="w-full">
            <thead className="bg-components-fill-standard-secondary">
              <tr>
                <th className="px-spacing-500 py-spacing-400 text-left">
                  <Skeleton className="h-6 w-16" />
                </th>
                <th className="px-spacing-500 py-spacing-400 text-left">
                  <Skeleton className="h-6 w-16" />
                </th>
                <th className="px-spacing-500 py-spacing-400 text-left">
                  <Skeleton className="h-6 w-10" />
                </th>
                <th className="w-24 px-spacing-500 py-spacing-400" />
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-line-divider border-t">
                  <td className="px-spacing-500 py-spacing-400">
                    <Skeleton className="h-6 w-20" />
                  </td>
                  <td className="px-spacing-500 py-spacing-400">
                    <div className="flex gap-spacing-100">
                      <Skeleton className="h-7 w-6 rounded-radius-200" />
                      <Skeleton className="h-7 w-6 rounded-radius-200" />
                      <Skeleton className="h-7 w-6 rounded-radius-200" />
                    </div>
                  </td>
                  <td className="px-spacing-500 py-spacing-400">
                    <Skeleton className="h-9 w-20 rounded-radius-300" />
                  </td>
                  <td className="px-spacing-500 py-spacing-400">
                    <Skeleton className="ml-auto h-9 w-11 rounded-radius-200" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
