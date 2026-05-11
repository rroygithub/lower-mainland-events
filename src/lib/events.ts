import { endOfDay } from "date-fns";
import { applyEventFilters } from "@/lib/filters";
import { sampleEvents, sampleSubmissions } from "@/lib/sample-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EventFilters, EventRecord, EventSubmissionRecord } from "@/lib/types";

export async function getApprovedEvents(filters: EventFilters = {}) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return applyEventFilters(
      sampleEvents.filter((event) => event.status === "approved"),
      filters,
    );
  }

  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "approved")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: filters.sort !== "desc" });

  if (filters.city && filters.city !== "all") {
    query = query.eq("city", filters.city);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.price && filters.price !== "all") {
    query = query.eq("price_type", filters.price);
  }

  const { data } = await query.limit(100);

  return applyEventFilters((data as EventRecord[] | null) ?? [], filters);
}

export async function getFeaturedEvents() {
  const events = await getApprovedEvents({ sort: "asc" });
  return events.filter((event) => event.is_featured).slice(0, 3);
}

export async function getWeekendEvents() {
  const events = await getApprovedEvents({ date: "this-weekend", sort: "asc" });
  return events.slice(0, 4);
}

export async function getUpcomingEventsByCity() {
  const events = await getApprovedEvents({ sort: "asc" });
  const grouped = new Map<string, EventRecord[]>();

  events.forEach((event) => {
    const collection = grouped.get(event.city) ?? [];
    if (collection.length < 3) {
      collection.push(event);
    }
    grouped.set(event.city, collection);
  });

  return [...grouped.entries()].slice(0, 4);
}

export async function getEventBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return sampleEvents.find((event) => event.slug === slug) ?? null;
  }

  const { data } = await supabase.from("events").select("*").eq("slug", slug).single();
  return (data as EventRecord | null) ?? null;
}

export async function getAllEventsForAdmin() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return sampleEvents;
  }

  const { data } = await admin.from("events").select("*").order("start_time", { ascending: true });
  return (data as EventRecord[] | null) ?? [];
}

export async function getSubmissionsForAdmin(status?: EventSubmissionRecord["status"]) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return status ? sampleSubmissions.filter((item) => item.status === status) : sampleSubmissions;
  }

  let query = admin.from("event_submissions").select("*").order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return (data as EventSubmissionRecord[] | null) ?? [];
}

export async function findPossibleDuplicates(submission: {
  title: string;
  city: string;
  venue_name: string | null;
  start_time: string;
  ticket_url: string | null;
  source_url: string | null;
}) {
  const { buildDuplicateMatches } = await import("@/lib/dedupe");
  const events = await getAllEventsForAdmin();
  return buildDuplicateMatches(submission, events);
}

export async function getDashboardSummary() {
  const [pendingSubmissions, approvedEvents, rejectedSubmissions] = await Promise.all([
    getSubmissionsForAdmin("pending"),
    getApprovedEvents({ sort: "asc" }),
    getSubmissionsForAdmin("rejected"),
  ]);

  const possibleDuplicates = await Promise.all(
    pendingSubmissions.map(async (submission) => ({
      submission,
      matches: await findPossibleDuplicates(submission),
    })),
  );

  return {
    pendingCount: pendingSubmissions.length,
    approvedCount: approvedEvents.length,
    rejectedCount: rejectedSubmissions.length,
    duplicateCount: possibleDuplicates.filter((item) => item.matches.length > 0).length,
  };
}

export function getEventsHappeningToday(events: EventRecord[]) {
  return events.filter((event) => new Date(event.start_time) <= endOfDay(new Date()));
}
