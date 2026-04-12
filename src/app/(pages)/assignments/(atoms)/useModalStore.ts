import { createWorkflowModalAtoms } from "@/shared/lib/workflow";

const {
  showPostponeModalAtom,
  showCompleteModalAtom,
  showHistoryModalAtom,
  showStudentModalAtom,
  showAssignModalAtom,
  showEditDateModalAtom,
  selectedStudentIdAtom,
} = createWorkflowModalAtoms();

export {
  showPostponeModalAtom,
  showCompleteModalAtom,
  showHistoryModalAtom,
  showStudentModalAtom,
  showAssignModalAtom,
  showEditDateModalAtom,
  selectedStudentIdAtom,
};
