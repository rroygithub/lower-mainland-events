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
const ARTICLE_FETCH_TIMEOUT_MS = 5000;
const RSS_IMPORT_ITEM_LIMIT = 12;
const SITE_CRAWL_MAX_PAGES = 18;
const SITE_CRAWL_MAX_DEPTH = 2;
const EVENT_LINK_HOST_PATTERNS = [
  "ticketmaster.",
  "eventbrite.",
  "showpass.",
  "universe.com",
  "bandsintown.com",
  "ticketweb.",
  "tixr.com",
  "admitone.com",
  "simpletix.",
  "dice.fm",
  "seetickets.",
];

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

function looksLikeEventStory(text: string) {
  const normalized = text.toLowerCase();
  return [
    "tour",
    "concert",
    "festival",
    "tickets",
    "live",
    "show",
    "event",
    "performance",
    "vancouver",
  ].some((keyword) => normalized.includes(keyword));
}

function isLikelyEventPath(value: string) {
  const normalized = value.toLowerCase();
  return [
    "/event",
    "/events",
    "/festival",
    "/program",
    "/shows",
    "/tickets",
    "/lineup",
    "/schedule",
  ].some((segment) => normalized.includes(segment));
}

function absolutizeUrl(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function normalizePossiblyRedirectedUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const redirectTarget =
      url.searchParams.get("u") ||
      url.searchParams.get("url") ||
      url.searchParams.get("redirect") ||
      url.searchParams.get("destination") ||
      url.searchParams.get("dest");

    if (redirectTarget) {
      return decodeURIComponent(redirectTarget);
    }

    return url.toString();
  } catch {
    return value;
  }
}

function normalizeCrawlUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.origin}${pathname}${url.search}`;
  } catch {
    return value;
  }
}

function isLikelyEventLink(value?: string | null) {
  const normalized = normalizePossiblyRedirectedUrl(value);
  if (!normalized) {
    return false;
  }

  try {
    const url = new URL(normalized);
    return EVENT_LINK_HOST_PATTERNS.some((pattern) => url.hostname.includes(pattern));
  } catch {
    return false;
  }
}

function extractLikelyEventLinksFromHtml(html: string) {
  const hrefs = [...html.matchAll(/href=["']([^"'#]+)["']/gi)]
    .map((match) => normalizePossiblyRedirectedUrl(match[1]))
    .filter((value): value is string => Boolean(value));

  const textUrls = [...html.matchAll(/https?:\/\/[^\s"'<>]+/gi)]
    .map((match) => normalizePossiblyRedirectedUrl(match[0]))
    .filter((value): value is string => Boolean(value));

  const candidates = [...new Set([...hrefs, ...textUrls])];
  return candidates.filter((candidate) => isLikelyEventLink(candidate));
}

function extractSameOriginLinksFromHtml(html: string, pageUrl: string, origin: string) {
  const urls = [...html.matchAll(/href=["']([^"'#]+)["']/gi)]
    .map((match) => absolutizeUrl(match[1], pageUrl))
    .filter((value): value is string => Boolean(value))
    .map((value) => normalizePossiblyRedirectedUrl(value))
    .filter((value): value is string => Boolean(value))
    .filter((value) => {
      try {
        const url = new URL(value);
        return url.origin === origin;
      } catch {
        return false;
      }
    })
    .filter((value) => !value.includes("/tag/") && !value.includes("/category/") && !value.includes("/author/"));

  return [...new Set(urls.map((value) => normalizeCrawlUrl(value)))];
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

function dedupeCandidates(candidates: ParsedImportCandidate[]) {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = normalizeCrawlUrl(
      candidate.parsed_ticket_url || candidate.raw_url || `${candidate.parsed_title || candidate.raw_title}-${candidate.parsed_start_time || ""}`,
    );

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(ARTICLE_FETCH_TIMEOUT_MS),
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; LowerMainlandEventsBot/1.0; +https://lower-mainland-events.example/importer)",
      "accept-language": "en-US,en;q=0.9",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Source fetch failed with status ${response.status}`);
  }

  return response.text();
}

