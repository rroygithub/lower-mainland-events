"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, cities } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  title: string;
  description: string;
  category: string;
  city: string;
  venue_name: string;
  venue_address: string;
  start_time: string;
  end_time: string;
  price_type: string;
  price_display: string;
  ticket_url: string;
  organizer_name: string;
  submitter_name: string;
  submitter_email: string;
  source_url: string;
  poster: File | null;
};

const initialState: FormState = {
  title: "",
  description: "",
  category: categories[0],
  city: cities[0],
  venue_name: "",
  venue_address: "",
  start_time: "",
  end_time: "",
  price_type: "unknown",
  price_display: "",
  ticket_url: "",
  organizer_name: "",
  submitter_name: "",
  submitter_email: "",
  source_url: "",
  poster: null,
};

export function SubmitEventForm() {
  const [state, setState] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const canSubmit = useMemo(() => {
    return Boolean(state.title && state.category && state.city && state.start_time && state.submitter_email);
  }, [state]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("We could not submit the event. Please check the required fields and try again.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(state).forEach(([key, value]) => {
        if (value instanceof File) {
          if (value.size) {
            formData.append(key, value);
          }
          return;
        }

        formData.append(key, String(value ?? ""));
      });

      const response = await fetch("/api/submit-event", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      router.push("/submit?success=1");
    } catch {
      setError("We could not submit the event. Please check the required fields and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Event title*" htmlFor="title">
          <Input id="title" value={state.title} onChange={(event) => updateField("title", event.target.value)} />
        </Field>
        <Field label="Category*" htmlFor="category">
          <Select id="category" value={state.category} onChange={(event) => updateField("category", event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="City*" htmlFor="city">
          <Select id="city" value={state.city} onChange={(event) => updateField("city", event.target.value)}>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Venue name" htmlFor="venue_name">
          <Input id="venue_name" value={state.venue_name} onChange={(event) => updateField("venue_name", event.target.value)} />
        </Field>
        <Field label="Venue address" htmlFor="venue_address">
          <Input
            id="venue_address"
            value={state.venue_address}
            onChange={(event) => updateField("venue_address", event.target.value)}
          />
        </Field>
        <Field label="Start date and time*" htmlFor="start_time">
          <Input
            id="start_time"
            type="datetime-local"
            value={state.start_time}
            onChange={(event) => updateField("start_time", event.target.value)}
          />
        </Field>
        <Field label="End date and time" htmlFor="end_time">
          <Input
            id="end_time"
            type="datetime-local"
            value={state.end_time}
            onChange={(event) => updateField("end_time", event.target.value)}
          />
        </Field>
        <Field label="Price type" htmlFor="price_type">
          <Select id="price_type" value={state.price_type} onChange={(event) => updateField("price_type", event.target.value)}>
            <option value="unknown">Price TBD</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </Select>
        </Field>
        <Field label="Price display" htmlFor="price_display">
          <Input
            id="price_display"
            placeholder="e.g. Free entry or $25"
            value={state.price_display}
            onChange={(event) => updateField("price_display", event.target.value)}
          />
        </Field>
        <Field label="Ticket URL" htmlFor="ticket_url">
          <Input id="ticket_url" type="url" value={state.ticket_url} onChange={(event) => updateField("ticket_url", event.target.value)} />
        </Field>
        <Field label="Organizer name" htmlFor="organizer_name">
          <Input
            id="organizer_name"
            value={state.organizer_name}
            onChange={(event) => updateField("organizer_name", event.target.value)}
          />
        </Field>
        <Field label="Submitter name" htmlFor="submitter_name">
          <Input
            id="submitter_name"
            value={state.submitter_name}
            onChange={(event) => updateField("submitter_name", event.target.value)}
          />
        </Field>
        <Field label="Submitter email*" htmlFor="submitter_email">
          <Input
            id="submitter_email"
            type="email"
            value={state.submitter_email}
            onChange={(event) => updateField("submitter_email", event.target.value)}
          />
        </Field>
        <Field label="Source URL" htmlFor="source_url">
          <Input id="source_url" type="url" value={state.source_url} onChange={(event) => updateField("source_url", event.target.value)} />
        </Field>
        <Field label="Poster upload" htmlFor="poster">
          <Input
            id="poster"
            type="file"
            accept="image/*"
            onChange={(event) => updateField("poster", event.target.files?.[0] || null)}
          />
        </Field>
      </div>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" value={state.description} onChange={(event) => updateField("description", event.target.value)} />
      </Field>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Submitting..." : "Submit event"}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
