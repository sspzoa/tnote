import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";

const handleGet = async ({ supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;

  const { data, error } = await supabase
    .from("Users")
    .select("id, phone_number, name, parent_phone_number, school, birth_year")
    .eq("id", id)
    .eq("workspace", session.workspace)
    .single();

  if (error) throw error;

  await logger.info("read", "students", `Retrieved student: ${data.name}`, { resourceId: id });
  return NextResponse.json({ data });
};

const handlePatch = async ({ request, supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;
  const { name, phoneNumber, parentPhoneNumber, school, birthYear } = await request.json();

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (phoneNumber !== undefined) updateData.phone_number = phoneNumber;
  if (parentPhoneNumber !== undefined) updateData.parent_phone_number = parentPhoneNumber;
  if (school !== undefined) updateData.school = school;
  if (birthYear !== undefined) updateData.birth_year = birthYear;

  const { data, error } = await supabase
    .from("Users")
    .update(updateData)
    .eq("id", id)
    .eq("workspace", session.workspace)
    .select("id, phone_number, name, parent_phone_number, school, birth_year")
    .single();

  if (error) throw error;

  await logger.logUpdate("students", id!, `Student updated: ${data.name}`);
  return NextResponse.json({ success: true, data });
};

const handleDelete = async ({ supabase, session, logger, params }: ApiContext) => {
  const id = params?.id;

  const { error } = await supabase.from("Users").delete().eq("id", id).eq("workspace", session.workspace);

  if (error) throw error;

  await logger.logDelete("students", id!, "Student deleted");
  return NextResponse.json({ success: true });
};

export const GET = withLogging(handleGet, { resource: "students", action: "read" });
export const PATCH = withLogging(handlePatch, { resource: "students", action: "update" });
export const DELETE = withLogging(handleDelete, { resource: "students", action: "delete" });
