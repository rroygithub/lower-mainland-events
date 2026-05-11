export type EventStatus = "draft" | "pending" | "approved" | "rejected";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type PriceType = "free" | "paid" | "unknown";
export type DateFilter = "today" | "tomorrow" | "this-weekend" | "next-7-days" | "next-30-days" | "all";

export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  community: string | null;
  city: string;
  venue_name: string | null;
  venue_address: string | null;
  start_time: string;
  end_time: string | null;
  price_type: PriceType;
  price_display: string | null;
  ticket_url: string | null;
  source_url: string | null;
  source_name: string | null;
  organizer_name: string | null;
  poster_url: string | null;
  status: EventStatus;
  is_featured: boolean | null;
  duplicate_group_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type EventSubmissionRecord = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  city: string;
  venue_name: string | null;
  venue_address: string | null;
  start_time: string;
  end_time: string | null;
  price_type: PriceType;
  price_display: string | null;
  ticket_url: string | null;
  source_url: string | null;
  organizer_name: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  poster_url: string | null;
  status: SubmissionStatus;
  possible_duplicate_event_id: string | null;
  created_at: string | null;
};

export type EventLike = Pick<
  EventRecord,
  "title" | "city" | "venue_name" | "start_time" | "ticket_url" | "source_url"
>;

export type EventFilters = {
  q?: string;
  city?: string;
  category?: string;
  date?: DateFilter;
  price?: PriceType | "all";
  sort?: "asc" | "desc";
};

export type DuplicateCheckResult = {
  eventId: string;
  title: string;
  slug: string;
  score: number;
  matchType: "likely duplicate" | "possible duplicate" | "not duplicate";
  city: string;
  start_time: string;
};

export type Database = {
  public: {
    Tables: {
      events: {
        Row: EventRecord;
        Insert: Partial<EventRecord> & Pick<EventRecord, "title" | "slug" | "category" | "city" | "start_time">;
        Update: Partial<EventRecord>;
      };
      event_submissions: {
        Row: EventSubmissionRecord;
        Insert: Partial<EventSubmissionRecord> &
          Pick<EventSubmissionRecord, "title" | "category" | "city" | "start_time">;
        Update: Partial<EventSubmissionRecord>;
      };
      venues: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          city: string;
          latitude: number | null;
          longitude: number | null;
          created_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      event_sources: {
        Row: {
          id: string;
          event_id: string | null;
          source_name: string;
          source_url: string;
          discovered_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
  };
};
