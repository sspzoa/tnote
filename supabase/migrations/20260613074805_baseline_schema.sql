


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT COALESCE(auth.jwt()->'app_metadata'->>'role', auth.jwt()->'user_metadata'->>'role')::text
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_workspace"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT (COALESCE(auth.jwt()->'app_metadata'->>'workspace', auth.jwt()->'user_metadata'->>'workspace'))::uuid
$$;


ALTER FUNCTION "public"."get_user_workspace"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_or_owner"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT COALESCE(auth.jwt()->'app_metadata'->>'role', auth.jwt()->'user_metadata'->>'role') IN ('owner', 'admin')
$$;


ALTER FUNCTION "public"."is_admin_or_owner"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_student_assignments_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_student_assignments_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."Assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."Assignments" IS 'Independent assignment definitions for courses. Decoupled from exams.';



CREATE TABLE IF NOT EXISTS "public"."ClinicAttendance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "attendance_date" "date" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "did_retake_exam" boolean DEFAULT false NOT NULL,
    "did_homework_check" boolean DEFAULT false NOT NULL,
    "did_qa" boolean DEFAULT false NOT NULL,
    "is_required" boolean DEFAULT false NOT NULL,
    "status" "text" DEFAULT 'attended'::"text" NOT NULL,
    CONSTRAINT "ClinicAttendance_status_check" CHECK (("status" = ANY (ARRAY['attended'::"text", 'absent'::"text"])))
);


ALTER TABLE "public"."ClinicAttendance" OWNER TO "postgres";


COMMENT ON TABLE "public"."ClinicAttendance" IS 'Student attendance records for clinics';



COMMENT ON COLUMN "public"."ClinicAttendance"."did_retake_exam" IS 'Whether student took a retake exam during this clinic session';



COMMENT ON COLUMN "public"."ClinicAttendance"."did_homework_check" IS 'Whether student had homework checked during this clinic session';



COMMENT ON COLUMN "public"."ClinicAttendance"."did_qa" IS 'Whether student participated in Q&A during this clinic session';



COMMENT ON COLUMN "public"."ClinicAttendance"."is_required" IS 'Whether this attendance was on a required clinic day for the student (based on required_clinic_weekdays)';



COMMENT ON COLUMN "public"."ClinicAttendance"."status" IS 'Attendance status: attended (present) or absent (required but did not attend)';



CREATE TABLE IF NOT EXISTS "public"."Clinics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "operating_days" integer[] DEFAULT '{1,2,3,4,5}'::integer[] NOT NULL,
    "workspace" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "start_date" "date",
    "end_date" "date",
    CONSTRAINT "valid_clinic_operating_days" CHECK ((("array_length"("operating_days", 1) > 0) AND ("operating_days" <@ ARRAY[0, 1, 2, 3, 4, 5, 6])))
);


ALTER TABLE "public"."Clinics" OWNER TO "postgres";


COMMENT ON TABLE "public"."Clinics" IS 'Free-attendance clinics with configurable operating days';



COMMENT ON COLUMN "public"."Clinics"."operating_days" IS 'Days clinic is open (0=Sunday, 1=Monday, ..., 6=Saturday)';



COMMENT ON COLUMN "public"."Clinics"."start_date" IS 'Clinic start date for schedule generation';



COMMENT ON COLUMN "public"."Clinics"."end_date" IS 'Clinic end date for schedule generation';



CREATE TABLE IF NOT EXISTS "public"."ConsultationLogs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "workspace" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" DEFAULT '상담 기록'::"text" NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."ConsultationLogs" OWNER TO "postgres";


COMMENT ON TABLE "public"."ConsultationLogs" IS 'Stores consultation logs for students';



COMMENT ON COLUMN "public"."ConsultationLogs"."student_id" IS 'Reference to the student';



COMMENT ON COLUMN "public"."ConsultationLogs"."content" IS 'Consultation notes and content';



COMMENT ON COLUMN "public"."ConsultationLogs"."workspace" IS 'Workspace for multi-tenancy isolation';



COMMENT ON COLUMN "public"."ConsultationLogs"."title" IS 'Title of the consultation log';



COMMENT ON COLUMN "public"."ConsultationLogs"."updated_by" IS 'Reference to the admin who last edited the consultation';



CREATE TABLE IF NOT EXISTS "public"."ConsultationReadReceipts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "consultation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "read_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ConsultationReadReceipts" OWNER TO "postgres";


COMMENT ON TABLE "public"."ConsultationReadReceipts" IS 'Tracks which admin has read which consultation log. Per-user read receipts for consultation notifications.';



COMMENT ON COLUMN "public"."ConsultationReadReceipts"."consultation_id" IS 'Reference to the consultation log';



COMMENT ON COLUMN "public"."ConsultationReadReceipts"."user_id" IS 'Reference to the admin who read the consultation';



COMMENT ON COLUMN "public"."ConsultationReadReceipts"."read_at" IS 'Timestamp when the consultation was read';



CREATE TABLE IF NOT EXISTS "public"."ConsultationTemplates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ConsultationTemplates" OWNER TO "postgres";


COMMENT ON TABLE "public"."ConsultationTemplates" IS 'Saved consultation log templates for quick reuse';



CREATE TABLE IF NOT EXISTS "public"."CourseEnrollments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "enrolled_at" timestamp with time zone DEFAULT "now"(),
    "student_id" "uuid" NOT NULL
);


ALTER TABLE "public"."CourseEnrollments" OWNER TO "postgres";


COMMENT ON TABLE "public"."CourseEnrollments" IS 'Student enrollments in courses';



