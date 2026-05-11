/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAdminEmails, isAdminEmail } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EventSubmissionRecord } from "@/lib/types";
import { slugify } from "@/lib/utils";

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

  const body = await request.json();
  const { submissionId, edits, duplicateEventId } = body as {
    submissionId: string;
    duplicateEventId?: string | null;
    edits: Record<string, string | null>;
  };

  const submissionResponse = await admin.from("event_submissions").select("*").eq("id", submissionId).single();
  const submission = submissionResponse.data as EventSubmissionRecord | null;
  const submissionError = submissionResponse.error;

  if (submissionError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const slugBase = slugify(String(edits.title || submission.title));
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 7)}`;

  const { error: insertError } = await (admin.from("events") as any).insert({
    title: String(edits.title || submission.title),
    slug,
    description: String(edits.description || submission.description || ""),
    category: String(edits.category || submission.category),
    city: String(edits.city || submission.city),
    community: "Indian / South Asian",
    venue_name: String(edits.venue_name || submission.venue_name || ""),
    venue_address: String(edits.venue_address || submission.venue_address || ""),
    start_time: String(edits.start_time || submission.start_time),
    end_time: edits.end_time || submission.end_time,
    price_type: String(edits.price_type || submission.price_type || "unknown"),
    price_display: String(edits.price_display || submission.price_display || ""),
    ticket_url: String(edits.ticket_url || submission.ticket_url || ""),
    source_url: String(edits.source_url || submission.source_url || ""),
    source_name: submission.source_url ? "Submitted by organizer" : "Community submission",
    organizer_name: String(edits.organizer_name || submission.organizer_name || ""),
    poster_url: String(edits.poster_url || submission.poster_url || ""),
    status: "approved",
    duplicate_group_id: duplicateEventId || null,
    is_featured: false,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: updateError } = await (admin.from("event_submissions") as any)
    .update({ status: "approved", possible_duplicate_event_id: duplicateEventId || null })
    .eq("id", submissionId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
