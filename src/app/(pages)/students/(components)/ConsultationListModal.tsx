import { useAtom, useAtomValue } from "jotai";
import { Plus } from "lucide-react";
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

interface ConsultationWithCreator extends ConsultationLog {
  creator?: {
    id: string;
    name: string;
  } | null;
}

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
      subtitle={`총 ${consultations.length}건의 상담 기록`}
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
            닫기
          </Button>
          <Button onClick={openAddModal} className="flex-1">
            <Plus className="mr-spacing-100 size-4" />
            상담일지 추가
          </Button>
        </>
      }>
      {isLoading ? (
        <div className="py-spacing-900 text-center text-content-standard-tertiary">로딩중...</div>
      ) : consultations.length === 0 ? (
        <div className="py-spacing-900 text-center">
          <p className="mb-spacing-200 text-body text-content-standard-tertiary">상담일지가 없습니다.</p>
          <p className="mb-spacing-500 text-content-standard-quaternary text-footnote">첫 상담일지를 작성해보세요.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-spacing-200 rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 font-semibold text-body text-solid-white transition-opacity hover:opacity-90">
            <Plus className="size-4" />첫 상담일지 작성
          </button>
        </div>
      ) : (
        <div className="max-h-96 divide-y divide-line-divider overflow-y-auto rounded-radius-300 border border-line-outline">
          {(consultations as ConsultationWithCreator[]).map((log) => {
            const createdAt = new Date(log.created_at);
            const timeStr = createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

            return (
              <button
                key={log.id}
                onClick={() => openEditConsultationModal(log)}
                className="w-full px-spacing-500 py-spacing-400 text-left transition-colors hover:bg-components-interactive-hover">
                <div className="mb-spacing-100 flex items-center justify-between">
                  <span className="font-medium text-body text-content-standard-primary">{log.title}</span>
                  <span className="shrink-0 rounded-radius-200 bg-solid-translucent-blue px-spacing-200 py-spacing-50 text-footnote text-solid-blue">
                    {log.consultation_date}
                  </span>
                </div>
                <div className="flex items-center gap-spacing-200 text-content-standard-tertiary text-footnote">
                  <span>{timeStr}</span>
                  {log.creator?.name && (
                    <>
                      <span>·</span>
                      <span>{log.creator.name}</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