CREATE TABLE IF NOT EXISTS "public"."Courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "workspace" "uuid" NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "days_of_week" integer[],
    CONSTRAINT "valid_date_range" CHECK ((("start_date" IS NULL) OR ("end_date" IS NULL) OR ("start_date" <= "end_date"))),
    CONSTRAINT "valid_days_of_week" CHECK ((("days_of_week" IS NULL) OR (("array_length"("days_of_week", 1) > 0) AND ("days_of_week" <@ ARRAY[0, 1, 2, 3, 4, 5, 6]))))
);


ALTER TABLE "public"."Courses" OWNER TO "postgres";


COMMENT ON TABLE "public"."Courses" IS 'Courses within a workspace';



COMMENT ON COLUMN "public"."Courses"."start_date" IS 'Course start date for schedule generation';



COMMENT ON COLUMN "public"."Courses"."end_date" IS 'Course end date for schedule generation';



COMMENT ON COLUMN "public"."Courses"."days_of_week" IS 'Days when course occurs (0=Sunday, 1=Monday, ..., 6=Saturday)';



CREATE TABLE IF NOT EXISTS "public"."ExamScores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exam_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "score" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ExamScores" OWNER TO "postgres";


COMMENT ON TABLE "public"."ExamScores" IS 'Student exam scores for mini tests';



CREATE TABLE IF NOT EXISTS "public"."Exams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "exam_number" integer NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "max_score" integer DEFAULT 8,
    "cutline" integer DEFAULT 4
);


ALTER TABLE "public"."Exams" OWNER TO "postgres";


COMMENT ON TABLE "public"."Exams" IS 'Exams for courses';



COMMENT ON COLUMN "public"."Exams"."max_score" IS 'Maximum possible score for the exam';



COMMENT ON COLUMN "public"."Exams"."cutline" IS 'Minimum passing score for the exam';



CREATE TABLE IF NOT EXISTS "public"."ManagementStatuses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "display_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "color" "text" DEFAULT 'neutral'::"text" NOT NULL,
    "category" "text" DEFAULT 'retake'::"text" NOT NULL,
    CONSTRAINT "ManagementStatuses_category_check" CHECK (("category" = ANY (ARRAY['retake'::"text", 'assignment'::"text"]))),
    CONSTRAINT "ManagementStatuses_color_check" CHECK (("color" = ANY (ARRAY['success'::"text", 'warning'::"text", 'danger'::"text", 'info'::"text", 'neutral'::"text"])))
);


ALTER TABLE "public"."ManagementStatuses" OWNER TO "postgres";


COMMENT ON TABLE "public"."ManagementStatuses" IS 'Configurable management status options for retake assignments per workspace. RLS disabled - authorization handled at application level.';



COMMENT ON COLUMN "public"."ManagementStatuses"."display_order" IS 'Display order for sequential status progression (1-based)';



COMMENT ON COLUMN "public"."ManagementStatuses"."color" IS 'Badge color variant: success(green), warning(yellow), danger(red), info(blue), neutral(gray)';



CREATE TABLE IF NOT EXISTS "public"."MessageHistory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace" "uuid" NOT NULL,
    "group_id" "text",
    "message_type" "text" NOT NULL,
    "recipient_type" "text" NOT NULL,
    "recipient_phone" "text" NOT NULL,
    "recipient_name" "text",
    "student_id" "uuid",
    "message_content" "text" NOT NULL,
    "status_code" "text",
    "status_message" "text",
    "is_success" boolean DEFAULT false NOT NULL,
    "error_message" "text",
    "sent_by" "uuid" NOT NULL,
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "batch_id" "uuid",
    CONSTRAINT "MessageHistory_message_type_check" CHECK (("message_type" = ANY (ARRAY['general'::"text", 'exam'::"text", 'retake'::"text"]))),
    CONSTRAINT "MessageHistory_recipient_type_check" CHECK (("recipient_type" = ANY (ARRAY['student'::"text", 'parent'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."MessageHistory" OWNER TO "postgres";


COMMENT ON TABLE "public"."MessageHistory" IS 'SMS/LMS message sending history with delivery status tracking';



COMMENT ON COLUMN "public"."MessageHistory"."batch_id" IS 'Groups messages sent together in a single batch';



CREATE TABLE IF NOT EXISTS "public"."MessageTemplates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "content" "text" NOT NULL,
    "type" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "MessageTemplates_type_check" CHECK (("type" = ANY (ARRAY['general'::"text", 'exam'::"text", 'retake'::"text"])))
);


ALTER TABLE "public"."MessageTemplates" OWNER TO "postgres";


COMMENT ON TABLE "public"."MessageTemplates" IS 'Saved message templates for SMS feature';



COMMENT ON COLUMN "public"."MessageTemplates"."type" IS 'Template type: general (일반), exam (시험결과), retake (재시험안내)';



CREATE TABLE IF NOT EXISTS "public"."RetakeAssignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exam_id" "uuid" NOT NULL,
    "assigned_date" timestamp with time zone DEFAULT "now"(),
    "current_scheduled_date" "date",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "postpone_count" integer DEFAULT 0 NOT NULL,
    "absent_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "student_id" "uuid" NOT NULL,
    "management_status" "text" DEFAULT '재시 안내 예정'::"text" NOT NULL,
    CONSTRAINT "RetakeAssignments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'absent'::"text"])))
);


ALTER TABLE "public"."RetakeAssignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."RetakeAssignments" IS 'Retake exam assignments for students';



CREATE TABLE IF NOT EXISTS "public"."RetakeHistory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "retake_assignment_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "previous_date" "date",
    "new_date" "date",
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "previous_status" "text",
    "new_status" "text",
    "previous_management_status" "text",
    "new_management_status" "text",
    "performed_by" "uuid",
    CONSTRAINT "RetakeHistory_action_type_check" CHECK (("action_type" = ANY (ARRAY['assign'::"text", 'postpone'::"text", 'absent'::"text", 'complete'::"text", 'status_change'::"text", 'management_status_change'::"text", 'note_update'::"text", 'date_edit'::"text"])))
);


ALTER TABLE "public"."RetakeHistory" OWNER TO "postgres";


COMMENT ON TABLE "public"."RetakeHistory" IS 'Audit trail of retake assignment changes';



CREATE TABLE IF NOT EXISTS "public"."StudentAssignmentHistory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_assignment_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "previous_date" "date",
    "new_date" "date",
    "previous_status" "text",
    "new_status" "text",
    "note" "text",
    "performed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "StudentAssignmentHistory_action_type_check" CHECK (("action_type" = ANY (ARRAY['assign'::"text", 'postpone'::"text", 'absent'::"text", 'complete'::"text", 'insufficient'::"text", 'not_submitted'::"text", 'status_change'::"text", 'note_update'::"text", 'date_edit'::"text"])))
);


