/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    reporter_email?: string | null;
    issue_type?: string | null;
    message?: string | null;
  };

  const admin = createSupabaseAdminClient() as ReturnType<typeof createSupabaseAdminClient> & {
    from: (table: string) => any;
  };

  if (!admin) {
    return NextResponse.json({ success: true, fallbackMode: true });
  }

  const { error } = await (admin.from("event_reports") as any).insert({
    event_id: id,
    reporter_email: body.reporter_email || null,
    issue_type: body.issue_type || "other",
    message: body.message || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
