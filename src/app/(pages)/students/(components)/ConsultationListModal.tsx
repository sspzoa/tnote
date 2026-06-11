import { useAtom, useAtomValue } from "jotai";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
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
          <div className="max-h-96 divide-y divide-border overflow-y-auto rounded-xl border border-border">
            {(consultations as ConsultationWithCreator[]).map((log) => {
              const createdAt = new Date(log.created_at);
              const dateStr = formatLocaleDateKorean(createdAt);
              const timeStr = formatLocaleTimeKorean(createdAt);

              return (
                <button
                  type="button"
                  key={log.id}
                  onClick={() => setViewingConsultation(log)}
                  className="flex w-full items-start px-4 py-3.5 text-left transition-colors hover:bg-muted/40">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-semibold text-foreground text-sm">{log.title}</span>
                    <span className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
                      {log.creator?.name && (
                        <>
                          <span className="font-medium text-foreground/70">{log.creator.name}</span>
                          <span className="text-muted-foreground/40">·</span>
                        </>
                      )}
                      <span className="tabular-nums">{dateStr}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="tabular-nums">{timeStr}</span>
                    </span>
                    {log.content && <p className="mt-1 line-clamp-1 text-muted-foreground/80 text-sm">{log.content}</p>}
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
