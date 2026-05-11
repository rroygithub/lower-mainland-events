/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ensureAdminRouteAccess } from "@/lib/auth";
import { getEventImportById } from "@/lib/events";
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

  const { importId, eventId } = (await request.json()) as { importId: string; eventId: string };
  const item = await getEventImportById(importId);
  if (!item) {
    return NextResponse.json({ error: "Import not found." }, { status: 404 });
  }

  const { error: sourceError } = await (admin.from("event_sources") as any).insert({
    event_id: eventId,
    source_name: item.parsed_source_name || "Imported source",
    source_url: item.raw_url || item.parsed_ticket_url || "",
  });

  if (sourceError) {
    return NextResponse.json({ error: sourceError.message }, { status: 500 });
  }

  const { error: importError } = await (admin.from("event_imports") as any)
    .update({ import_status: "approved", possible_duplicate_event_id: eventId })
    .eq("id", importId);

  if (importError) {
    return NextResponse.json({ error: importError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
