/**
 * Shared "tone" → soft-well classes for the colorful Toss primitives (StatCard / SectionCard / IconBadge).
 * Feature tones are desaturated chrome accents (NOT the tags-only --solid-* palette). Semantic tones reuse
 * the soft semantic tokens. Background is always a soft tint; text is the solid hue for AA contrast.
 */
export type FeatureTone =
  | "primary"
  | "calendar"
  | "messages"
  | "retakes"
  | "assignments"
  | "students"
  | "courses"
  | "clinics"
  | "admins"
  | "success"
  | "warning"
  | "destructive"
  | "neutral";

export const toneWell: Record<FeatureTone, string> = {
  primary: "bg-primary-soft text-primary",
  calendar: "bg-feature-calendar-soft text-feature-calendar",
  messages: "bg-feature-messages-soft text-feature-messages",
  retakes: "bg-feature-retakes-soft text-feature-retakes",
  assignments: "bg-feature-assignments-soft text-feature-assignments",
  students: "bg-feature-students-soft text-feature-students",
  courses: "bg-feature-courses-soft text-feature-courses",
  clinics: "bg-feature-clinics-soft text-feature-clinics",
  admins: "bg-feature-admins-soft text-feature-admins",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning-foreground",
  destructive: "bg-destructive-soft text-destructive",
  neutral: "bg-muted text-muted-foreground",
};
