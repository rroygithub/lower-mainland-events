"use client";

import { useState } from "react";
import { categories, cities } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/newsletter-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        city: city || null,
        categories: category ? [category] : [],
      }),
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);
    setMessage(response.ok ? "You’re on the list for weekly event picks." : data.error || "Could not save signup.");

    if (response.ok) {
      setEmail("");
      setCity("");
      setCategory("");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Get weekly South Asian events in your inbox.</h3>
        <p className="mt-1 text-sm text-slate-600">Choose a city or category if you want more relevant picks.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Select value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">Any city</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Any category</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Button onClick={submit} disabled={!email || loading}>
          {loading ? "Saving..." : "Sign up"}
        </Button>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
