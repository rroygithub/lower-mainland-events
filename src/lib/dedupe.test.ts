import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateDuplicateScore,
  classifyDuplicateScore,
  levenshteinSimilarity,
  normalizeText,
  normalizeUrl,
} from "@/lib/dedupe";

test("normalizeText strips punctuation and normalizes spacing", () => {
  assert.equal(normalizeText("  Vaisakhi!  Surrey  Parade "), "vaisakhi surrey parade");
});

test("normalizeUrl removes tracking params", () => {
  assert.equal(
    normalizeUrl("https://example.com/event?utm_source=test&id=123"),
    "https://example.com/event?id=123",
  );
});

test("levenshteinSimilarity detects near matches", () => {
  assert.ok(levenshteinSimilarity("Surrey Garba Night", "Surrey Garba Nite") > 0.8);
});

test("calculateDuplicateScore identifies likely duplicates", () => {
  const score = calculateDuplicateScore(
    {
      title: "Surrey Community Garba Night",
      city: "Surrey",
      venue_name: "Newton Recreation Hall",
      start_time: "2026-06-01T18:30:00.000Z",
      ticket_url: "https://tickets.example.com/garba?utm_source=meta",
      source_url: "https://example.com/garba-night",
      organizer_name: "Gujarati Cultural Circle",
    },
    {
      title: "Surrey Community Garba Night 2026",
      city: "Surrey",
      venue_name: "Newton Recreation Hall",
      start_time: "2026-06-01T20:00:00.000Z",
      ticket_url: "https://tickets.example.com/garba",
      source_url: "https://example.com/garba-night",
      organizer_name: "Gujarati Cultural Circle",
    },
  );

  assert.ok(score >= 80);
  assert.equal(classifyDuplicateScore(score), "likely duplicate");
});
