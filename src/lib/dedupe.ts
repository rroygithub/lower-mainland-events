import { isSameDay } from "date-fns";
import type { DuplicateCheckResult, EventLike } from "@/lib/types";
import { slugify } from "@/lib/utils";

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function jaccardSimilarity(left: string, right: string) {
  const leftTokens = new Set(normalizeText(left).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeText(right).split(" ").filter(Boolean));

  if (!leftTokens.size || !rightTokens.size) {
    return 0;
  }

  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;

  return intersection / union;
}

export function scorePotentialDuplicate(submission: EventLike, existingEvent: EventLike) {
  let score = 0;

  if (submission.ticket_url && existingEvent.ticket_url && submission.ticket_url === existingEvent.ticket_url) {
    score += 40;
  }

  if (submission.source_url && existingEvent.source_url && submission.source_url === existingEvent.source_url) {
    score += 40;
  }

  if (isSameDay(new Date(submission.start_time), new Date(existingEvent.start_time))) {
    score += 25;
  }

  if (normalizeText(submission.city) === normalizeText(existingEvent.city)) {
    score += 10;
  }

  if (
    submission.venue_name &&
    existingEvent.venue_name &&
    normalizeText(submission.venue_name) === normalizeText(existingEvent.venue_name)
  ) {
    score += 15;
  }

  const titleSimilarity = jaccardSimilarity(submission.title, existingEvent.title);

  if (titleSimilarity >= 0.85) {
    score += 35;
  } else if (titleSimilarity >= 0.7) {
    score += 20;
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
      const score = scorePotentialDuplicate(incoming, event);

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
