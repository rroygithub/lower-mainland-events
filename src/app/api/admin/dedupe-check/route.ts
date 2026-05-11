import { NextResponse } from "next/server";
import { ensureAdminRouteAccess } from "@/lib/auth";
import { findPossibleDuplicates } from "@/lib/events";

export async function POST(request: Request) {
  const unauthorized = await ensureAdminRouteAccess();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const matches = await findPossibleDuplicates(body);
  return NextResponse.json({ matches });
}