ALTER TABLE "public"."StudentAssignmentHistory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."StudentAssignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assignment_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "current_scheduled_date" "date",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "postpone_count" integer DEFAULT 0 NOT NULL,
    "absent_count" integer DEFAULT 0 NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "StudentAssignments_absent_count_check" CHECK (("absent_count" >= 0)),
    CONSTRAINT "StudentAssignments_postpone_count_check" CHECK (("postpone_count" >= 0)),
    CONSTRAINT "StudentAssignments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'absent'::"text", 'insufficient'::"text", 'not_submitted'::"text"])))
);


ALTER TABLE "public"."StudentAssignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."StudentTagAssignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."StudentTagAssignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."StudentTagAssignments" IS 'Assigns tags to students with optional date ranges';



COMMENT ON COLUMN "public"."StudentTagAssignments"."start_date" IS 'Tag activation start date';



COMMENT ON COLUMN "public"."StudentTagAssignments"."end_date" IS 'Tag expiration date (NULL = indefinite)';



CREATE TABLE IF NOT EXISTS "public"."StudentTags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "hidden_by_default" boolean DEFAULT false NOT NULL,
    CONSTRAINT "StudentTags_color_check" CHECK (("color" = ANY (ARRAY['red'::"text", 'orange'::"text", 'yellow'::"text", 'green'::"text", 'blue'::"text", 'indigo'::"text", 'purple'::"text", 'pink'::"text", 'brown'::"text", 'black'::"text", 'white'::"text"])))
);


ALTER TABLE "public"."StudentTags" OWNER TO "postgres";


COMMENT ON TABLE "public"."StudentTags" IS 'Tag definitions for categorizing students within a workspace';



COMMENT ON COLUMN "public"."StudentTags"."color" IS 'Color key matching solid-translucent-* Tailwind colors';



CREATE TABLE IF NOT EXISTS "public"."Users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "phone_number" "text" NOT NULL,
    "parent_phone_number" "text",
    "school" "text",
    "name" "text",
    "birth_year" bigint,
    "workspace" "uuid" DEFAULT "gen_random_uuid"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "role" "text" NOT NULL,
    "branch" "text",
    "required_clinic_weekdays" integer[],
    CONSTRAINT "Users_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'student'::"text"]))),
    CONSTRAINT "users_required_clinic_weekdays_check" CHECK ((("required_clinic_weekdays" IS NULL) OR (("array_length"("required_clinic_weekdays", 1) > 0) AND ("required_clinic_weekdays" <@ ARRAY[0, 1, 2, 3, 4, 5, 6]))))
);


ALTER TABLE "public"."Users" OWNER TO "postgres";


COMMENT ON TABLE "public"."Users" IS 'User accounts with role-based access (owner, admin, student). RLS disabled - authorization handled at application level.';



COMMENT ON COLUMN "public"."Users"."required_clinic_weekdays" IS 'Required clinic weekdays for student attendance expectations (0=Sunday, 6=Saturday)';



CREATE TABLE IF NOT EXISTS "public"."Workspaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "owner" "uuid" DEFAULT "gen_random_uuid"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "sender_phone_number" "text",
    "solapi_api_key" "text",
    "solapi_api_secret" "text"
);


ALTER TABLE "public"."Workspaces" OWNER TO "postgres";


COMMENT ON TABLE "public"."Workspaces" IS 'Multi-tenant workspaces for organizational isolation. RLS disabled - authorization handled at application level.';



COMMENT ON COLUMN "public"."Workspaces"."sender_phone_number" IS 'SMS sender phone number for this workspace (without hyphens)';



ALTER TABLE ONLY "public"."Assignments"
    ADD CONSTRAINT "Assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ClinicAttendance"
    ADD CONSTRAINT "ClinicAttendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Clinics"
    ADD CONSTRAINT "Clinics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ConsultationLogs"
    ADD CONSTRAINT "ConsultationLogs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ConsultationReadReceipts"
    ADD CONSTRAINT "ConsultationReadReceipts_consultation_id_user_id_key" UNIQUE ("consultation_id", "user_id");



ALTER TABLE ONLY "public"."ConsultationReadReceipts"
    ADD CONSTRAINT "ConsultationReadReceipts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ConsultationTemplates"
    ADD CONSTRAINT "ConsultationTemplates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."CourseEnrollments"
    ADD CONSTRAINT "CourseEnrollments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."CourseEnrollments"
    ADD CONSTRAINT "CourseEnrollments_student_course_unique" UNIQUE ("student_id", "course_id");



ALTER TABLE ONLY "public"."Courses"
    ADD CONSTRAINT "Courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ExamScores"
    ADD CONSTRAINT "ExamScores_exam_id_student_id_key" UNIQUE ("exam_id", "student_id");



