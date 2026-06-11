"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { History, UserX } from "lucide-react";
import { useMemo } from "react";
import ErrorComponent from "@/shared/components/common/ErrorComponent";
import { PageShell } from "@/shared/components/common/PageShell";
import { Button } from "@/shared/components/ui/button";
import { CollectionView } from "@/shared/components/ui/collectionView";
import { useConfirm } from "@/shared/components/ui/confirmDialog";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { useToast } from "@/shared/hooks/useToast";
import { getTodayKST } from "@/shared/lib/utils/date";
import { getErrorMessage } from "@/shared/lib/utils/error";
import { type Clinic, selectedClinicAtom, showEndedClinicsAtom } from "./(atoms)/useClinicsStore";
import {
  clinicNameAtom,
  endDateAtom,
  operatingDaysAtom,
  selectedDateAtom,
  startDateAtom,
} from "./(atoms)/useFormStore";
import {
  showAttendanceModalAtom,
  showCreateModalAtom,
  showEditModalAtom,
  showHistoryPanelAtom,
  showRequiredAbsentPanelAtom,
} from "./(atoms)/useModalStore";
import AttendanceModal from "./(components)/AttendanceModal";
import ClinicCreateModal from "./(components)/ClinicCreateModal";
import ClinicEditModal from "./(components)/ClinicEditModal";
import ClinicFilters from "./(components)/ClinicFilters";
import ClinicHistoryPanel from "./(components)/ClinicHistoryPanel";
import ClinicList from "./(components)/ClinicList";
import RequiredAbsentPanel from "./(components)/RequiredAbsentPanel";
import { useClinicDelete } from "./(hooks)/useClinicDelete";
import { useClinics } from "./(hooks)/useClinics";
import { useRecentAttendance } from "./(hooks)/useRecentAttendance";
import { useRequiredAbsent } from "./(hooks)/useRequiredAbsent";

export default function ClinicsPage() {
  const { clinics, isLoading, error } = useClinics();
  const { deleteClinic } = useClinicDelete();
  const { recentAttendance, isLoading: historyLoading } = useRecentAttendance();
  const { requiredAbsent, voluntaryAttendance, isLoading: requiredAbsentLoading } = useRequiredAbsent();
  const showEndedClinics = useAtomValue(showEndedClinicsAtom);
  const toast = useToast();
  const confirm = useConfirm();

  const setShowCreateModal = useSetAtom(showCreateModalAtom);
  const setShowEditModal = useSetAtom(showEditModalAtom);
  const setShowAttendanceModal = useSetAtom(showAttendanceModalAtom);
  const setShowHistoryPanel = useSetAtom(showHistoryPanelAtom);
  const showHistoryPanel = useAtomValue(showHistoryPanelAtom);
  const setShowRequiredAbsentPanel = useSetAtom(showRequiredAbsentPanelAtom);
  const showRequiredAbsentPanel = useAtomValue(showRequiredAbsentPanelAtom);
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

  const actions = (
    <>
      <Button variant="secondary" size="sm" onClick={() => setShowRequiredAbsentPanel(true)}>
        <UserX className="size-4" />
        <span className="hidden sm:inline">필참 결석</span>
        {requiredAbsent.length > 0 && (
          <span className="rounded-full bg-destructive px-1.5 text-destructive-foreground text-xs tabular-nums">
            {requiredAbsent.length}
          </span>
        )}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setShowHistoryPanel(true)}>
        <History className="size-4" />
        <span className="hidden md:inline">최근 출석</span>
        {recentAttendance.length > 0 && (
          <span className="rounded-full bg-primary px-1.5 text-primary-foreground text-xs tabular-nums">
            {recentAttendance.length}
          </span>
        )}
      </Button>
      <Button size="sm" onClick={() => setShowCreateModal(true)}>
        + 클리닉 생성
      </Button>
    </>
  );

  if (error) {
    return (
      <PageShell
        title="클리닉 관리"
        subtitle={`전체 ${clinics.length}개 클리닉 (${filteredClinics.length}개 표시)`}
        actions={actions}>
        <ErrorComponent errorMessage="클리닉 목록을 불러오는데 실패했습니다." />
      </PageShell>
    );
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
    const ok = await confirm({
      title: "클리닉 삭제",
      message: `"${clinic.name}" 클리닉을 삭제하시겠습니까?`,
      description: "출석 기록도 함께 삭제됩니다.",
      variant: "danger",
      confirmLabel: "삭제",
    });
    if (!ok) return;

    try {
      await deleteClinic(clinic.id);
      toast.success("클리닉이 삭제되었습니다.");
    } catch (error) {
      toast.error(getErrorMessage(error, "클리닉 삭제에 실패했습니다."));
    }
  };

  const handleAttendance = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setSelectedDate(getTodayKST());
    setShowAttendanceModal(true);
  };

  const emptyNode =
    clinics.length === 0 ? (
      <EmptyState
        tone="clinics"
        message="클리닉이 없습니다."
        subtitle="첫 클리닉을 만들어 보세요."
        actionLabel="첫 클리닉 만들기"
        onAction={() => setShowCreateModal(true)}
      />
    ) : (
      <EmptyState tone="clinics" message="조건에 맞는 결과가 없어요" subtitle="필터를 조정해 보세요." />
    );

  return (
    <PageShell
      title="클리닉 관리"
      subtitle={`전체 ${clinics.length}개 클리닉 (${filteredClinics.length}개 표시)`}
      actions={actions}>
      <CollectionView filters={<ClinicFilters />}>
        <ClinicList
          clinics={filteredClinics}
          isLoading={isLoading}
          empty={emptyNode}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAttendance={handleAttendance}
        />
      </CollectionView>

      <ClinicCreateModal />
      <ClinicEditModal />
      <AttendanceModal />

      <ClinicHistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        attendance={recentAttendance}
        isLoading={historyLoading}
      />

      <RequiredAbsentPanel
        isOpen={showRequiredAbsentPanel}
        onClose={() => setShowRequiredAbsentPanel(false)}
        data={requiredAbsent}
        voluntaryAttendance={voluntaryAttendance}
        isLoading={requiredAbsentLoading}
      />
    </PageShell>
  );
}
