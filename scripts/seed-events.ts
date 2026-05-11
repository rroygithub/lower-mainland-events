import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { sampleEvents } from "../src/lib/sample-data";

loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  }

  const supabase = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const payload = sampleEvents.slice(0, 12).map((event) => ({
    ...event,
    status: "approved" as const,
  }));

  const { error } = await supabase.from("events").upsert(payload, {
    onConflict: "slug",
  });

  if (error) {
    throw error;
  }

  console.log(`Seeded ${payload.length} sample events.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
