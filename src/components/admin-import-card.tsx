"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories, cities } from "@/lib/constants";
import type { EventImportRecord, EventRecord } from "@/lib/types";

export function AdminImportCard({
  item,
  possibleMatch,
}: {
  item: EventImportRecord;
  possibleMatch: EventRecord | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState({
    title: item.parsed_title || item.raw_title,
    description: item.parsed_description || item.raw_description || "",
    category: item.parsed_category || "Community",
    city: item.parsed_city || item.raw_city || "Other",
    venue_name: item.parsed_venue_name || item.raw_venue || "",
    start_time: item.parsed_start_time ? item.parsed_start_time.slice(0, 16) : "",
    ticket_url: item.parsed_ticket_url || item.raw_url || "",
    poster_url: item.parsed_poster_url || item.raw_image_url || "",
    organizer_name: item.parsed_organizer_name || "",
  });

  function update(name: string, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  async function approve() {
    const response = await fetch("/api/admin/imports/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        importId: item.id,
        edits: {
          ...draft,
          start_time: draft.start_time ? new Date(draft.start_time).toISOString() : null,
        },
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setStatus("Approved.");
      router.refresh();
      return;
    }

    setStatus(data.error || "Approval failed.");
  }

  async function reject() {
    const response = await fetch("/api/admin/imports/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ importId: item.id }),
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      setStatus("Rejected.");
      router.refresh();
      return;
    }

    setStatus(data.error || "Rejection failed.");
  }

  async function merge() {
    if (!possibleMatch) {
      setStatus("No existing match available to merge.");
      return;
    }

    const response = await fetch("/api/admin/imports/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ importId: item.id, eventId: possibleMatch.id }),
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      setStatus("Merged into existing event.");
      router.refresh();
      return;
    }

    setStatus(data.error || "Merge failed.");
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-slate-900">{item.parsed_title || item.raw_title}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{item.import_status}</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">Quality {item.quality_score || 0}</span>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700">Duplicate {item.duplicate_score || 0}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{item.raw_url || "No source URL provided"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={approve}>Approve as new</Button>
            <Button variant="secondary" onClick={merge}>
              Merge
            </Button>
            <Button variant="secondary" onClick={reject}>
              Reject
            </Button>
          </div>
        </div>

        {possibleMatch ? (
          <div className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Imported candidate</p>
              <p className="mt-2 font-medium text-amber-950">{draft.title}</p>
              <p className="mt-1 text-sm text-amber-900">{draft.city} · {draft.venue_name || "Venue TBD"}</p>
              <p className="mt-1 text-sm text-amber-800">{draft.organizer_name || "Organizer TBD"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Possible existing match</p>
              <p className="mt-2 font-medium text-amber-950">{possibleMatch.title}</p>
              <p className="mt-1 text-sm text-amber-900">
                {possibleMatch.city} · {possibleMatch.venue_name || "Venue TBD"}
              </p>
              <p className="mt-1 text-sm text-amber-800">{possibleMatch.organizer_name || "Organizer TBD"}</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Input value={draft.title} onChange={(event) => update("title", event.target.value)} />
          <Select value={draft.category} onChange={(event) => update("category", event.target.value)}>
            {categories.map((itemOption) => (
              <option key={itemOption} value={itemOption}>
                {itemOption}
              </option>
            ))}
          </Select>
          <Select value={draft.city} onChange={(event) => update("city", event.target.value)}>
            {cities.map((itemOption) => (
              <option key={itemOption} value={itemOption}>
                {itemOption}
              </option>
            ))}
          </Select>
          <Input value={draft.venue_name} onChange={(event) => update("venue_name", event.target.value)} placeholder="Venue name" />
          <Input type="datetime-local" value={draft.start_time} onChange={(event) => update("start_time", event.target.value)} />
          <Input value={draft.organizer_name} onChange={(event) => update("organizer_name", event.target.value)} placeholder="Organizer" />
          <Input value={draft.ticket_url} onChange={(event) => update("ticket_url", event.target.value)} placeholder="Ticket URL" />
          <Input value={draft.poster_url} onChange={(event) => update("poster_url", event.target.value)} placeholder="Poster URL" />
          <div className="md:col-span-2">
            <Textarea value={draft.description} onChange={(event) => update("description", event.target.value)} />
          </div>
        </div>
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}
      </CardContent>
    </Card>
  );
}
