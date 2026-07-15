export type RangeKey = "7d" | "30d" | "90d" | "year" | "custom";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
  { key: "year", label: "This Year" },
  { key: "custom", label: "Custom Range" },
];

export const DEFAULT_RANGE: RangeKey = "30d";

export interface DateRange {
  from: string;
  to: string;
}

const DAY = 24 * 60 * 60 * 1000;

/** Resolve a range key (relative to `nowIso`) into concrete from/to timestamps. */
export function resolveRange(key: RangeKey, nowIso: string, customFrom?: string, customTo?: string): DateRange {
  const now = new Date(nowIso);
  const to = now.toISOString();
  switch (key) {
    case "7d":
      return { from: new Date(now.getTime() - 7 * DAY).toISOString(), to };
    case "90d":
      return { from: new Date(now.getTime() - 90 * DAY).toISOString(), to };
    case "year":
      return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to };
    case "custom": {
      const f = customFrom ? new Date(`${customFrom}T00:00:00`) : new Date(now.getTime() - 30 * DAY);
      const t = customTo ? new Date(`${customTo}T23:59:59.999`) : now;
      return { from: f.toISOString(), to: t.toISOString() };
    }
    case "30d":
    default:
      return { from: new Date(now.getTime() - 30 * DAY).toISOString(), to };
  }
}

/** Equal-length window immediately preceding the given range (for comparisons). */
export function previousRange(range: DateRange): DateRange {
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  const span = to - from;
  return { from: new Date(from - span).toISOString(), to: new Date(from).toISOString() };
}

export interface Bucket {
  label: string;
  start: string;
  end: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Split a range into readable buckets; granularity adapts to the span. */
export function bucketsFor(range: DateRange): { granularity: "day" | "week" | "month"; buckets: Bucket[] } {
  const from = new Date(range.from);
  const to = new Date(range.to);
  const spanDays = (to.getTime() - from.getTime()) / DAY;

  const buckets: Bucket[] = [];

  if (spanDays <= 14) {
    // Daily
    const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    while (cur <= to) {
      const start = new Date(cur);
      const end = new Date(cur.getTime() + DAY - 1);
      buckets.push({ label: `${start.getDate()} ${MONTHS[start.getMonth()]}`, start: start.toISOString(), end: end.toISOString() });
      cur.setDate(cur.getDate() + 1);
    }
    return { granularity: "day", buckets };
  }

  if (spanDays <= 92) {
    // Weekly
    const cur = new Date(from.getTime());
    while (cur <= to) {
      const start = new Date(cur);
      const end = new Date(Math.min(cur.getTime() + 7 * DAY - 1, to.getTime()));
      buckets.push({ label: `${start.getDate()} ${MONTHS[start.getMonth()]}`, start: start.toISOString(), end: end.toISOString() });
      cur.setDate(cur.getDate() + 7);
    }
    return { granularity: "week", buckets };
  }

  // Monthly
  const cur = new Date(from.getFullYear(), from.getMonth(), 1);
  while (cur <= to) {
    const start = new Date(cur);
    const end = new Date(cur.getFullYear(), cur.getMonth() + 1, 0, 23, 59, 59, 999);
    buckets.push({ label: MONTHS[start.getMonth()], start: start.toISOString(), end: end.toISOString() });
    cur.setMonth(cur.getMonth() + 1);
  }
  return { granularity: "month", buckets };
}