async function crawlSiteForEventCandidates(source: EventSourceConfigRecord): Promise<ParsedImportCandidate[]> {
  let origin = "";

  try {
    origin = new URL(source.base_url).origin;
  } catch {
    return [];
  }

  const queue: Array<{ url: string; depth: number }> = [{ url: normalizeCrawlUrl(source.base_url), depth: 0 }];
  const visited = new Set<string>();
  const collected: ParsedImportCandidate[] = [];

  while (queue.length && visited.size < SITE_CRAWL_MAX_PAGES) {
    const current = queue.shift();
    if (!current) break;
    if (visited.has(current.url)) continue;
    visited.add(current.url);

    try {
      const html = await fetchHtml(current.url);
      const jsonLdCandidates = parseJsonLdEventsFromHtml(html, {
        ...source,
        base_url: current.url,
      }).map((candidate) => ({
        ...candidate,
        raw_url: current.url,
      }));

      if (jsonLdCandidates.length) {
        collected.push(...jsonLdCandidates);
      }

      const eventLinks = extractLikelyEventLinksFromHtml(html);
      if (!jsonLdCandidates.length && eventLinks.length && isLikelyEventPath(current.url)) {
        collected.push({
          raw_title: current.url.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Imported event",
          raw_description: null,
          raw_start_time: null,
          raw_end_time: null,
          raw_venue: null,
          raw_city: source.city,
          raw_url: current.url,
          raw_image_url: null,
          parsed_title: current.url.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Imported event",
          parsed_description: null,
          parsed_start_time: null,
          parsed_end_time: null,
          parsed_venue_name: null,
          parsed_city: source.city || "Other",
          parsed_category: source.category_hint || "Community",
          parsed_ticket_url: eventLinks[0],
          parsed_poster_url: null,
          parsed_organizer_name: null,
          parsed_source_name: source.name,
          raw_payload: { crawledFrom: current.url, eventLinks },
        });
      }

      if (current.depth < SITE_CRAWL_MAX_DEPTH) {
        const nextLinks = extractSameOriginLinksFromHtml(html, current.url, origin)
          .filter((link) => !visited.has(link))
          .sort((left, right) => {
            const leftScore = Number(isLikelyEventPath(left));
            const rightScore = Number(isLikelyEventPath(right));
            return rightScore - leftScore;
          });

        for (const link of nextLinks) {
          queue.push({ url: link, depth: current.depth + 1 });
        }
      }
    } catch (error) {
      console.warn(`Site crawl fetch failed for ${current.url}:`, error);
    }
  }

  return dedupeCandidates(collected);
}

async function resolveRssItemToCandidates(
  item: Parser.Item,
  source: EventSourceConfigRecord,
): Promise<ParsedImportCandidate[]> {
  const baseCandidate: ParsedImportCandidate = {
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
    parsed_ticket_url: null,
    parsed_poster_url: null,
    parsed_organizer_name: null,
    parsed_source_name: source.name,
    raw_payload: item as unknown as Record<string, unknown>,
  };

  const articleUrl = item.link || source.base_url;

  try {
    const html = await fetchHtml(articleUrl);
    const jsonLdCandidates = parseJsonLdEventsFromHtml(html, source).map((candidate) => ({
      ...candidate,
      raw_url: articleUrl,
      parsed_ticket_url: normalizePossiblyRedirectedUrl(candidate.parsed_ticket_url) || extractLikelyEventLinksFromHtml(html)[0] || null,
      parsed_poster_url: candidate.parsed_poster_url || baseCandidate.raw_image_url,
      raw_payload: {
        rss: item as unknown as Record<string, unknown>,
        jsonLd: candidate.raw_payload,
      },
    }));

    if (jsonLdCandidates.length) {
      return jsonLdCandidates;
    }

    const eventLinks = extractLikelyEventLinksFromHtml(html);
    if (eventLinks.length) {
      return [
        {
          ...baseCandidate,
          parsed_ticket_url: eventLinks[0],
          parsed_poster_url: baseCandidate.raw_image_url,
        },
      ];
    }
  } catch (error) {
    console.warn(`RSS article follow-up failed for ${articleUrl}:`, error);
  }

  if (!looksLikeEventStory(`${baseCandidate.raw_title} ${baseCandidate.raw_description || ""}`)) {
    return [];
  }

  return [
    {
      ...baseCandidate,
      parsed_ticket_url: null,
      parsed_start_time: null,
    },
  ];
}

async function parseRssSource(source: EventSourceConfigRecord): Promise<ParsedImportCandidate[]> {
  const feed = await rssParser.parseURL(source.base_url);
  const items = (feed.items || []).slice(0, RSS_IMPORT_ITEM_LIMIT);
  const resolved = await Promise.all(items.map((item) => resolveRssItemToCandidates(item, source)));
  return resolved.flat();
}

async function parseHtmlOrManualSource(source: EventSourceConfigRecord): Promise<ParsedImportCandidate[]> {
  const directHtml = await fetchHtml(source.base_url);
  const directCandidates = parseJsonLdEventsFromHtml(directHtml, source);

  if (directCandidates.length) {
    return dedupeCandidates(directCandidates);
  }

  return crawlSiteForEventCandidates(source);
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
