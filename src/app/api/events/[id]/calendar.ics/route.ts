import { NextResponse } from "next/server";
import { getEventById } from "@/lib/events";

function formatIcsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lower Mainland Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@lower-mainland-events`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
    `DTSTART:${formatIcsDate(event.start_time)}`,
    `DTEND:${formatIcsDate(event.end_time || event.start_time)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}\\nSource: ${event.source_url || ""}`,
    `LOCATION:${[event.venue_name, event.venue_address, event.city].filter(Boolean).join(", ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
