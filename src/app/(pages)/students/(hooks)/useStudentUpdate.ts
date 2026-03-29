import { createMutation } from "@/shared/lib/hooks";
import { QUERY_KEYS } from "@/shared/lib/queryKeys";

interface UpdateStudentData {
  id: string;
  name: string;
  phoneNumber: string;
  parentPhoneNumber?: string | null;
  school?: string | null;
  branch?: string | null;
  birthYear?: number | null;
  requiredClinicWeekdays?: number[] | null;
}

const useUpdate = createMutation<UpdateStudentData>({
  endpoint: (data) => `/api/students/${data.id}`,
  method: "PATCH",
  invalidateKeys: [QUERY_KEYS.students.all],
});

export const useStudentUpdate = () => {
  const { mutate, isPending } = useUpdate();
  return { updateStudent: mutate, isUpdating: isPending };
};
