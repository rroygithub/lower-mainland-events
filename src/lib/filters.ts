import { isWithinInterval } from "date-fns";
import { getDateFilterRange } from "@/lib/date";
import type { EventFilters, EventRecord } from "@/lib/types";
import { normalizeText } from "@/lib/dedupe";

export function applyEventFilters(events: EventRecord[], filters: EventFilters) {
  const query = filters.q ? normalizeText(filters.q) : "";
  const dateRange = getDateFilterRange(filters.date);

  const filtered = events.filter((event) => {
    const matchesQuery =
      !query ||
      [event.title, event.description, event.city, event.venue_name, event.organizer_name]
        .filter(Boolean)
        .some((value) => normalizeText(String(value)).includes(query));

    const matchesCity = !filters.city || filters.city === "all" || event.city === filters.city;
    const matchesCategory =
      !filters.category || filters.category === "all" || event.category === filters.category;
    const matchesPrice =
      !filters.price || filters.price === "all" || event.price_type === filters.price;
    const matchesDate =
      !dateRange ||
      isWithinInterval(new Date(event.start_time), {
        start: dateRange.from,
        end: dateRange.to,
      });

    return matchesQuery && matchesCity && matchesCategory && matchesPrice && matchesDate;
  });

  filtered.sort((left, right) => {
    const comparison = new Date(left.start_time).getTime() - new Date(right.start_time).getTime();
    return filters.sort === "desc" ? comparison * -1 : comparison;
  });

  return filtered;
}