ALTER TABLE ONLY "public"."ExamScores"
    ADD CONSTRAINT "ExamScores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Exams"
    ADD CONSTRAINT "Exams_course_id_exam_number_key" UNIQUE ("course_id", "exam_number");



ALTER TABLE ONLY "public"."Exams"
    ADD CONSTRAINT "Exams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ManagementStatuses"
    ADD CONSTRAINT "ManagementStatuses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ManagementStatuses"
    ADD CONSTRAINT "ManagementStatuses_workspace_category_display_order_key" UNIQUE ("workspace", "category", "display_order");



ALTER TABLE ONLY "public"."ManagementStatuses"
    ADD CONSTRAINT "ManagementStatuses_workspace_category_name_key" UNIQUE ("workspace", "category", "name");



ALTER TABLE ONLY "public"."MessageHistory"
    ADD CONSTRAINT "MessageHistory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."MessageTemplates"
    ADD CONSTRAINT "MessageTemplates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."RetakeAssignments"
    ADD CONSTRAINT "RetakeAssignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."RetakeAssignments"
    ADD CONSTRAINT "RetakeAssignments_student_exam_unique" UNIQUE ("student_id", "exam_id");



ALTER TABLE ONLY "public"."RetakeHistory"
    ADD CONSTRAINT "RetakeHistory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."StudentAssignmentHistory"
    ADD CONSTRAINT "StudentAssignmentHistory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."StudentAssignments"
    ADD CONSTRAINT "StudentAssignments_assignment_id_student_id_key" UNIQUE ("assignment_id", "student_id");



ALTER TABLE ONLY "public"."StudentAssignments"
    ADD CONSTRAINT "StudentAssignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."StudentTagAssignments"
    ADD CONSTRAINT "StudentTagAssignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."StudentTagAssignments"
    ADD CONSTRAINT "StudentTagAssignments_student_id_tag_id_key" UNIQUE ("student_id", "tag_id");



ALTER TABLE ONLY "public"."StudentTags"
    ADD CONSTRAINT "StudentTags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."StudentTags"
    ADD CONSTRAINT "StudentTags_workspace_name_key" UNIQUE ("workspace", "name");



ALTER TABLE ONLY "public"."Users"
    ADD CONSTRAINT "Users_phone_number_key" UNIQUE ("phone_number");



ALTER TABLE ONLY "public"."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Workspaces"
    ADD CONSTRAINT "Workspaces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ClinicAttendance"
    ADD CONSTRAINT "unique_clinic_student_date" UNIQUE ("clinic_id", "student_id", "attendance_date");



CREATE INDEX "idx_clinic_attendance_clinic" ON "public"."ClinicAttendance" USING "btree" ("clinic_id");



CREATE INDEX "idx_clinic_attendance_date" ON "public"."ClinicAttendance" USING "btree" ("attendance_date");



CREATE INDEX "idx_clinic_attendance_student" ON "public"."ClinicAttendance" USING "btree" ("student_id");



CREATE INDEX "idx_clinic_attendance_student_date" ON "public"."ClinicAttendance" USING "btree" ("student_id", "attendance_date");



CREATE INDEX "idx_clinics_workspace" ON "public"."Clinics" USING "btree" ("workspace");



CREATE INDEX "idx_consultation_logs_student_id" ON "public"."ConsultationLogs" USING "btree" ("student_id");



CREATE INDEX "idx_consultation_logs_workspace" ON "public"."ConsultationLogs" USING "btree" ("workspace");



CREATE INDEX "idx_consultation_logs_workspace_student" ON "public"."ConsultationLogs" USING "btree" ("workspace", "student_id");



CREATE INDEX "idx_consultation_read_receipts_consultation" ON "public"."ConsultationReadReceipts" USING "btree" ("consultation_id");



CREATE INDEX "idx_consultation_read_receipts_user" ON "public"."ConsultationReadReceipts" USING "btree" ("user_id");



CREATE INDEX "idx_consultation_templates_workspace" ON "public"."ConsultationTemplates" USING "btree" ("workspace");



CREATE INDEX "idx_course_enrollments_course_id" ON "public"."CourseEnrollments" USING "btree" ("course_id");



CREATE INDEX "idx_course_enrollments_student_id" ON "public"."CourseEnrollments" USING "btree" ("student_id");



CREATE INDEX "idx_courses_workspace" ON "public"."Courses" USING "btree" ("workspace");



CREATE INDEX "idx_exams_course_id" ON "public"."Exams" USING "btree" ("course_id");



CREATE INDEX "idx_management_statuses_order" ON "public"."ManagementStatuses" USING "btree" ("workspace", "display_order");



CREATE INDEX "idx_management_statuses_workspace" ON "public"."ManagementStatuses" USING "btree" ("workspace");



CREATE INDEX "idx_message_history_workspace" ON "public"."MessageHistory" USING "btree" ("workspace");



CREATE INDEX "idx_retake_assignments_exam_id" ON "public"."RetakeAssignments" USING "btree" ("exam_id");



CREATE INDEX "idx_retake_assignments_scheduled_date" ON "public"."RetakeAssignments" USING "btree" ("current_scheduled_date") WHERE ("status" <> 'completed'::"text");



CREATE INDEX "idx_retake_assignments_status" ON "public"."RetakeAssignments" USING "btree" ("status");



CREATE INDEX "idx_retake_assignments_student_exam" ON "public"."RetakeAssignments" USING "btree" ("student_id", "exam_id");



CREATE INDEX "idx_retake_assignments_student_id" ON "public"."RetakeAssignments" USING "btree" ("student_id");



CREATE INDEX "idx_retake_history_assignment_id" ON "public"."RetakeHistory" USING "btree" ("retake_assignment_id");



