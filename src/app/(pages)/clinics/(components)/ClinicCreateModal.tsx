"use client";

import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { DayOfWeekPicker } from "@/shared/components/ui/dayOfWeekPicker";
import { FormInput } from "@/shared/components/ui/formInput";
import { Modal } from "@/shared/components/ui/modal";
import { useToast } from "@/shared/hooks/useToast";
import { clinicNameAtom, endDateAtom, operatingDaysAtom, startDateAtom } from "../(atoms)/useFormStore";
import { showCreateModalAtom } from "../(atoms)/useModalStore";
import { useClinicCreate } from "../(hooks)/useClinicCreate";

export default function ClinicCreateModal() {
  const [isOpen, setIsOpen] = useAtom(showCreateModalAtom);
  const [clinicName, setClinicName] = useAtom(clinicNameAtom);
  const [operatingDays, setOperatingDays] = useAtom(operatingDaysAtom);
  const [startDate, setStartDate] = useAtom(startDateAtom);
  const [endDate, setEndDate] = useAtom(endDateAtom);
  const { createClinic, isCreating } = useClinicCreate();
  const toast = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setClinicName("");
    setOperatingDays([1, 2, 3, 4, 5]);
    setStartDate("");
    setEndDate("");
  };

  const handleCreate = async () => {
    if (!clinicName.trim()) {
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
      await createClinic({
        name: clinicName,
        operatingDays: operatingDays,
        startDate,
        endDate,
      });
      toast.success("클리닉이 생성되었습니다.");
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "클리닉 생성에 실패했습니다.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="클리닉 생성"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !clinicName.trim() || operatingDays.length === 0 || !startDate || !endDate}
            className="flex-1">
            {isCreating ? "생성 중..." : "생성"}
          </Button>
        </>
      }>
      <div className="flex flex-col gap-spacing-500">
        <FormInput
          label="클리닉 이름"
          required
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          placeholder="ex. 수학 클리닉"
        />

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
