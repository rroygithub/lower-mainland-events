import { createClient } from "@supabase/supabase-js";
import { endOfDay } from "date-fns";
import { applyEventFilters } from "@/lib/filters";
import { sampleEvents, sampleSubmissions } from "@/lib/sample-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EventFilters, EventRecord, EventSubmissionRecord } from "@/lib/types";

function createPublicEventsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
  } catch {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getApprovedEvents(filters: EventFilters = {}) {
  const supabase = createPublicEventsClient();

  if (!supabase) {
    return applyEventFilters(
      sampleEvents.filter((event) => event.status === "approved"),
      filters,
    );
  }

  try {
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

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("Failed to fetch approved events from Supabase:", error.message);
      return applyEventFilters(
        sampleEvents.filter((event) => event.status === "approved"),
        filters,
      );
    }

    return applyEventFilters((data as EventRecord[] | null) ?? [], filters);
  } catch (error) {
    console.error("Unexpected approved-events fetch error:", error);
    return applyEventFilters(
      sampleEvents.filter((event) => event.status === "approved"),
      filters,
    );
  }
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
  const supabase = createPublicEventsClient();

  if (!supabase) {
    return sampleEvents.find((event) => event.slug === slug) ?? null;
  }

  try {
    const { data, error } = await supabase.from("events").select("*").eq("slug", slug).single();

    if (error) {
      console.error(`Failed to fetch event by slug "${slug}":`, error.message);
      return sampleEvents.find((event) => event.slug === slug) ?? null;
    }

    return (data as EventRecord | null) ?? null;
  } catch (error) {
    console.error(`Unexpected event lookup error for slug "${slug}":`, error);
    return sampleEvents.find((event) => event.slug === slug) ?? null;
  }
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
