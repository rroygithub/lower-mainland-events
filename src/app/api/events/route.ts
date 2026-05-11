import { NextResponse } from "next/server";
import { getApprovedEvents } from "@/lib/events";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const events = await getApprovedEvents({
    q: searchParams.get("q") || undefined,
    city: searchParams.get("city") || undefined,
    category: searchParams.get("category") || undefined,
    date: (searchParams.get("date") as "today" | "tomorrow" | "this-weekend" | "next-7-days" | "next-30-days" | "all" | null) || "all",
    price: (searchParams.get("price") as "free" | "paid" | "unknown" | "all" | null) || "all",
    sort: (searchParams.get("sort") as "asc" | "desc" | "recently-added" | null) || "asc",
  });

  return NextResponse.json({ events });
}
