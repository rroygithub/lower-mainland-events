"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function EventReportForm({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [issueType, setIssueType] = useState("wrong_date");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function submit() {
    const response = await fetch(`/api/events/${eventId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reporter_email: email || null,
        issue_type: issueType,
        message,
      }),
    });

    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Thanks. We’ll review that update." : data.error || "Could not send report.");
    if (response.ok) {
      setEmail("");
      setMessage("");
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Report incorrect information
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <Select value={issueType} onChange={(event) => setIssueType(event.target.value)}>
        <option value="wrong_date">Wrong date</option>
        <option value="wrong_location">Wrong location</option>
        <option value="duplicate">Duplicate listing</option>
        <option value="cancelled">Cancelled</option>
        <option value="other">Other</option>
      </Select>
      <Input
        type="email"
        placeholder="Your email (optional)"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Textarea
        placeholder="Tell us what looks wrong."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={submit}>Send report</Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </div>
  );
}
