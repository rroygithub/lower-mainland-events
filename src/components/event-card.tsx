import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { CategoryPill } from "@/components/category-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatEventDateLabel, formatEventTimeLabel } from "@/lib/date";
import type { EventRecord } from "@/lib/types";

export function EventCard({ event }: { event: EventRecord }) {
  return (
    <Link href={`/events/${event.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={event.poster_url || "https://placehold.co/900x675/f8fafc/334155?text=Event+Poster"}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute left-4 top-4 rounded-2xl bg-white/95 px-3 py-2 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {formatEventDateLabel(event.start_time)}
            </p>
            <p className="text-sm font-semibold text-slate-900">{formatEventTimeLabel(event.start_time)}</p>
          </div>
        </div>
        <CardContent className="flex h-[calc(100%-0px)] flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <CategoryPill category={event.category} />
            {event.price_display ? <Badge tone="muted">{event.price_display}</Badge> : null}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold leading-tight text-slate-900">{event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 flex-none" />
              <span>
                {event.venue_name || "Venue TBD"} · {event.city}
              </span>
            </div>
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">{event.description}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Verified source: {event.source_name || "Community listing"}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2 text-sm font-medium text-slate-900">
            <span>View details</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
