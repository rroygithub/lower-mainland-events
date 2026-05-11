import { EventGrid } from "@/components/event-grid";
import type { EventRecord } from "@/lib/types";

export function FeaturedEvents({
  title,
  description,
  events,
}: {
  title: string;
  description: string;
  events: EventRecord[];
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <EventGrid events={events} />
    </section>
  );
}
