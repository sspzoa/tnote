import { useAtom, useAtomValue } from "jotai";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { DateChip } from "@/shared/components/ui/dateChip";
import { EmptyState } from "@/shared/components/ui/emptyState";
import { Modal } from "@/shared/components/ui/modal";
import { formatLocaleDateKorean, formatLocaleTimeKorean } from "@/shared/lib/utils/date";
import type { ConsultationLog } from "@/shared/types";
import { consultationFormAtom } from "../(atoms)/useConsultationStore";
import { showAddConsultationModalAtom, showConsultationModalAtom } from "../(atoms)/useModalStore";
import { selectedStudentAtom } from "../(atoms)/useStudentsStore";
import { useConsultations } from "../(hooks)/useConsultations";
import ConsultationDetailModal from "./ConsultationDetailModal";
import { ConsultationListSkeleton } from "./ConsultationListSkeleton";

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
  const [, setConsultationForm] = useAtom(consultationFormAtom);
  const { consultations, isLoading } = useConsultations(selectedStudent?.id || null);

  const [viewingConsultation, setViewingConsultation] = useState<ConsultationWithCreator | null>(null);

  if (!selectedStudent) return null;

  const openAddModal = () => {
    setConsultationForm({ title: "", content: "" });
    setShowAddModal(true);
  };

  return (
    <>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${selectedStudent.name} - 상담일지`}
        subtitle={`총 ${consultations.length}건의 상담 기록`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              닫기
            </Button>
            <Button onClick={openAddModal} className="flex-1">
              상담일지 추가
            </Button>
          </>
        }>
        {isLoading ? (
          <ConsultationListSkeleton count={4} />
        ) : consultations.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="size-7" />}
            message="상담일지가 없습니다."
            subtitle="첫 상담일지를 작성해보세요."
            actionLabel="첫 상담일지 작성"
            onAction={openAddModal}
          />
        ) : (
          <div className="max-h-96 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {(consultations as ConsultationWithCreator[]).map((log) => {
              const createdAt = new Date(log.created_at);
              const dateStr = formatLocaleDateKorean(createdAt);
              const timeStr = formatLocaleTimeKorean(createdAt);

              return (
                <button
                  key={log.id}
                  onClick={() => setViewingConsultation(log)}
                  className="flex w-full flex-col gap-1 px-5 py-4 text-left transition-colors hover:bg-accent">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">{log.title}</span>
                    <DateChip className="shrink-0">{dateStr}</DateChip>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
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

      <ConsultationDetailModal
        consultation={viewingConsultation}
        studentName={selectedStudent.name}
        onClose={() => setViewingConsultation(null)}
      />
    </>
  );
}