CREATE INDEX "idx_retake_history_created_at" ON "public"."RetakeHistory" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_student_assignment_history_sa_id" ON "public"."StudentAssignmentHistory" USING "btree" ("student_assignment_id");



CREATE INDEX "idx_student_assignments_student_id" ON "public"."StudentAssignments" USING "btree" ("student_id");



CREATE INDEX "idx_student_tag_assignments_dates" ON "public"."StudentTagAssignments" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_student_tag_assignments_student" ON "public"."StudentTagAssignments" USING "btree" ("student_id");



CREATE INDEX "idx_student_tag_assignments_tag" ON "public"."StudentTagAssignments" USING "btree" ("tag_id");



CREATE INDEX "idx_users_role" ON "public"."Users" USING "btree" ("role");



CREATE INDEX "idx_users_workspace" ON "public"."Users" USING "btree" ("workspace");



CREATE INDEX "idx_users_workspace_phone" ON "public"."Users" USING "btree" ("workspace", "phone_number");



CREATE INDEX "idx_users_workspace_role" ON "public"."Users" USING "btree" ("workspace", "role");



CREATE INDEX "student_assignment_history_created_at_idx" ON "public"."StudentAssignmentHistory" USING "btree" ("created_at" DESC);



CREATE INDEX "student_assignments_assignment_id_idx" ON "public"."StudentAssignments" USING "btree" ("assignment_id");



CREATE INDEX "student_assignments_status_idx" ON "public"."StudentAssignments" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "set_student_assignments_updated_at" BEFORE UPDATE ON "public"."StudentAssignments" FOR EACH ROW EXECUTE FUNCTION "public"."set_student_assignments_updated_at"();



CREATE OR REPLACE TRIGGER "update_retake_assignments_updated_at" BEFORE UPDATE ON "public"."RetakeAssignments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."Assignments"
    ADD CONSTRAINT "Assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Assignments"
    ADD CONSTRAINT "Assignments_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id");



ALTER TABLE ONLY "public"."ClinicAttendance"
    ADD CONSTRAINT "ClinicAttendance_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."Clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ClinicAttendance"
    ADD CONSTRAINT "ClinicAttendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Clinics"
    ADD CONSTRAINT "Clinics_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ConsultationLogs"
    ADD CONSTRAINT "ConsultationLogs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ConsultationLogs"
    ADD CONSTRAINT "ConsultationLogs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ConsultationLogs"
    ADD CONSTRAINT "ConsultationLogs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."Users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ConsultationLogs"
    ADD CONSTRAINT "ConsultationLogs_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ConsultationReadReceipts"
    ADD CONSTRAINT "ConsultationReadReceipts_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."ConsultationLogs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ConsultationReadReceipts"
    ADD CONSTRAINT "ConsultationReadReceipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ConsultationTemplates"
    ADD CONSTRAINT "ConsultationTemplates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ConsultationTemplates"
    ADD CONSTRAINT "ConsultationTemplates_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id");



ALTER TABLE ONLY "public"."CourseEnrollments"
    ADD CONSTRAINT "CourseEnrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."CourseEnrollments"
    ADD CONSTRAINT "CourseEnrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Courses"
    ADD CONSTRAINT "Courses_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ExamScores"
    ADD CONSTRAINT "ExamScores_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."Exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ExamScores"
    ADD CONSTRAINT "ExamScores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Exams"
    ADD CONSTRAINT "Exams_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ManagementStatuses"
    ADD CONSTRAINT "ManagementStatuses_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."MessageHistory"
    ADD CONSTRAINT "MessageHistory_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "public"."Users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."MessageHistory"
    ADD CONSTRAINT "MessageHistory_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."MessageHistory"
    ADD CONSTRAINT "MessageHistory_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."MessageTemplates"
    ADD CONSTRAINT "MessageTemplates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."MessageTemplates"
    ADD CONSTRAINT "MessageTemplates_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RetakeAssignments"
    ADD CONSTRAINT "RetakeAssignments_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."Exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RetakeAssignments"
    ADD CONSTRAINT "RetakeAssignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RetakeHistory"
    ADD CONSTRAINT "RetakeHistory_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."Users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."RetakeHistory"
    ADD CONSTRAINT "RetakeHistory_retake_assignment_id_fkey" FOREIGN KEY ("retake_assignment_id") REFERENCES "public"."RetakeAssignments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StudentAssignmentHistory"
    ADD CONSTRAINT "StudentAssignmentHistory_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."Users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."StudentAssignmentHistory"
    ADD CONSTRAINT "StudentAssignmentHistory_student_assignment_id_fkey" FOREIGN KEY ("student_assignment_id") REFERENCES "public"."StudentAssignments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StudentAssignments"
    ADD CONSTRAINT "StudentAssignments_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."Assignments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StudentAssignments"
    ADD CONSTRAINT "StudentAssignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StudentTagAssignments"
    ADD CONSTRAINT "StudentTagAssignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StudentTagAssignments"
    ADD CONSTRAINT "StudentTagAssignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."StudentTags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."StudentTags"
    ADD CONSTRAINT "StudentTags_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Users"
    ADD CONSTRAINT "Users_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Workspaces"
    ADD CONSTRAINT "Workspaces_owner_fkey" FOREIGN KEY ("owner") REFERENCES "public"."Users"("id") ON DELETE SET NULL;



