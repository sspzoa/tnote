import { useAtom } from "jotai";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { formatLocaleDateKorean } from "@/shared/lib/utils/date";
import { consultationFormAtom, selectedConsultationAtom } from "../(atoms)/useConsultationStore";
import { showEditConsultationModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";

interface ConsultationDetailData {
  id: string;
  student_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  student?: {
    id: string;
    name: string;
    phone_number: string;
    school: string | null;
  };
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
  const [, setSelectedStudent] = useAtom(selectedStudentAtom);

  const handleEdit = () => {
    if (!consultation) return;
    if (consultation.student) {
      setSelectedStudent({
        id: consultation.student.id,
        name: consultation.student.name,
        phone_number: consultation.student.phone_number,
        school: consultation.student.school,
        parent_phone_number: null,
        branch: null,
        birth_year: null,
        required_clinic_weekdays: null,
      });
    }
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

  const authorName = consultation?.creator?.name ?? studentName;
  const createdLabel = consultation?.created_at ? formatLocaleDateKorean(consultation.created_at) : "";
  const updatedLabel =
    consultation?.updated_at && consultation.updated_at !== consultation.created_at
      ? formatLocaleDateKorean(consultation.updated_at)
      : null;

  return (
    <Modal
      isOpen={!!consultation}
      onClose={onClose}
      title={consultation?.title || ""}
      subtitle={studentName}
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
      <div className="flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-semibold text-foreground text-sm">{authorName}</span>
          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-muted-foreground text-xs">
            <span className="tabular-nums">{createdLabel}</span>
            {updatedLabel && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="tabular-nums">{updatedLabel} 수정됨</span>
              </>
            )}
          </span>
        </div>
        <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3.5 text-[15px] text-foreground leading-relaxed">
          {consultation?.content}
        </p>
      </div>
    </Modal>
  );
}
