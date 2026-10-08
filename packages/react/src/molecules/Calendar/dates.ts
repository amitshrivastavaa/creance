// Calendar dates are local days. Times are ignored; every helper returns noon to dodge DST edges.
export const day = (y: number, m: number, d: number) => new Date(y, m, d, 12);
export const toDay = (d: Date) => day(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => day(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const compare = (a: Date, b: Date) => toDay(a).getTime() - toDay(b).getTime();

/** Same day of month, clamped: Jan 31 + 1 month is Feb 28 or 29. */
export function addMonths(d: Date, n: number) {
  const first = day(d.getFullYear(), d.getMonth() + n, 1);
  const last = day(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return day(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
}

/** Six rows of seven days covering the month, starting on `weekStartsOn` (0 Sunday, 1 Monday). */
export function monthGrid(month: Date, weekStartsOn: number) {
  const first = day(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -((first.getDay() - weekStartsOn + 7) % 7));
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
}
