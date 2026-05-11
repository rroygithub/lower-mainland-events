import Parser from "rss-parser";
import { categories } from "@/lib/constants";
import { scoreImportedCandidateQuality } from "@/lib/event-quality";
import type {
  EventImportRecord,
  EventLike,
  EventRecord,
  EventSourceConfigRecord,
  ParsedImportCandidate,
} from "@/lib/types";
import { buildDuplicateMatches, classifyDuplicateScore } from "@/lib/dedupe";

const rssParser = new Parser();

function maybeIsoDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function inferCategory(text: string, fallback?: string | null) {
  if (fallback) {
    return fallback;
  }

  const normalized = text.toLowerCase();
  const match = categories.find((category) => normalized.includes(category.toLowerCase().split(" / ")[0]));
  return match ?? "Community";
}

function toCandidateLike(candidate: ParsedImportCandidate): EventLike {
  return {
    title: candidate.parsed_title || candidate.raw_title,
    city: candidate.parsed_city || candidate.raw_city || "Other",
    venue_name: candidate.parsed_venue_name,
    start_time: candidate.parsed_start_time || new Date().toISOString(),
    ticket_url: candidate.parsed_ticket_url || candidate.raw_url,
    source_url: candidate.raw_url,
    organizer_name: candidate.parsed_organizer_name,
  };
}

function flattenJsonLdNode(node: unknown): unknown[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(flattenJsonLdNode);
  if (typeof node === "object" && node && "@graph" in node) {
    const graph = (node as { "@graph"?: unknown[] })["@graph"];
    return Array.isArray(graph) ? graph.flatMap(flattenJsonLdNode) : [node];
  }
  return [node];
}

function parseJsonLdEventsFromHtml(html: string, source: EventSourceConfigRecord): ParsedImportCandidate[] {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const events: ParsedImportCandidate[] = [];

  for (const match of matches) {
    try {
      const parsed = JSON.parse(match[1]);
      const nodes = flattenJsonLdNode(parsed);

      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const typeValue = Array.isArray((node as { "@type"?: unknown })["@type"])
          ? ((node as { "@type"?: string[] })["@type"] || []).join(" ")
          : String((node as { "@type"?: string })["@type"] || "");

        if (!typeValue.toLowerCase().includes("event")) continue;

        const location = (node as { location?: { name?: string; address?: unknown } }).location;
        const offers = (node as { offers?: { url?: string; price?: string } | { url?: string; price?: string }[] }).offers;
        const organizer = (node as { organizer?: { name?: string } }).organizer;
        const image = (node as { image?: string | string[] }).image;

        events.push({
          raw_title: String((node as { name?: string }).name || "Untitled event"),
          raw_description: String((node as { description?: string }).description || ""),
          raw_start_time: String((node as { startDate?: string }).startDate || ""),
          raw_end_time: String((node as { endDate?: string }).endDate || ""),
          raw_venue: location?.name || null,
          raw_city:
            typeof location?.address === "object" && location?.address && "addressLocality" in location.address
              ? String((location.address as { addressLocality?: string }).addressLocality || "")
              : source.city,
          raw_url: String((node as { url?: string }).url || source.base_url),
          raw_image_url: Array.isArray(image) ? image[0] || null : image || null,
          parsed_title: String((node as { name?: string }).name || ""),
          parsed_description: String((node as { description?: string }).description || ""),
          parsed_start_time: maybeIsoDate((node as { startDate?: string }).startDate),
          parsed_end_time: maybeIsoDate((node as { endDate?: string }).endDate),
          parsed_venue_name: location?.name || null,
          parsed_city:
            typeof location?.address === "object" && location?.address && "addressLocality" in location.address
              ? String((location.address as { addressLocality?: string }).addressLocality || "")
              : source.city || "Other",
          parsed_category: inferCategory(
            `${String((node as { name?: string }).name || "")} ${String((node as { description?: string }).description || "")}`,
            source.category_hint,
          ),
          parsed_ticket_url: Array.isArray(offers) ? offers[0]?.url || null : offers?.url || null,
          parsed_poster_url: Array.isArray(image) ? image[0] || null : image || null,
          parsed_organizer_name: organizer?.name || null,
          parsed_source_name: source.name,
          raw_payload: node as Record<string, unknown>,
        });
      }
    } catch {
      // Skip invalid JSON-LD blocks from third-party pages.
    }
  }

  return events;
}

async function parseRssSource(source: EventSourceConfigRecord): Promise<ParsedImportCandidate[]> {
  const feed = await rssParser.parseURL(source.base_url);
  return (feed.items || []).map((item) => ({
    raw_title: item.title || "Untitled event",
    raw_description: item.contentSnippet || item.content || item.summary || "",
    raw_start_time: item.isoDate || item.pubDate || null,
    raw_end_time: null,
    raw_venue: null,
    raw_city: source.city,
    raw_url: item.link || source.base_url,
    raw_image_url: null,
    parsed_title: item.title || "",
    parsed_description: item.contentSnippet || item.content || item.summary || "",
    parsed_start_time: maybeIsoDate(item.isoDate || item.pubDate || null),
    parsed_end_time: null,
    parsed_venue_name: null,
    parsed_city: source.city || "Other",
    parsed_category: inferCategory(`${item.title || ""} ${item.contentSnippet || item.content || ""}`, source.category_hint),
    parsed_ticket_url: item.link || null,
    parsed_poster_url: null,
    parsed_organizer_name: null,
    parsed_source_name: source.name,
    raw_payload: item as unknown as Record<string, unknown>,
  }));
}

async function parseHtmlOrManualSource(source: EventSourceConfigRecord): Promise<ParsedImportCandidate[]> {
  const response = await fetch(source.base_url, {
    signal: AbortSignal.timeout(8000),
    headers: {
      "user-agent": "LowerMainlandEventsBot/1.0 (+community event ingestion)",
    },
  });

  if (!response.ok) {
    throw new Error(`Source fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  return parseJsonLdEventsFromHtml(html, source);
}

export async function fetchImportCandidatesForSource(source: EventSourceConfigRecord) {
  switch (source.source_type) {
    case "rss":
      return parseRssSource(source);
    case "manual":
    case "html":
    case "eventbrite":
    case "other":
      return parseHtmlOrManualSource(source);
    default:
      return [];
  }
}

export function buildImportRows(
  source: EventSourceConfigRecord,
  candidates: ParsedImportCandidate[],
  existingEvents: EventRecord[],
) {
  return candidates.map((candidate) => {
    const duplicateMatches = buildDuplicateMatches(toCandidateLike(candidate), existingEvents);
    const topMatch = duplicateMatches[0];
    const quality = scoreImportedCandidateQuality(candidate);

    let importStatus: EventImportRecord["import_status"] = "new";

    if (!candidate.parsed_start_time || quality.needsReview) {
      importStatus = "needs_review";
    } else if (topMatch?.score && topMatch.score >= 80) {
      importStatus = "possible_duplicate";
    } else if (topMatch?.score && topMatch.score >= 60) {
      importStatus = "possible_duplicate";
    }

    return {
      source_config_id: source.id,
      ...candidate,
      import_status: importStatus,
      duplicate_score: topMatch?.score || 0,
      quality_score: quality.score,
      possible_duplicate_event_id: topMatch?.eventId || null,
    };
  });
}

export function getImportMatchLabel(score: number) {
  return classifyDuplicateScore(score);
}
