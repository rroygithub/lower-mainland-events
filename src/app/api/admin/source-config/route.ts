/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ensureAdminRouteAccess } from "@/lib/auth";
import { getSourceConfigsForAdmin } from "@/lib/events";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const unauthorized = await ensureAdminRouteAccess();
  if (unauthorized) return unauthorized;

  const admin = createSupabaseAdminClient() as ReturnType<typeof createSupabaseAdminClient> & {
    from: (table: string) => any;
  };

  const body = (await request.json()) as {
    id?: string;
    name: string;
    source_type: string;
    base_url: string;
    city?: string;
    category_hint?: string;
    notes?: string;
    active?: boolean;
  };

  if (!admin) {
    return NextResponse.json({ success: true, sources: await getSourceConfigsForAdmin(), fallbackMode: true });
  }

  const payload = {
    name: body.name,
    source_type: body.source_type,
    base_url: body.base_url,
    city: body.city || null,
    category_hint: body.category_hint || null,
    notes: body.notes || null,
    active: body.active ?? true,
    updated_at: new Date().toISOString(),
  };

  const query = body.id
    ? (admin.from("event_sources_config") as any).update(payload).eq("id", body.id)
    : (admin.from("event_sources_config") as any).insert(payload);

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, sources: await getSourceConfigsForAdmin() });
}
