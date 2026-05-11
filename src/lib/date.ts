import {
  addDays,
  endOfDay,
  endOfWeek,
  format,
  isSameDay,
  isTomorrow,
  isToday,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { DateFilter } from "@/lib/types";

export function formatEventDateLabel(dateString: string) {
  const date = new Date(dateString);

  if (isToday(date)) {
    return "Today";
  }

  if (isTomorrow(date)) {
    return "Tomorrow";
  }

  const weekendStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekendEnd = endOfWeek(date, { weekStartsOn: 1 });
  const currentWeekendStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekendEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const isSameWeekend =
    weekendStart.getTime() === currentWeekendStart.getTime() &&
    weekendEnd.getTime() === currentWeekendEnd.getTime() &&
    [0, 6].includes(date.getDay());

  if (isSameWeekend) {
    return "This weekend";
  }

  return format(date, "EEE, MMM d");
}

export function formatEventTimeLabel(dateString: string) {
  return format(new Date(dateString), "h:mm a");
}

export function formatEventDateTimeRange(startTime: string, endTime?: string | null) {
  const start = new Date(startTime);
  const startLabel = `${formatEventDateLabel(startTime)} · ${format(start, "h:mm a")}`;

  if (!endTime) {
    return startLabel;
  }

  const end = new Date(endTime);

  if (isSameDay(start, end)) {
    return `${startLabel} - ${format(end, "h:mm a")}`;
  }

  return `${startLabel} - ${format(end, "EEE, MMM d · h:mm a")}`;
}

export function getDateFilterRange(filter: DateFilter | undefined) {
  const now = new Date();

  switch (filter) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "tomorrow": {
      const tomorrow = addDays(now, 1);
      return { from: startOfDay(tomorrow), to: endOfDay(tomorrow) };
    }
    case "this-weekend": {
      const saturday = addDays(startOfWeek(now, { weekStartsOn: 1 }), 5);
      const sunday = addDays(startOfWeek(now, { weekStartsOn: 1 }), 6);
      return { from: startOfDay(saturday), to: endOfDay(sunday) };
    }
    case "next-7-days":
      return { from: startOfDay(now), to: endOfDay(addDays(now, 7)) };
    case "next-30-days":
      return { from: startOfDay(now), to: endOfDay(addDays(now, 30)) };
    default:
      return null;
  }
}
