"use client";

import { useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories, cities } from "@/lib/constants";
import { formatEventDateTimeRange } from "@/lib/date";
import type { DuplicateCheckResult, EventSubmissionRecord } from "@/lib/types";

type EditableSubmission = Pick<
  EventSubmissionRecord,
  | "title"
  | "description"
  | "category"
  | "city"
  | "venue_name"
  | "venue_address"
  | "start_time"
  | "end_time"
  | "price_type"
  | "price_display"
  | "ticket_url"
  | "source_url"
  | "organizer_name"
  | "poster_url"
>;

export function AdminSubmissionCard({
  submission,
  duplicateMatches,
}: {
  submission: EventSubmissionRecord;
  duplicateMatches: DuplicateCheckResult[];
}) {
  const [draft, setDraft] = useState<EditableSubmission>(submission);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState<"" | "approve" | "reject">("");

  function update<K extends keyof EditableSubmission>(key: K, value: EditableSubmission[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function approve() {
    setLoading("approve");
    setStatusMessage("");

    const response = await fetch("/api/admin/approve-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId: submission.id,
        edits: draft,
        duplicateEventId: duplicateMatches[0]?.eventId || null,
      }),
    });

    setLoading("");
    setStatusMessage(response.ok ? "Submission approved and copied into events." : "Approval failed.");
  }

  async function reject() {
    setLoading("reject");
    setStatusMessage("");

    const response = await fetch("/api/admin/reject-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: submission.id }),
    });

    setLoading("");
    setStatusMessage(response.ok ? "Submission rejected." : "Rejection failed.");
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{submission.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{formatEventDateTimeRange(submission.start_time, submission.end_time)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={approve} disabled={loading !== ""}>
              <Check className="mr-2 h-4 w-4" />
              {loading === "approve" ? "Approving..." : "Approve"}
            </Button>
            <Button variant="secondary" onClick={reject} disabled={loading !== ""}>
              <X className="mr-2 h-4 w-4" />
              {loading === "reject" ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        </div>

        {duplicateMatches.length ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Possible duplicates found</p>
                <div className="mt-2 space-y-1 text-sm text-amber-800">
                  {duplicateMatches.map((match) => (
                    <p key={match.eventId}>
                      {match.title} in {match.city} · score {match.score}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input value={draft.title || ""} onChange={(event) => update("title", event.target.value)} />
          </Field>
          <Field label="Category">
            <Select value={draft.category || ""} onChange={(event) => update("category", event.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="City">
            <Select value={draft.city || ""} onChange={(event) => update("city", event.target.value)}>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Venue name">
            <Input value={draft.venue_name || ""} onChange={(event) => update("venue_name", event.target.value)} />
          </Field>
          <Field label="Venue address">
            <Input value={draft.venue_address || ""} onChange={(event) => update("venue_address", event.target.value)} />
          </Field>
          <Field label="Start time">
            <Input
              type="datetime-local"
              value={draft.start_time?.slice(0, 16) || ""}
              onChange={(event) => update("start_time", new Date(event.target.value).toISOString())}
            />
          </Field>
          <Field label="End time">
            <Input
              type="datetime-local"
              value={draft.end_time?.slice(0, 16) || ""}
              onChange={(event) => update("end_time", event.target.value ? new Date(event.target.value).toISOString() : null)}
            />
          </Field>
          <Field label="Price type">
            <Select value={draft.price_type || "unknown"} onChange={(event) => update("price_type", event.target.value as EventSubmissionRecord["price_type"])}>
              <option value="unknown">Price TBD</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </Select>
          </Field>
          <Field label="Price display">
            <Input value={draft.price_display || ""} onChange={(event) => update("price_display", event.target.value)} />
          </Field>
          <Field label="Ticket URL">
            <Input value={draft.ticket_url || ""} onChange={(event) => update("ticket_url", event.target.value)} />
          </Field>
          <Field label="Source URL">
            <Input value={draft.source_url || ""} onChange={(event) => update("source_url", event.target.value)} />
          </Field>
          <Field label="Organizer">
            <Input value={draft.organizer_name || ""} onChange={(event) => update("organizer_name", event.target.value)} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={draft.description || ""} onChange={(event) => update("description", event.target.value)} />
        </Field>
        {statusMessage ? <p className="text-sm text-slate-600">{statusMessage}</p> : null}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
