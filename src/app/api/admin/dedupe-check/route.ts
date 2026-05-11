import { NextResponse } from "next/server";
import { getAdminEmails, isAdminEmail } from "@/lib/auth";
import { findPossibleDuplicates } from "@/lib/events";
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

  const body = await request.json();
  const matches = await findPossibleDuplicates(body);
  return NextResponse.json({ matches });
}
