import { NextResponse } from "next/server";
import { type ApiContext, withLogging } from "@/shared/lib/api/withLogging";
import { removePhoneHyphens } from "@/shared/lib/utils/phone";

const handleGet = async ({ supabase, session }: ApiContext) => {
  const { data: workspace, error } = await supabase
    .from("Workspaces")
    .select("sender_phone_number")
    .eq("id", session.workspace)
    .single();

  if (error) throw error;

  return NextResponse.json({
    data: {
      senderPhoneNumber: workspace?.sender_phone_number || null,
    },
  });
};

const handlePatch = async ({ request, supabase, session }: ApiContext) => {
  const { senderPhoneNumber } = await request.json();

  if (senderPhoneNumber !== null && senderPhoneNumber !== undefined) {
    if (typeof senderPhoneNumber !== "string") {
      return NextResponse.json({ error: "발신번호는 문자열이어야 합니다." }, { status: 400 });
    }

    const cleanedNumber = removePhoneHyphens(senderPhoneNumber);

    if (cleanedNumber && !/^0\d{9,10}$/.test(cleanedNumber)) {
      return NextResponse.json({ error: "올바른 전화번호 형식이 아닙니다." }, { status: 400 });
    }

    const { error } = await supabase
      .from("Workspaces")
      .update({ sender_phone_number: cleanedNumber || null })
      .eq("id", session.workspace);

    if (error) throw error;

    return NextResponse.json({
      data: {
        senderPhoneNumber: cleanedNumber || null,
      },
    });
  }

  const { error } = await supabase.from("Workspaces").update({ sender_phone_number: null }).eq("id", session.workspace);

  if (error) throw error;

  return NextResponse.json({
    data: {
      senderPhoneNumber: null,
    },
  });
};

export const GET = withLogging(handleGet, {
  resource: "sender-phone",
  action: "read",
  allowedRoles: ["owner", "admin"],
});

export const PATCH = withLogging(handlePatch, {
  resource: "sender-phone",
  action: "update",
  allowedRoles: ["owner"],
});
