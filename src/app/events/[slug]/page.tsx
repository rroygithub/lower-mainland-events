import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { CategoryPill } from "@/components/category-pill";
import { ShareActions } from "@/components/share-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatEventDateTimeRange } from "@/lib/date";
import { getEventBySlug } from "@/lib/events";
import { absoluteUrl, safeExternalHref } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const eventUrl = absoluteUrl(`/events/${event.slug}`);
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title,
  )}&dates=${new Date(event.start_time).toISOString().replace(/[-:]|\.\d{3}/g, "")}/${new Date(
    event.end_time || event.start_time,
  )
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, "")}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
    `${event.venue_name || ""} ${event.venue_address || ""}`.trim(),
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="aspect-[4/3] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <Image
              src={event.poster_url || "https://placehold.co/1200x900/f8fafc/334155?text=Event+Poster"}
              alt={event.title}
              width={1200}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-slate-900">About this event</h2>
              <p className="text-sm leading-7 text-slate-600">{event.description || "Description coming soon."}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <CategoryPill category={event.category} />
              {event.price_display ? <Badge>{event.price_display}</Badge> : null}
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-slate-950">
              {event.title}
            </h1>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 flex-none" />
                <span>{formatEventDateTimeRange(event.start_time, event.end_time)}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-none" />
                <span>
                  {[event.venue_name, event.venue_address, event.city].filter(Boolean).join(" · ")}
                </span>
              </div>
              {event.organizer_name ? (
                <div className="flex items-start gap-3">
                  <Ticket className="mt-0.5 h-4 w-4 flex-none" />
                  <span>Organizer: {event.organizer_name}</span>
                </div>
              ) : null}
            </div>
          </div>

          <Card>
            <CardContent className="space-y-5 p-6">
              <h2 className="text-xl font-semibold text-slate-900">Plan your visit</h2>
              <ShareActions url={eventUrl} title={event.title} calendarUrl={calendarUrl} />
              {safeExternalHref(event.ticket_url) ? (
                <a href={safeExternalHref(event.ticket_url)!} target="_blank" rel="noreferrer">
                  <Button size="lg" className="w-full">
                    Get tickets
                  </Button>
                </a>
              ) : null}
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Source</p>
                <p className="mt-1">{event.source_name || "Submitted by organizer"}</p>
                {safeExternalHref(event.source_url) ? (
                  <Link href={safeExternalHref(event.source_url)!} className="mt-2 inline-flex text-slate-900 underline">
                    View source
                  </Link>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
