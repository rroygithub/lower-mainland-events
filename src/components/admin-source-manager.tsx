"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EventSourceConfigRecord, EventSourceType } from "@/lib/types";

const sourceTypes: EventSourceType[] = ["manual", "rss", "html", "eventbrite", "other"];

export function AdminSourceManager({ initialSources }: { initialSources: EventSourceConfigRecord[] }) {
  const [sources, setSources] = useState(initialSources);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    source_type: "rss" as EventSourceType,
    base_url: "",
    city: "",
    category_hint: "",
    notes: "",
    active: true,
  });

  function update(name: string, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveSource() {
    const response = await fetch("/api/admin/source-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "Could not save source.");
      return;
    }

    setSources(data.sources);
    setStatus("Source saved.");
    setForm({
      id: "",
      name: "",
      source_type: "rss",
      base_url: "",
      city: "",
      category_hint: "",
      notes: "",
      active: true,
    });
  }

  async function runImport(sourceConfigId: string) {
    setStatus("Running import...");
    const response = await fetch("/api/admin/import-source", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceConfigId }),
    });

    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? `Imported ${data.count || 0} staged event${data.count === 1 ? "" : "s"}.` : data.error || "Import failed.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <Input placeholder="Source name" value={form.name} onChange={(event) => update("name", event.target.value)} />
          <Select value={form.source_type} onChange={(event) => update("source_type", event.target.value)}>
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Input placeholder="https://source-url" value={form.base_url} onChange={(event) => update("base_url", event.target.value)} />
          <Input placeholder="City" value={form.city} onChange={(event) => update("city", event.target.value)} />
          <Input
            placeholder="Category hint"
            value={form.category_hint}
            onChange={(event) => update("category_hint", event.target.value)}
          />
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} />
            Source is active
          </label>
          <div className="md:col-span-2">
            <Textarea placeholder="Notes" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button onClick={saveSource}>Save source</Button>
            <Button
              variant="secondary"
              onClick={() =>
                setForm({ id: "", name: "", source_type: "rss", base_url: "", city: "", category_hint: "", notes: "", active: true })
              }
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{source.name}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{source.source_type}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {source.active ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{source.base_url}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Last checked: {source.last_checked_at ? new Date(source.last_checked_at).toLocaleString() : "Never"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setForm({
                      id: source.id,
                      name: source.name,
                      source_type: source.source_type,
                      base_url: source.base_url,
                      city: source.city || "",
                      category_hint: source.category_hint || "",
                      notes: source.notes || "",
                      active: Boolean(source.active),
                    })
                  }
                >
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => runImport(source.id)}>
                  Run import
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </div>
  );
}
