import type { EventQualityResult, ParsedImportCandidate } from "@/lib/types";

export function scoreEventQuality(candidate: {
  title?: string | null;
  description?: string | null;
  start_time?: string | null;
  venue_name?: string | null;
  city?: string | null;
  ticket_url?: string | null;
  source_url?: string | null;
  poster_url?: string | null;
  category?: string | null;
}): EventQualityResult {
  let score = 0;

  if (candidate.title?.trim()) score += 15;
  if ((candidate.description || "").trim().length > 80) score += 15;
  if (candidate.start_time && !Number.isNaN(new Date(candidate.start_time).getTime())) score += 20;
  if (candidate.venue_name?.trim()) score += 15;
  if (candidate.city?.trim()) score += 10;
  if (candidate.ticket_url?.trim() || candidate.source_url?.trim()) score += 10;
  if (candidate.poster_url?.trim()) score += 10;
  if (candidate.category?.trim()) score += 5;

  return {
    score,
    needsReview: score < 60,
  };
}

export function scoreImportedCandidateQuality(candidate: ParsedImportCandidate) {
  return scoreEventQuality({
    title: candidate.parsed_title,
    description: candidate.parsed_description,
    start_time: candidate.parsed_start_time,
    venue_name: candidate.parsed_venue_name,
    city: candidate.parsed_city,
    ticket_url: candidate.parsed_ticket_url,
    source_url: candidate.raw_url,
    poster_url: candidate.parsed_poster_url,
    category: candidate.parsed_category,
  });
}
