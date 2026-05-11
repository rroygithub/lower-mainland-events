import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { WebSocket as NodeWebSocket } from "ws";
import { sampleEvents } from "../src/lib/sample-data";

loadEnvConfig(process.cwd());

if (!globalThis.WebSocket) {
  globalThis.WebSocket = NodeWebSocket as unknown as typeof WebSocket;
}

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
    title: event.title,
    slug: event.slug,
    description: event.description,
    category: event.category,
    community: event.community,
    city: event.city,
    venue_name: event.venue_name,
    venue_address: event.venue_address,
    start_time: event.start_time,
    end_time: event.end_time,
    price_type: event.price_type,
    price_display: event.price_display,
    ticket_url: event.ticket_url,
    source_url: event.source_url,
    source_name: event.source_name,
    organizer_name: event.organizer_name,
    poster_url: event.poster_url,
    status: "approved" as const,
    is_featured: event.is_featured ?? false,
    duplicate_group_id: null,
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
