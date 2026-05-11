/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import { endOfDay } from "date-fns";
import { applyEventFilters } from "@/lib/filters";
import { buildImportRows } from "@/lib/importers";
import {
  sampleEvents,
  sampleImports,
  sampleNewsletterSignups,
  sampleReports,
  sampleSources,
  sampleSubmissions,
} from "@/lib/sample-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  EventFilters,
  EventImportRecord,
  EventRecord,
  EventReportRecord,
  EventSourceConfigRecord,
  EventSubmissionRecord,
  NewsletterSignupRecord,
  ParsedImportCandidate,
} from "@/lib/types";

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

function getAdminClient() {
  return createSupabaseAdminClient() as ReturnType<typeof createSupabaseAdminClient> & {
    from: (table: string) => any;
  };
}

function approvedFallback(filters: EventFilters = {}) {
  return applyEventFilters(
    sampleEvents.filter((event) => event.status === "approved"),
    filters,
  );
}

export async function getApprovedEvents(filters: EventFilters = {}) {
  const supabase = createPublicEventsClient();

  if (!supabase) {
    return approvedFallback(filters);
  }

  try {
    let query = supabase
      .from("events")
      .select("*")
      .eq("status", "approved")
      .gte("start_time", new Date().toISOString());

    if (filters.city && filters.city !== "all") {
      query = query.eq("city", filters.city);
    }

    if (filters.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    if (filters.price && filters.price !== "all") {
      query = query.eq("price_type", filters.price);
    }

    query =
      filters.sort === "recently-added"
        ? query.order("created_at", { ascending: false })
        : query.order("start_time", { ascending: filters.sort !== "desc" });

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("Failed to fetch approved events from Supabase:", error.message);
      return approvedFallback(filters);
    }

    return applyEventFilters((data as EventRecord[] | null) ?? [], filters);
  } catch (error) {
    console.error("Unexpected approved-events fetch error:", error);
    return approvedFallback(filters);
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

export async function getRecentlyAddedEvents() {
  const events = await getApprovedEvents({ sort: "recently-added" });
  return events.slice(0, 6);
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

export async function getEventById(id: string) {
  const supabase = createPublicEventsClient();

  if (!supabase) {
    return sampleEvents.find((event) => event.id === id) ?? null;
  }

  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();

  if (error) {
    return sampleEvents.find((event) => event.id === id) ?? null;
  }

  return (data as EventRecord | null) ?? null;
}

export async function getAllEventsForAdmin() {
  const admin = getAdminClient();
  if (!admin) {
    return sampleEvents;
  }

  const { data } = await admin.from("events").select("*").order("start_time", { ascending: true });
  return (data as EventRecord[] | null) ?? [];
}

export async function getSubmissionsForAdmin(status?: EventSubmissionRecord["status"]) {
  const admin = getAdminClient();
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

export async function getSourceConfigsForAdmin() {
  const admin = getAdminClient();
  if (!admin) {
    return sampleSources;
  }

  const { data } = await admin.from("event_sources_config").select("*").order("created_at", { ascending: false });
  return (data as EventSourceConfigRecord[] | null) ?? [];
}

export async function getSourceConfigById(id: string) {
  const admin = getAdminClient();
  if (!admin) {
    return sampleSources.find((item) => item.id === id) ?? null;
  }

  const { data } = await admin.from("event_sources_config").select("*").eq("id", id).single();
  return (data as EventSourceConfigRecord | null) ?? null;
}

export async function getEventImportsForAdmin(status?: EventImportRecord["import_status"]) {
  const admin = getAdminClient();
  if (!admin) {
    return status ? sampleImports.filter((item) => item.import_status === status) : sampleImports;
  }

  let query = admin.from("event_imports").select("*").order("created_at", { ascending: false });
  if (status) {
    query = query.eq("import_status", status);
  }

  const { data } = await query;
  return (data as EventImportRecord[] | null) ?? [];
}

export async function getEventImportById(id: string) {
  const admin = getAdminClient();
  if (!admin) {
    return sampleImports.find((item) => item.id === id) ?? null;
  }

  const { data } = await admin.from("event_imports").select("*").eq("id", id).single();
  return (data as EventImportRecord | null) ?? null;
}

export async function getEventReportsForAdmin(status?: EventReportRecord["status"]) {
  const admin = getAdminClient();
  if (!admin) {
    return status ? sampleReports.filter((item) => item.status === status) : sampleReports;
  }

  let query = admin.from("event_reports").select("*").order("created_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return (data as EventReportRecord[] | null) ?? [];
}

export async function getNewsletterSignupsForAdmin() {
  const admin = getAdminClient();
  if (!admin) {
    return sampleNewsletterSignups;
  }

  const { data } = await admin.from("newsletter_signups").select("*").order("created_at", { ascending: false });
  return (data as NewsletterSignupRecord[] | null) ?? [];
}

export async function findPossibleDuplicates(submission: {
  title: string;
  city: string;
  venue_name: string | null;
  start_time: string;
  ticket_url: string | null;
  source_url: string | null;
  organizer_name?: string | null;
}) {
  const { buildDuplicateMatches } = await import("@/lib/dedupe");
  const events = await getAllEventsForAdmin();
  return buildDuplicateMatches(
    {
      ...submission,
      organizer_name: submission.organizer_name || null,
    },
    events,
  );
}

export async function getDashboardSummary() {
  const [pendingSubmissions, approvedEvents, rejectedSubmissions, stagedImports, reports] = await Promise.all([
    getSubmissionsForAdmin("pending"),
    getApprovedEvents({ sort: "asc" }),
    getSubmissionsForAdmin("rejected"),
    getEventImportsForAdmin(),
    getEventReportsForAdmin("new"),
  ]);

  const possibleDuplicates = stagedImports.filter((item) => item.import_status === "possible_duplicate");

  return {
    pendingCount: pendingSubmissions.length,
    approvedCount: approvedEvents.length,
    rejectedCount: rejectedSubmissions.length,
    duplicateCount: possibleDuplicates.length,
    importCount: stagedImports.length,
    reportCount: reports.length,
  };
}

export async function stageImportedCandidates(source: EventSourceConfigRecord, candidates: ParsedImportCandidate[]) {
  const admin = getAdminClient();
  const existingEvents = await getAllEventsForAdmin();
  const rows = buildImportRows(source, candidates, existingEvents);

  if (!admin) {
    return rows;
  }

  if (rows.length) {
    const { error } = await (admin.from("event_imports") as any).insert(rows);
    if (error) {
      throw new Error(error.message);
    }
  }

  await (admin
    .from("event_sources_config") as any)
    .update({ last_checked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", source.id);

  return rows;
}

export function getEventsHappeningToday(events: EventRecord[]) {
  return events.filter((event) => new Date(event.start_time) <= endOfDay(new Date()));
}
