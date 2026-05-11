export type EventStatus = "draft" | "pending" | "approved" | "rejected";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type PriceType = "free" | "paid" | "unknown";
export type DateFilter = "today" | "tomorrow" | "this-weekend" | "next-7-days" | "next-30-days" | "all";
export type EventSourceType = "manual" | "rss" | "html" | "eventbrite" | "other";
export type EventImportStatus = "new" | "possible_duplicate" | "approved" | "rejected" | "needs_review";
export type EventReportIssueType = "wrong_date" | "wrong_location" | "duplicate" | "cancelled" | "other";
export type EventReportStatus = "new" | "reviewed" | "resolved";

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

export type EventSourceConfigRecord = {
  id: string;
  name: string;
  source_type: EventSourceType;
  base_url: string;
  city: string | null;
  category_hint: string | null;
  community_hint: string | null;
  active: boolean | null;
  last_checked_at: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type EventImportRecord = {
  id: string;
  source_config_id: string | null;
  raw_title: string;
  raw_description: string | null;
  raw_start_time: string | null;
  raw_end_time: string | null;
  raw_venue: string | null;
  raw_city: string | null;
  raw_url: string | null;
  raw_image_url: string | null;
  parsed_title: string | null;
  parsed_description: string | null;
  parsed_start_time: string | null;
  parsed_end_time: string | null;
  parsed_venue_name: string | null;
  parsed_city: string | null;
  parsed_category: string | null;
  parsed_ticket_url: string | null;
  parsed_poster_url: string | null;
  parsed_organizer_name: string | null;
  parsed_source_name: string | null;
  import_status: EventImportStatus;
  duplicate_score: number | null;
  quality_score: number | null;
  possible_duplicate_event_id: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string | null;
};

export type EventReportRecord = {
  id: string;
  event_id: string | null;
  reporter_email: string | null;
  issue_type: EventReportIssueType | null;
  message: string | null;
  status: EventReportStatus;
  created_at: string | null;
};

export type NewsletterSignupRecord = {
  id: string;
  email: string;
  city: string | null;
  categories: string[] | null;
  created_at: string | null;
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
  "title" | "city" | "venue_name" | "start_time" | "ticket_url" | "source_url" | "organizer_name"
>;

export type EventFilters = {
  q?: string;
  city?: string;
  category?: string;
  date?: DateFilter;
  price?: PriceType | "all";
  sort?: "asc" | "desc" | "recently-added";
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

export type EventQualityResult = {
  score: number;
  needsReview: boolean;
};

export type ParsedImportCandidate = {
  raw_title: string;
  raw_description: string | null;
  raw_start_time: string | null;
  raw_end_time: string | null;
  raw_venue: string | null;
  raw_city: string | null;
  raw_url: string | null;
  raw_image_url: string | null;
  parsed_title: string | null;
  parsed_description: string | null;
  parsed_start_time: string | null;
  parsed_end_time: string | null;
  parsed_venue_name: string | null;
  parsed_city: string | null;
  parsed_category: string | null;
  parsed_ticket_url: string | null;
  parsed_poster_url: string | null;
  parsed_organizer_name: string | null;
  parsed_source_name: string | null;
  raw_payload: Record<string, unknown> | null;
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
      event_sources_config: {
        Row: EventSourceConfigRecord;
        Insert: Partial<EventSourceConfigRecord> & Pick<EventSourceConfigRecord, "name" | "source_type" | "base_url">;
        Update: Partial<EventSourceConfigRecord>;
      };
      event_imports: {
        Row: EventImportRecord;
        Insert: Partial<EventImportRecord> & Pick<EventImportRecord, "raw_title">;
        Update: Partial<EventImportRecord>;
      };
      event_reports: {
        Row: EventReportRecord;
        Insert: Partial<EventReportRecord>;
        Update: Partial<EventReportRecord>;
      };
      newsletter_signups: {
        Row: NewsletterSignupRecord;
        Insert: Partial<NewsletterSignupRecord> & Pick<NewsletterSignupRecord, "email">;
        Update: Partial<NewsletterSignupRecord>;
      };
    };
  };
};
