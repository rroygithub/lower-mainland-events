/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ensureAdminRouteAccess } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const unauthorized = await ensureAdminRouteAccess();
  if (unauthorized) return unauthorized;

  const admin = createSupabaseAdminClient() as ReturnType<typeof createSupabaseAdminClient> & {
    from: (table: string) => any;
  };
  if (!admin) {
    return NextResponse.json({ success: true, fallbackMode: true });
  }

  const { reportId, status } = (await request.json()) as { reportId: string; status: string };
  const { error } = await (admin.from("event_reports") as any).update({ status }).eq("id", reportId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
