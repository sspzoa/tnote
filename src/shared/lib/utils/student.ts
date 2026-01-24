import type { SupabaseClient } from "@supabase/supabase-js";

export const validateStudents = async (
  supabase: SupabaseClient,
  workspace: string,
  studentIds: string[],
): Promise<{ valid: boolean; students: { id: string }[] | null; error: string | null }> => {
  const { data: students } = await supabase
    .from("Users")
    .select("id")
    .eq("role", "student")
    .eq("workspace", workspace)
    .in("id", studentIds);

  if (!students || students.length !== studentIds.length) {
    return { valid: false, students: null, error: "일부 학생을 찾을 수 없습니다." };
  }

  return { valid: true, students, error: null };
};

export const getAge = (birthYear: number | null | undefined): number => {
  if (!birthYear) return 0;
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear + 1;
};

export const getGrade = (birthYear: number | null | undefined): string | null => {
  if (!birthYear) return null;
  const age = getAge(birthYear);
  const gradeNumber = age - 7;

  if (gradeNumber <= 0) return "미취학";
  if (gradeNumber <= 6) return `초${gradeNumber}`;
  if (gradeNumber <= 9) return `중${gradeNumber - 6}`;
  if (gradeNumber <= 12) return `고${gradeNumber - 9}`;
  return "졸업";
};
