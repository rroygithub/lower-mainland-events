import { differenceInHours, isSameDay } from "date-fns";
import type { DuplicateCheckResult, EventLike } from "@/lib/types";
import { slugify } from "@/lib/utils";

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    url.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"].forEach((key) =>
      url.searchParams.delete(key),
    );
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.origin.toLowerCase()}${pathname}${url.search ? `?${url.searchParams.toString()}` : ""}`;
  } catch {
    return value.trim().toLowerCase();
  }
}

export function jaccardSimilarity(left: string, right: string) {
  const leftTokens = new Set(normalizeText(left).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeText(right).split(" ").filter(Boolean));

  if (!leftTokens.size || !rightTokens.size) {
    return 0;
  }

  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;

  return intersection / union;
}

export function levenshteinSimilarity(left: string, right: string) {
  const a = normalizeText(left);
  const b = normalizeText(right);

  if (!a && !b) {
    return 1;
  }

  if (!a || !b) {
    return 0;
  }

  const matrix = Array.from({ length: b.length + 1 }, (_, row) =>
    Array.from({ length: a.length + 1 }, (_, column) => (row === 0 ? column : column === 0 ? row : 0)),
  );

  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      const cost = b[row - 1] === a[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  const distance = matrix[b.length][a.length];
  return 1 - distance / Math.max(a.length, b.length);
}

export function calculateDuplicateScore(candidate: EventLike, existing: EventLike) {
  let score = 0;

  const normalizedTicketCandidate = normalizeUrl(candidate.ticket_url);
  const normalizedTicketExisting = normalizeUrl(existing.ticket_url);
  const normalizedSourceCandidate = normalizeUrl(candidate.source_url);
  const normalizedSourceExisting = normalizeUrl(existing.source_url);

  if (normalizedTicketCandidate && normalizedTicketCandidate === normalizedTicketExisting) {
    score += 45;
  }

  if (normalizedSourceCandidate && normalizedSourceCandidate === normalizedSourceExisting) {
    score += 35;
  }

  const candidateDate = new Date(candidate.start_time);
  const existingDate = new Date(existing.start_time);

  if (isSameDay(candidateDate, existingDate)) {
    score += 25;
  }

  if (Math.abs(differenceInHours(candidateDate, existingDate)) <= 3) {
    score += 15;
  }

  if (normalizeText(candidate.city) === normalizeText(existing.city)) {
    score += 10;
  }

  const venueSimilarity = Math.max(
    jaccardSimilarity(candidate.venue_name || "", existing.venue_name || ""),
    levenshteinSimilarity(candidate.venue_name || "", existing.venue_name || ""),
  );

  if (venueSimilarity > 0.8) {
    score += 15;
  }

  const titleSimilarity = Math.max(
    jaccardSimilarity(candidate.title, existing.title),
    levenshteinSimilarity(candidate.title, existing.title),
  );

  if (titleSimilarity > 0.9) {
    score += 35;
  } else if (titleSimilarity >= 0.75) {
    score += 25;
  }

  const organizerSimilarity = Math.max(
    jaccardSimilarity(candidate.organizer_name || "", existing.organizer_name || ""),
    levenshteinSimilarity(candidate.organizer_name || "", existing.organizer_name || ""),
  );

  if (organizerSimilarity > 0.8) {
    score += 10;
  }

  return score;
}

export function classifyDuplicateScore(score: number): DuplicateCheckResult["matchType"] {
  if (score >= 80) {
    return "likely duplicate";
  }

  if (score >= 60) {
    return "possible duplicate";
  }

  return "not duplicate";
}

export function buildDuplicateMatches<T extends EventLike & { id: string; slug?: string }>(
  incoming: EventLike,
  events: T[],
) {
  return events
    .map((event) => {
      const score = calculateDuplicateScore(incoming, event);

      return {
        eventId: event.id,
        title: event.title,
        slug: event.slug ?? slugify(event.title),
        score,
        matchType: classifyDuplicateScore(score),
        city: event.city,
        start_time: event.start_time,
      } satisfies DuplicateCheckResult;
    })
    .filter((event) => event.score >= 60)
    .sort((left, right) => right.score - left.score);
}
