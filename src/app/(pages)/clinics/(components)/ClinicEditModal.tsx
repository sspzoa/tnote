"use client";

import { useAtom } from "jotai";
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

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const handleClose = () => {
    setIsOpen(false);
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

    try {
      await updateClinic({
        clinicId: selectedClinic.id,
        name: clinicName,
        operatingDays: operatingDays,
        startDate,
        endDate,
      });
      alert("클리닉이 수정되었습니다.");
      handleClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "클리닉 수정에 실패했습니다.");
    }
  };

  const toggleDay = (index: number) => {
    const newDays = operatingDays.includes(index)
      ? operatingDays.filter((d) => d !== index)
      : [...operatingDays, index].sort();
    setOperatingDays(newDays);
  };

  if (!isOpen || !selectedClinic) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-solid-black/50 p-spacing-400"
      onClick={handleClose}>
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
                  onClick={() => toggleDay(index)}
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
            onClick={handleClose}
            className="flex-1 rounded-radius-300 bg-components-fill-standard-secondary px-spacing-500 py-spacing-300 font-semibold text-body text-content-standard-primary transition-colors hover:bg-components-interactive-hover">
            취소
          </button>
          <button
            onClick={handleEdit}
            disabled={isUpdating || !clinicName.trim() || operatingDays.length === 0 || !startDate || !endDate}
            className="flex-1 rounded-radius-300 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-body text-solid-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {isUpdating ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
