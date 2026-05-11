import { NextResponse } from "next/server";
import { ensureAdminRouteAccess } from "@/lib/auth";
import { getSourceConfigById, stageImportedCandidates } from "@/lib/events";
import { fetchImportCandidatesForSource } from "@/lib/importers";

export async function POST(request: Request) {
  const unauthorized = await ensureAdminRouteAccess();
  if (unauthorized) return unauthorized;

  const { sourceConfigId } = (await request.json()) as { sourceConfigId?: string };
  if (!sourceConfigId) {
    return NextResponse.json({ error: "sourceConfigId is required." }, { status: 400 });
  }

  const source = await getSourceConfigById(sourceConfigId);
  if (!source) {
    return NextResponse.json({ error: "Source not found." }, { status: 404 });
  }

  try {
    const candidates = await fetchImportCandidatesForSource(source);
    const staged = await stageImportedCandidates(source, candidates);
    return NextResponse.json({ success: true, count: staged.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed." }, { status: 500 });
  }
}
