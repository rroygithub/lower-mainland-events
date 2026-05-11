import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import type { EventRecord } from "@/lib/types";

export function EventGrid({ events }: { events: EventRecord[] }) {
  if (!events.length) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
