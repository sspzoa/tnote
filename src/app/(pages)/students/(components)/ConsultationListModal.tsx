import { useAtom, useAtomValue } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import type { ConsultationLog } from "@/shared/types";
import { consultationFormAtom, selectedConsultationAtom } from "../(atoms)/useConsultationStore";
import {
  showAddConsultationModalAtom,
  showConsultationModalAtom,
  showEditConsultationModalAtom,
} from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useConsultations } from "../(hooks)/useConsultations";

export default function ConsultationListModal() {
  const [showModal, setShowModal] = useAtom(showConsultationModalAtom);
  const selectedStudent = useAtomValue(selectedStudentAtom);
  const [, setShowAddModal] = useAtom(showAddConsultationModalAtom);
  const [, setShowEditModal] = useAtom(showEditConsultationModalAtom);
  const [, setSelectedConsultation] = useAtom(selectedConsultationAtom);
  const [, setConsultationForm] = useAtom(consultationFormAtom);
  const { consultations, isLoading } = useConsultations(selectedStudent?.id || null);

  if (!selectedStudent) return null;

  const openEditConsultationModal = (consultation: ConsultationLog) => {
    setSelectedConsultation(consultation);
    setConsultationForm({
      date: consultation.consultation_date,
      title: consultation.title,
      content: consultation.content,
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setConsultationForm({ date: new Date().toISOString().split("T")[0], title: "", content: "" });
    setShowAddModal(true);
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title={`${selectedStudent.name} - 상담일지`}
      subtitle="학생의 상담 기록을 관리합니다"
      maxWidth="xl"
      footer={
        <>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
            닫기
          </Button>
          <Button onClick={openAddModal} className="flex-1">
            + 상담일지 추가
          </Button>
        </>
      }>
      {isLoading ? (
        <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
      ) : consultations.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="text-body text-content-standard-tertiary">상담일지가 없습니다.</p>
          <button
            onClick={openAddModal}
            className="mt-spacing-500 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            첫 상담일지 작성
          </button>
        </div>
      ) : (
        <div className="space-y-spacing-300">
          {consultations.map((log) => (
            <div
              key={log.id}
              onClick={() => openEditConsultationModal(log)}
              className="cursor-pointer rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary p-spacing-400 transition-colors hover:bg-components-interactive-hover">
              <div className="flex items-start justify-between gap-spacing-300">
                <div className="flex-1">
                  <div className="mb-spacing-100 flex items-center gap-spacing-300">
                    <span className="rounded-radius-200 bg-solid-translucent-blue px-spacing-300 py-spacing-100 font-semibold text-footnote text-solid-blue">
                      {log.consultation_date}
                    </span>
                  </div>
                  <h3 className="font-medium text-body text-content-standard-primary">{log.title}</h3>
                </div>
                <svg
                  className="h-5 w-5 flex-shrink-0 text-content-standard-tertiary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
