import { atom } from "jotai";
import { createWorkflowModalAtoms } from "@/shared/lib/workflow";

const {
  showPostponeModalAtom,
  showCompleteModalAtom,
  showHistoryModalAtom,
  showStudentModalAtom,
  showAssignModalAtom,
  showManagementStatusModalAtom,
  showEditDateModalAtom,
  showManagementStatusSettingsModalAtom,
  selectedStudentIdAtom,
} = createWorkflowModalAtoms();

export {
  showPostponeModalAtom,
  showCompleteModalAtom,
  showHistoryModalAtom,
  showStudentModalAtom,
  showAssignModalAtom,
  showManagementStatusModalAtom,
  showEditDateModalAtom,
  showManagementStatusSettingsModalAtom,
  selectedStudentIdAtom,
};

export const showAbsentModalAtom = atom(false);
