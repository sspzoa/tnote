import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface CreateStudentData {
  name: string;
  phoneNumber: string;
  parentPhoneNumber?: string | null;
  school?: string | null;
  branch?: string | null;
  birthYear?: string | null;
  requiredClinicWeekdays?: number[] | null;
}

const useCreate = createMutation<CreateStudentData>({
  endpoint: "/api/students",
  method: "POST",
  invalidateKeys: [QUERY_KEYS.students.all, QUERY_KEYS.home.stats],
});

export const useStudentCreate = () => {
  const { mutate, isPending } = useCreate();
  return { createStudent: mutate, isCreating: isPending };
};
