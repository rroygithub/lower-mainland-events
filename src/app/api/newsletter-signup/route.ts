/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    city?: string | null;
    categories?: string[];
  };

  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient() as ReturnType<typeof createSupabaseAdminClient> & {
    from: (table: string) => any;
  };

  if (!admin) {
    return NextResponse.json({ success: true, fallbackMode: true });
  }

  const { error } = await (admin.from("newsletter_signups") as any).upsert(
    {
      email: body.email.trim().toLowerCase(),
      city: body.city || null,
      categories: body.categories || [],
    },
    { onConflict: "email" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
