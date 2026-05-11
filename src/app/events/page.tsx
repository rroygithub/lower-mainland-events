import { EventFilters } from "@/components/event-filters";
import { EventGrid } from "@/components/event-grid";
import { getApprovedEvents } from "@/lib/events";
import type { EventFilters as EventFilterValues } from "@/lib/types";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: EventFilterValues = {
    q: typeof params.q === "string" ? params.q : undefined,
    city: typeof params.city === "string" ? params.city : undefined,
    category: typeof params.category === "string" ? params.category : undefined,
    date: typeof params.date === "string" ? (params.date as EventFilterValues["date"]) : "all",
    price: typeof params.price === "string" ? (params.price as EventFilterValues["price"]) : "all",
    sort: typeof params.sort === "string" ? (params.sort as EventFilterValues["sort"]) : "asc",
  };

  const events = await getApprovedEvents(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950 sm:text-5xl">Browse events</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Search and filter Indian and South Asian events across Vancouver, Surrey, Burnaby, Richmond, and beyond.
        </p>
      </div>
      <EventFilters />
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{events.length} upcoming event{events.length === 1 ? "" : "s"}</p>
      </div>
      <EventGrid events={events} />
    </div>
  );
}
