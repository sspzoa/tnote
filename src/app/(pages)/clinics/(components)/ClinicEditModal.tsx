"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { DayOfWeekPicker } from "@/shared/components/ui/dayOfWeekPicker";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { selectedClinicAtom } from "../(atoms)/useClinicsStore";
import { clinicNameAtom, endDateAtom, operatingDaysAtom, startDateAtom } from "../(atoms)/useFormStore";
import { showEditModalAtom } from "../(atoms)/useModalStore";
import { useClinicUpdate } from "../(hooks)/useClinicUpdate";

export default function ClinicEditModal() {
  const [isOpen, setIsOpen] = useAtom(showEditModalAtom);
  const [selectedClinic] = useAtom(selectedClinicAtom);
  const [clinicName, setClinicName] = useAtom(clinicNameAtom);
  const [operatingDays, setOperatingDays] = useAtom(operatingDaysAtom);
  const [startDate, setStartDate] = useAtom(startDateAtom);
  const [endDate, setEndDate] = useAtom(endDateAtom);
  const { updateClinic, isUpdating } = useClinicUpdate();
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedClinic || !clinicName.trim()) {
      toast.info("클리닉 이름을 입력해 주세요.");
      return;
    }

    if (operatingDays.length === 0) {
      toast.info("운영 요일을 선택해 주세요.");
      return;
    }

    if (!startDate || !endDate) {
      toast.info("시작 날짜와 종료 날짜를 입력해 주세요.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.info("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
      return;
    }

    try {
      await updateClinic({
        clinicId: selectedClinic.id,
        name: clinicName,
        operatingDays: operatingDays,
        startDate,
        endDate,
      });
      toast.success("클리닉이 수정되었습니다.");
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "클리닉 수정에 실패했습니다.");
    }
  };

  if (!selectedClinic) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="클리닉 수정"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handleEdit}
            disabled={isUpdating || !clinicName.trim() || operatingDays.length === 0 || !startDate || !endDate}
            className="flex-1">
            {isUpdating ? "저장 중..." : "저장"}
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-500">
        <FormInput label="클리닉 이름" required value={clinicName} onChange={(e) => setClinicName(e.target.value)} />

        <DayOfWeekPicker label="운영 요일" required selectedDays={operatingDays} onChange={setOperatingDays} />

        <div className="grid grid-cols-2 gap-spacing-400">
          <FormInput
            label="시작 날짜"
            required
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <FormInput
            label="종료 날짜"
            required
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
