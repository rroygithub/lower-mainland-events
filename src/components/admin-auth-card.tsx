"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AdminAuthCard() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Set your Supabase environment variables to enable admin sign-in.");
      return;
    }

    setLoading(true);

    const redirectBase =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectBase.replace(/\/$/, "")}/admin`,
      },
    });

    setLoading(false);
    setMessage(error ? error.message : "Check your inbox for the secure admin sign-in link.");
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Admin sign-in</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use a Supabase magic link with an email address listed in `ADMIN_EMAILS`.
          </p>
        </div>
        <Input
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button onClick={handleLogin} disabled={!email || loading}>
          {loading ? "Sending link..." : "Send magic link"}
        </Button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
