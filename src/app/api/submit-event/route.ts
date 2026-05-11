/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { buildDuplicateMatches } from "@/lib/dedupe";
import { sampleEvents } from "@/lib/sample-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const requiredFields = ["title", "category", "city", "start_time", "submitter_email"];

  const missing = requiredFields.find((field) => !String(formData.get(field) || "").trim());
  if (missing) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const incoming = {
    title: String(formData.get("title")),
    city: String(formData.get("city")),
    venue_name: String(formData.get("venue_name") || ""),
    start_time: new Date(String(formData.get("start_time"))).toISOString(),
    ticket_url: String(formData.get("ticket_url") || ""),
    source_url: String(formData.get("source_url") || ""),
  };

  const admin = createSupabaseAdminClient() as ReturnType<typeof createSupabaseAdminClient> & {
    from: (table: string) => any;
    storage: any;
  };
  const poster = formData.get("poster");
  let posterUrl: string | null = null;

  if (admin && poster instanceof File && poster.size > 0) {
    const filePath = `event-posters/${Date.now()}-${slugify(poster.name)}`;
    const { error } = await admin.storage.from("event-posters").upload(filePath, poster, {
      contentType: poster.type,
      upsert: false,
    });

    if (!error) {
      const {
        data: { publicUrl },
      } = admin.storage.from("event-posters").getPublicUrl(filePath);
      posterUrl = publicUrl;
    }
  }

  if (!admin) {
    const duplicates = buildDuplicateMatches(incoming, sampleEvents);
    return NextResponse.json({
      success: true,
      duplicateMatches: duplicates,
      fallbackMode: true,
    });
  }

  const { data: approvedEvents } = await (admin.from("events") as any).select("*").eq("status", "approved");
  const duplicates = buildDuplicateMatches(incoming, approvedEvents || []);

  const { error } = await (admin.from("event_submissions") as any).insert({
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    category: String(formData.get("category")),
    city: String(formData.get("city")),
    venue_name: String(formData.get("venue_name") || ""),
    venue_address: String(formData.get("venue_address") || ""),
    start_time: new Date(String(formData.get("start_time"))).toISOString(),
    end_time: formData.get("end_time") ? new Date(String(formData.get("end_time"))).toISOString() : null,
    price_type: String(formData.get("price_type") || "unknown"),
    price_display: String(formData.get("price_display") || ""),
    ticket_url: String(formData.get("ticket_url") || ""),
    source_url: String(formData.get("source_url") || ""),
    organizer_name: String(formData.get("organizer_name") || ""),
    submitter_name: String(formData.get("submitter_name") || ""),
    submitter_email: String(formData.get("submitter_email") || ""),
    poster_url: posterUrl,
    possible_duplicate_event_id: duplicates[0]?.eventId || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, duplicateMatches: duplicates });
}
