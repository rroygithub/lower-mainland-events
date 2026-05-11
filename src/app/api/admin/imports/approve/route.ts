/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ensureAdminRouteAccess } from "@/lib/auth";
import { getEventImportById } from "@/lib/events";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const unauthorized = await ensureAdminRouteAccess();
  if (unauthorized) return unauthorized;

  const admin = createSupabaseAdminClient() as ReturnType<typeof createSupabaseAdminClient> & {
    from: (table: string) => any;
  };
  if (!admin) {
    return NextResponse.json({ success: true, fallbackMode: true });
  }

  const body = (await request.json()) as {
    importId: string;
    edits: Record<string, string | null>;
  };

  const item = await getEventImportById(body.importId);
  if (!item) {
    return NextResponse.json({ error: "Import not found." }, { status: 404 });
  }

  const title = String(body.edits.title || item.parsed_title || item.raw_title);
  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;
  const sourceUrl = String(item.raw_url || body.edits.ticket_url || "");
  const sourceName = item.parsed_source_name || "Imported source";

  const { data: eventRow, error: insertError } = await (admin.from("events") as any)
    .insert({
      title,
      slug,
      description: String(body.edits.description || item.parsed_description || item.raw_description || ""),
      category: String(body.edits.category || item.parsed_category || "Community"),
      community: "Indian / South Asian",
      city: String(body.edits.city || item.parsed_city || item.raw_city || "Other"),
      venue_name: String(body.edits.venue_name || item.parsed_venue_name || item.raw_venue || ""),
      start_time: body.edits.start_time || item.parsed_start_time || new Date().toISOString(),
      end_time: item.parsed_end_time,
      ticket_url: String(body.edits.ticket_url || item.parsed_ticket_url || sourceUrl),
      source_url: sourceUrl,
      source_name: sourceName,
      organizer_name: String(body.edits.organizer_name || item.parsed_organizer_name || ""),
      poster_url: String(body.edits.poster_url || item.parsed_poster_url || item.raw_image_url || ""),
      status: "approved",
      is_featured: false,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await (admin.from("event_sources") as any).insert({
    event_id: eventRow.id,
    source_name: sourceName,
    source_url: sourceUrl,
  });

  await (admin.from("event_imports") as any).update({ import_status: "approved" }).eq("id", body.importId);

  return NextResponse.json({ success: true });
}
