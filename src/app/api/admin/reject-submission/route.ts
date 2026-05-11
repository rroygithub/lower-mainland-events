/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAdminEmails, isAdminEmail } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function ensureAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !getAdminEmails().length) {
    return true;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return false;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return isAdminEmail(user?.email);
}

export async function POST(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient() as ReturnType<typeof createSupabaseAdminClient> & {
    from: (table: string) => any;
  };
  if (!admin) {
    return NextResponse.json({ success: true, fallbackMode: true });
  }

  const { submissionId } = (await request.json()) as { submissionId: string };

  const { error } = await (admin.from("event_submissions") as any).update({ status: "rejected" }).eq("id", submissionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
