import { addDays, setHours, setMinutes } from "date-fns";
import type { EventRecord } from "@/lib/types";

export const cities = [
  "Vancouver",
  "Surrey",
  "Burnaby",
  "Richmond",
  "Delta",
  "Langley",
  "Coquitlam",
  "New Westminster",
  "North Vancouver",
  "West Vancouver",
  "Abbotsford",
  "Other",
] as const;

export const categories = [
  "Classical Music",
  "Bollywood / Popular Music",
  "Dance",
  "Festival",
  "Religious / Spiritual",
  "Food",
  "Business / Networking",
  "Kids / Family",
  "Wellness / Yoga",
  "Community",
  "Other",
] as const;

export const priceTypes = [
  { value: "all", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "unknown", label: "Price TBD" },
] as const;

export const dateFilters = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this-weekend", label: "This weekend" },
  { value: "next-7-days", label: "Next 7 days" },
  { value: "next-30-days", label: "Next 30 days" },
] as const;

export const posterFallbacks = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
];

const now = new Date();

export const demoEvents: EventRecord[] = [
  {
    id: "evt-1",
    title: "Raga Under the Stars",
    slug: "raga-under-the-stars",
    description:
      "An intimate evening of Hindustani classical music with sitar, tabla, and vocal performances by Lower Mainland artists.",
    category: "Classical Music",
    community: "Indian / South Asian",
    city: "Vancouver",
    venue_name: "Roundhouse Community Arts Hall",
    venue_address: "181 Roundhouse Mews, Vancouver",
    start_time: setMinutes(setHours(addDays(now, 2), 19), 30).toISOString(),
    end_time: setMinutes(setHours(addDays(now, 2), 22), 0).toISOString(),
    price_type: "paid",
    price_display: "$28",
    ticket_url: "https://example.com/raga-under-the-stars",
    source_url: "https://example.com/raga-under-the-stars",
    source_name: "Indian Summer Festival",
    organizer_name: "Raag Collective BC",
    poster_url: posterFallbacks[0],
    status: "approved",
    is_featured: true,
    duplicate_group_id: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: "evt-2",
    title: "Surrey Vaisakhi Family Fair",
    slug: "surrey-vaisakhi-family-fair",
    description:
      "A day of Punjabi food stalls, kids activities, live dance, and community booths celebrating Vaisakhi.",
    category: "Festival",
    community: "Indian / South Asian",
    city: "Surrey",
    venue_name: "Cloverdale Fairgrounds",
    venue_address: "6050A 176 St, Surrey",
    start_time: setMinutes(setHours(addDays(now, 5), 11), 0).toISOString(),
    end_time: setMinutes(setHours(addDays(now, 5), 18), 0).toISOString(),
    price_type: "free",
    price_display: "Free entry",
    ticket_url: null,
    source_url: "https://example.com/surrey-vaisakhi-family-fair",
    source_name: "Submitted by organizer",
    organizer_name: "Punjab Community Network",
    poster_url: posterFallbacks[1],
    status: "approved",
    is_featured: true,
    duplicate_group_id: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: "evt-3",
    title: "Burnaby Bharatanatyam Showcase",
    slug: "burnaby-bharatanatyam-showcase",
    description:
      "Emerging dancers present a contemporary Bharatanatyam repertoire with live nattuvangam and violin accompaniment.",
    category: "Dance",
    community: "Indian / South Asian",
    city: "Burnaby",
    venue_name: "Shadbolt Centre Studio Theatre",
    venue_address: "6450 Deer Lake Ave, Burnaby",
    start_time: setMinutes(setHours(addDays(now, 7), 18), 30).toISOString(),
    end_time: setMinutes(setHours(addDays(now, 7), 20), 45).toISOString(),
    price_type: "paid",
    price_display: "$22",
    ticket_url: "https://example.com/burnaby-bharatanatyam-showcase",
    source_url: "https://example.com/burnaby-bharatanatyam-showcase",
    source_name: "Eventbrite",
    organizer_name: "Nritya Vancouver",
    poster_url: posterFallbacks[2],
    status: "approved",
    is_featured: false,
    duplicate_group_id: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
];

export const weekendSectionTitle = "This weekend";