ALTER TABLE "public"."Assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ClinicAttendance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Clinics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ConsultationLogs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ConsultationReadReceipts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ConsultationTemplates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."CourseEnrollments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ExamScores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Exams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ManagementStatuses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."MessageHistory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."MessageTemplates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."RetakeAssignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."RetakeHistory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."StudentAssignmentHistory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."StudentAssignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."StudentTagAssignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."StudentTags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Workspaces" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "assignments_delete" ON "public"."Assignments" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "Assignments"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "assignments_insert" ON "public"."Assignments" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "Assignments"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "assignments_select" ON "public"."Assignments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "Assignments"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "assignments_update" ON "public"."Assignments" FOR UPDATE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "Assignments"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "clinic_attendance_delete" ON "public"."ClinicAttendance" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Clinics" "cl"
  WHERE (("cl"."id" = "ClinicAttendance"."clinic_id") AND ("cl"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "clinic_attendance_insert" ON "public"."ClinicAttendance" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Clinics" "cl"
  WHERE (("cl"."id" = "ClinicAttendance"."clinic_id") AND ("cl"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "clinic_attendance_select" ON "public"."ClinicAttendance" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."Clinics" "cl"
  WHERE (("cl"."id" = "ClinicAttendance"."clinic_id") AND ("cl"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "clinic_attendance_update" ON "public"."ClinicAttendance" FOR UPDATE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Clinics" "cl"
  WHERE (("cl"."id" = "ClinicAttendance"."clinic_id") AND ("cl"."workspace" = "public"."get_user_workspace"())))))) WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Clinics" "cl"
  WHERE (("cl"."id" = "ClinicAttendance"."clinic_id") AND ("cl"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "clinics_delete" ON "public"."Clinics" FOR DELETE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "clinics_insert" ON "public"."Clinics" FOR INSERT TO "authenticated" WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "clinics_select" ON "public"."Clinics" FOR SELECT TO "authenticated" USING (("workspace" = "public"."get_user_workspace"()));



CREATE POLICY "clinics_update" ON "public"."Clinics" FOR UPDATE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"())) WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "consultation_logs_delete" ON "public"."ConsultationLogs" FOR DELETE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "consultation_logs_insert" ON "public"."ConsultationLogs" FOR INSERT TO "authenticated" WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "consultation_logs_select" ON "public"."ConsultationLogs" FOR SELECT TO "authenticated" USING (("workspace" = "public"."get_user_workspace"()));



CREATE POLICY "consultation_logs_update" ON "public"."ConsultationLogs" FOR UPDATE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"())) WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "consultation_read_receipts_delete" ON "public"."ConsultationReadReceipts" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."ConsultationLogs"
  WHERE (("ConsultationLogs"."id" = "ConsultationReadReceipts"."consultation_id") AND ("ConsultationLogs"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "consultation_read_receipts_insert" ON "public"."ConsultationReadReceipts" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."ConsultationLogs"
  WHERE (("ConsultationLogs"."id" = "ConsultationReadReceipts"."consultation_id") AND ("ConsultationLogs"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "consultation_read_receipts_select" ON "public"."ConsultationReadReceipts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."ConsultationLogs"
  WHERE (("ConsultationLogs"."id" = "ConsultationReadReceipts"."consultation_id") AND ("ConsultationLogs"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "consultation_templates_delete" ON "public"."ConsultationTemplates" FOR DELETE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "consultation_templates_insert" ON "public"."ConsultationTemplates" FOR INSERT TO "authenticated" WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "consultation_templates_select" ON "public"."ConsultationTemplates" FOR SELECT TO "authenticated" USING (("workspace" = "public"."get_user_workspace"()));



CREATE POLICY "consultation_templates_update" ON "public"."ConsultationTemplates" FOR UPDATE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"())) WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "course_enrollments_delete" ON "public"."CourseEnrollments" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "CourseEnrollments"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "course_enrollments_insert" ON "public"."CourseEnrollments" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "CourseEnrollments"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "course_enrollments_select" ON "public"."CourseEnrollments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "CourseEnrollments"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "courses_delete" ON "public"."Courses" FOR DELETE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "courses_insert" ON "public"."Courses" FOR INSERT TO "authenticated" WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "courses_select" ON "public"."Courses" FOR SELECT TO "authenticated" USING (("workspace" = "public"."get_user_workspace"()));



CREATE POLICY "courses_update" ON "public"."Courses" FOR UPDATE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"())) WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "exam_scores_delete" ON "public"."ExamScores" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM ("public"."Exams" "e"
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("e"."id" = "ExamScores"."exam_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "exam_scores_insert" ON "public"."ExamScores" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM ("public"."Exams" "e"
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("e"."id" = "ExamScores"."exam_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "exam_scores_select" ON "public"."ExamScores" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."Exams" "e"
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("e"."id" = "ExamScores"."exam_id") AND ("c"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "exam_scores_update" ON "public"."ExamScores" FOR UPDATE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM ("public"."Exams" "e"
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("e"."id" = "ExamScores"."exam_id") AND ("c"."workspace" = "public"."get_user_workspace"())))))) WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM ("public"."Exams" "e"
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("e"."id" = "ExamScores"."exam_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "exams_delete" ON "public"."Exams" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "Exams"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "exams_insert" ON "public"."Exams" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "Exams"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "exams_select" ON "public"."Exams" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "Exams"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "exams_update" ON "public"."Exams" FOR UPDATE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "Exams"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"())))))) WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Courses" "c"
  WHERE (("c"."id" = "Exams"."course_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "management_statuses_delete" ON "public"."ManagementStatuses" FOR DELETE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "management_statuses_insert" ON "public"."ManagementStatuses" FOR INSERT TO "authenticated" WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "management_statuses_select" ON "public"."ManagementStatuses" FOR SELECT TO "authenticated" USING (("workspace" = "public"."get_user_workspace"()));



CREATE POLICY "management_statuses_update" ON "public"."ManagementStatuses" FOR UPDATE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"())) WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "message_history_insert" ON "public"."MessageHistory" FOR INSERT TO "authenticated" WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "message_history_select" ON "public"."MessageHistory" FOR SELECT TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "message_templates_delete" ON "public"."MessageTemplates" FOR DELETE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "message_templates_insert" ON "public"."MessageTemplates" FOR INSERT TO "authenticated" WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "message_templates_select" ON "public"."MessageTemplates" FOR SELECT TO "authenticated" USING (("workspace" = "public"."get_user_workspace"()));



CREATE POLICY "message_templates_update" ON "public"."MessageTemplates" FOR UPDATE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"())) WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "retake_assignments_delete" ON "public"."RetakeAssignments" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM ("public"."Exams" "e"
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("e"."id" = "RetakeAssignments"."exam_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "retake_assignments_insert" ON "public"."RetakeAssignments" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM ("public"."Exams" "e"
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("e"."id" = "RetakeAssignments"."exam_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "retake_assignments_select" ON "public"."RetakeAssignments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."Exams" "e"
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("e"."id" = "RetakeAssignments"."exam_id") AND ("c"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "retake_assignments_update" ON "public"."RetakeAssignments" FOR UPDATE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM ("public"."Exams" "e"
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("e"."id" = "RetakeAssignments"."exam_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "retake_history_delete" ON "public"."RetakeHistory" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM (("public"."RetakeAssignments" "ra"
     JOIN "public"."Exams" "e" ON (("e"."id" = "ra"."exam_id")))
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("ra"."id" = "RetakeHistory"."retake_assignment_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "retake_history_insert" ON "public"."RetakeHistory" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM (("public"."RetakeAssignments" "ra"
     JOIN "public"."Exams" "e" ON (("e"."id" = "ra"."exam_id")))
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("ra"."id" = "RetakeHistory"."retake_assignment_id") AND ("c"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "retake_history_select" ON "public"."RetakeHistory" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."RetakeAssignments" "ra"
     JOIN "public"."Exams" "e" ON (("e"."id" = "ra"."exam_id")))
     JOIN "public"."Courses" "c" ON (("c"."id" = "e"."course_id")))
  WHERE (("ra"."id" = "RetakeHistory"."retake_assignment_id") AND ("c"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "student_assignment_history_insert" ON "public"."StudentAssignmentHistory" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM ("public"."StudentAssignments"
     JOIN "public"."Users" ON (("Users"."id" = "StudentAssignments"."student_id")))
  WHERE (("StudentAssignments"."id" = "StudentAssignmentHistory"."student_assignment_id") AND ("Users"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "student_assignment_history_select" ON "public"."StudentAssignmentHistory" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."StudentAssignments"
     JOIN "public"."Users" ON (("Users"."id" = "StudentAssignments"."student_id")))
  WHERE (("StudentAssignments"."id" = "StudentAssignmentHistory"."student_assignment_id") AND ("Users"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "student_assignments_delete" ON "public"."StudentAssignments" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Users"
  WHERE (("Users"."id" = "StudentAssignments"."student_id") AND ("Users"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "student_assignments_insert" ON "public"."StudentAssignments" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."Users"
  WHERE (("Users"."id" = "StudentAssignments"."student_id") AND ("Users"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "student_assignments_select" ON "public"."StudentAssignments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."Users"
  WHERE (("Users"."id" = "StudentAssignments"."student_id") AND ("Users"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "student_assignments_update" ON "public"."StudentAssignments" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."Users"
  WHERE (("Users"."id" = "StudentAssignments"."student_id") AND ("Users"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "student_tag_assignments_delete" ON "public"."StudentTagAssignments" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."StudentTags" "st"
  WHERE (("st"."id" = "StudentTagAssignments"."tag_id") AND ("st"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "student_tag_assignments_insert" ON "public"."StudentTagAssignments" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."StudentTags" "st"
  WHERE (("st"."id" = "StudentTagAssignments"."tag_id") AND ("st"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "student_tag_assignments_select" ON "public"."StudentTagAssignments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."StudentTags" "st"
  WHERE (("st"."id" = "StudentTagAssignments"."tag_id") AND ("st"."workspace" = "public"."get_user_workspace"())))));



CREATE POLICY "student_tag_assignments_update" ON "public"."StudentTagAssignments" FOR UPDATE TO "authenticated" USING (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."StudentTags" "st"
  WHERE (("st"."id" = "StudentTagAssignments"."tag_id") AND ("st"."workspace" = "public"."get_user_workspace"())))))) WITH CHECK (("public"."is_admin_or_owner"() AND (EXISTS ( SELECT 1
   FROM "public"."StudentTags" "st"
  WHERE (("st"."id" = "StudentTagAssignments"."tag_id") AND ("st"."workspace" = "public"."get_user_workspace"()))))));



CREATE POLICY "student_tags_delete" ON "public"."StudentTags" FOR DELETE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "student_tags_insert" ON "public"."StudentTags" FOR INSERT TO "authenticated" WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "student_tags_select" ON "public"."StudentTags" FOR SELECT TO "authenticated" USING (("workspace" = "public"."get_user_workspace"()));



CREATE POLICY "student_tags_update" ON "public"."StudentTags" FOR UPDATE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"())) WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "users_delete" ON "public"."Users" FOR DELETE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "users_insert" ON "public"."Users" FOR INSERT TO "authenticated" WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "users_select" ON "public"."Users" FOR SELECT TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND ("public"."is_admin_or_owner"() OR ("id" = "auth"."uid"()))));



CREATE POLICY "users_update" ON "public"."Users" FOR UPDATE TO "authenticated" USING ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"())) WITH CHECK ((("workspace" = "public"."get_user_workspace"()) AND "public"."is_admin_or_owner"()));



CREATE POLICY "workspaces_delete_owner" ON "public"."Workspaces" FOR DELETE TO "authenticated" USING ((("id" = "public"."get_user_workspace"()) AND ("public"."get_user_role"() = 'owner'::"text")));



CREATE POLICY "workspaces_select" ON "public"."Workspaces" FOR SELECT TO "authenticated" USING (("id" = "public"."get_user_workspace"()));



CREATE POLICY "workspaces_update" ON "public"."Workspaces" FOR UPDATE TO "authenticated" USING ((("id" = "public"."get_user_workspace"()) AND ("public"."get_user_role"() = 'owner'::"text"))) WITH CHECK ((("id" = "public"."get_user_workspace"()) AND ("public"."get_user_role"() = 'owner'::"text")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_workspace"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_workspace"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_workspace"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_or_owner"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_or_owner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_or_owner"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_student_assignments_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_student_assignments_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_student_assignments_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."Assignments" TO "anon";
GRANT ALL ON TABLE "public"."Assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."Assignments" TO "service_role";



GRANT ALL ON TABLE "public"."ClinicAttendance" TO "anon";
GRANT ALL ON TABLE "public"."ClinicAttendance" TO "authenticated";
GRANT ALL ON TABLE "public"."ClinicAttendance" TO "service_role";



GRANT ALL ON TABLE "public"."Clinics" TO "anon";
GRANT ALL ON TABLE "public"."Clinics" TO "authenticated";
GRANT ALL ON TABLE "public"."Clinics" TO "service_role";



GRANT ALL ON TABLE "public"."ConsultationLogs" TO "anon";
GRANT ALL ON TABLE "public"."ConsultationLogs" TO "authenticated";
GRANT ALL ON TABLE "public"."ConsultationLogs" TO "service_role";



GRANT ALL ON TABLE "public"."ConsultationReadReceipts" TO "anon";
GRANT ALL ON TABLE "public"."ConsultationReadReceipts" TO "authenticated";
GRANT ALL ON TABLE "public"."ConsultationReadReceipts" TO "service_role";



GRANT ALL ON TABLE "public"."ConsultationTemplates" TO "anon";
GRANT ALL ON TABLE "public"."ConsultationTemplates" TO "authenticated";
GRANT ALL ON TABLE "public"."ConsultationTemplates" TO "service_role";



GRANT ALL ON TABLE "public"."CourseEnrollments" TO "anon";
GRANT ALL ON TABLE "public"."CourseEnrollments" TO "authenticated";
GRANT ALL ON TABLE "public"."CourseEnrollments" TO "service_role";



GRANT ALL ON TABLE "public"."Courses" TO "anon";
GRANT ALL ON TABLE "public"."Courses" TO "authenticated";
GRANT ALL ON TABLE "public"."Courses" TO "service_role";



GRANT ALL ON TABLE "public"."ExamScores" TO "anon";
GRANT ALL ON TABLE "public"."ExamScores" TO "authenticated";
GRANT ALL ON TABLE "public"."ExamScores" TO "service_role";



GRANT ALL ON TABLE "public"."Exams" TO "anon";
GRANT ALL ON TABLE "public"."Exams" TO "authenticated";
GRANT ALL ON TABLE "public"."Exams" TO "service_role";



GRANT ALL ON TABLE "public"."ManagementStatuses" TO "anon";
GRANT ALL ON TABLE "public"."ManagementStatuses" TO "authenticated";
GRANT ALL ON TABLE "public"."ManagementStatuses" TO "service_role";



GRANT ALL ON TABLE "public"."MessageHistory" TO "anon";
GRANT ALL ON TABLE "public"."MessageHistory" TO "authenticated";
GRANT ALL ON TABLE "public"."MessageHistory" TO "service_role";



GRANT ALL ON TABLE "public"."MessageTemplates" TO "anon";
GRANT ALL ON TABLE "public"."MessageTemplates" TO "authenticated";
GRANT ALL ON TABLE "public"."MessageTemplates" TO "service_role";



GRANT ALL ON TABLE "public"."RetakeAssignments" TO "anon";
GRANT ALL ON TABLE "public"."RetakeAssignments" TO "authenticated";
GRANT ALL ON TABLE "public"."RetakeAssignments" TO "service_role";



GRANT ALL ON TABLE "public"."RetakeHistory" TO "anon";
GRANT ALL ON TABLE "public"."RetakeHistory" TO "authenticated";
GRANT ALL ON TABLE "public"."RetakeHistory" TO "service_role";



GRANT ALL ON TABLE "public"."StudentAssignmentHistory" TO "anon";
GRANT ALL ON TABLE "public"."StudentAssignmentHistory" TO "authenticated";
GRANT ALL ON TABLE "public"."StudentAssignmentHistory" TO "service_role";



GRANT ALL ON TABLE "public"."StudentAssignments" TO "anon";
GRANT ALL ON TABLE "public"."StudentAssignments" TO "authenticated";
GRANT ALL ON TABLE "public"."StudentAssignments" TO "service_role";



GRANT ALL ON TABLE "public"."StudentTagAssignments" TO "anon";
GRANT ALL ON TABLE "public"."StudentTagAssignments" TO "authenticated";
GRANT ALL ON TABLE "public"."StudentTagAssignments" TO "service_role";



GRANT ALL ON TABLE "public"."StudentTags" TO "anon";
GRANT ALL ON TABLE "public"."StudentTags" TO "authenticated";
GRANT ALL ON TABLE "public"."StudentTags" TO "service_role";



GRANT ALL ON TABLE "public"."Users" TO "anon";
GRANT ALL ON TABLE "public"."Users" TO "authenticated";
GRANT ALL ON TABLE "public"."Users" TO "service_role";



GRANT ALL ON TABLE "public"."Workspaces" TO "anon";
GRANT ALL ON TABLE "public"."Workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."Workspaces" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































