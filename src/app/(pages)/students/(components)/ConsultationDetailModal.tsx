import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { consultationFormAtom, selectedConsultationAtom } from "../(atoms)/useConsultationStore";
import { showEditConsultationModalAtom } from "../(atoms)/useModalStore";

interface ConsultationDetailData {
  id: string;
  student_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  creator?: {
    id?: string;
    name: string;
  } | null;
}

interface ConsultationDetailModalProps {
  consultation: ConsultationDetailData | null;
  studentName: string;
  onClose: () => void;
}

export default function ConsultationDetailModal({ consultation, studentName, onClose }: ConsultationDetailModalProps) {
  const [, setSelectedConsultation] = useAtom(selectedConsultationAtom);
  const [, setConsultationForm] = useAtom(consultationFormAtom);
  const [, setShowEditModal] = useAtom(showEditConsultationModalAtom);

  const handleEdit = () => {
    if (!consultation) return;
    setSelectedConsultation({
      id: consultation.id,
      student_id: consultation.student_id,
      title: consultation.title,
      content: consultation.content,
      created_at: consultation.created_at,
      updated_at: consultation.updated_at || consultation.created_at,
    });
    setConsultationForm({
      title: consultation.title,
      content: consultation.content,
    });
    onClose();
    setShowEditModal(true);
  };

  return (
    <Modal
      isOpen={!!consultation}
      onClose={onClose}
      title={consultation?.title || ""}
      subtitle={`${studentName} - ${consultation?.created_at ? new Date(consultation.created_at).toLocaleDateString("ko-KR") : ""}${consultation?.creator?.name ? ` (작성자: ${consultation.creator.name})` : ""}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            닫기
          </Button>
          <Button onClick={handleEdit} className="flex-1">
            수정
          </Button>
        </>
      }>
      <div className="whitespace-pre-wrap text-body text-content-standard-primary">{consultation?.content}</div>
    </Modal>
  );
}
