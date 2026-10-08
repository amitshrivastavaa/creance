import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../internal/cx';
import { ChevronIcon, ChevronLeftIcon } from '../../internal/icons';
import { addDays, addMonths, compare, monthGrid, sameDay, toDay } from './dates';
import './Calendar.css';

export interface DateRange {
  start: Date;
  end: Date;
}

interface Base {
  /** Which month shows first. Defaults to the selection, or today. */
  defaultMonth?: Date;
  /** 0 Sunday, 1 Monday. Default 1. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** BCP 47 locale for month and weekday names. Defaults to the browser's. */
  locale?: string;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  /** Override "today", for tests and screenshots. */
  today?: Date;
  className?: string;
  'aria-label'?: string;
}

export type CalendarProps = Base &
  (
    | { mode?: 'single'; value?: Date | null; defaultValue?: Date | null; onValueChange?: (date: Date) => void }
    | { mode: 'range'; value?: DateRange | null; defaultValue?: DateRange | null; onValueChange?: (range: DateRange) => void }
  );

/**
 * A month grid. Arrow keys move by day and week, Home and End to the week's ends, Page Up and Down
 * by month (with Shift, by year), Enter or Space picks. A range takes two picks: start, then end.
 */
export function Calendar(props: CalendarProps) {
  const { weekStartsOn = 1, locale, min, max, isDateDisabled, className } = props;
  const today = toDay(props.today ?? new Date());
  const range = props.mode === 'range';

  const [ownSingle, setOwnSingle] = useState<Date | null>(range ? null : ((props.defaultValue as Date | null) ?? null));
  const [ownRange, setOwnRange] = useState<DateRange | null>(range ? ((props.defaultValue as DateRange | null) ?? null) : null);
  const single = range ? null : props.value === undefined ? ownSingle : (props.value as Date | null);
  const span = range ? (props.value === undefined ? ownRange : (props.value as DateRange | null)) : null;
  // While choosing a range, the first pick waits here for the second.
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);

  const initial = toDay(props.defaultMonth ?? single ?? span?.start ?? today);
  const [focused, setFocused] = useState(initial);
  const [month, setMonth] = useState(initial);
  const grid = useMemo(() => monthGrid(month, weekStartsOn), [month, weekStartsOn]);
  const gridRef = useRef<HTMLTableElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (moved.current) gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus();
  }, [focused]);

  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, o);
  const monthTitle = fmt({ month: 'long', year: 'numeric' }).format(month);
  const dayName = fmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const weekdays = grid[0]!.map((d) => ({ short: fmt({ weekday: 'narrow' }).format(d), long: fmt({ weekday: 'long' }).format(d) }));

  const disabled = (d: Date) => (min && compare(d, min) < 0) || (max && compare(d, max) > 0) || !!isDateDisabled?.(d);

  const go = (d: Date) => {
    moved.current = true;
    setFocused(d);
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) setMonth(d);
  };

  const pick = (d: Date) => {
    if (disabled(d)) return;
    if (props.mode === 'range') {
      if (!anchor) {
        setAnchor(d);
        return;
      }
      const next = compare(d, anchor) < 0 ? { start: d, end: anchor } : { start: anchor, end: d };
      setAnchor(null);
      if (props.value === undefined) setOwnRange(next);
      props.onValueChange?.(next);
    } else {
      if (props.value === undefined) setOwnSingle(d);
      props.onValueChange?.(d);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const offset = (focused.getDay() - weekStartsOn + 7) % 7;
    const next: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -offset),
      End: () => addDays(focused, 6 - offset),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    };
    if (next[e.key]) {
      e.preventDefault();
      go(next[e.key]!());
    } else if (e.key === 'Escape' && anchor) {
      setAnchor(null);
    }
  };

  // The range shown: the chosen one, or the one being chosen.
  const shownRange = anchor
    ? (() => {
        const other = hover ?? focused;
        return compare(other, anchor) < 0 ? { start: other, end: anchor } : { start: anchor, end: other };
      })()
    : span;

  return (
    <div className={cx('cr-calendar cr-popover', className)}>
      <div className="cr-calendar__head">
        <button type="button" className="cr-calendar__nav" aria-label="Previous month" onClick={() => go(addMonths(focused, -1))}>
          <ChevronLeftIcon />
        </button>
        <h2 className="cr-calendar__title" aria-live="polite">
          {monthTitle}
        </h2>
        <button type="button" className="cr-calendar__nav" aria-label="Next month" onClick={() => go(addMonths(focused, 1))}>
          <ChevronIcon />
        </button>
      </div>
      <table ref={gridRef} role="grid" aria-label={props['aria-label'] ?? monthTitle} className="cr-calendar__grid" onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {weekdays.map((w) => (
              <th key={w.long} scope="col" abbr={w.long}>
                {w.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((week, w) => (
            <tr key={w}>
              {week.map((d) => {
                const outside = d.getMonth() !== month.getMonth();
                const selected = range
                  ? !!shownRange && (sameDay(d, shownRange.start) || sameDay(d, shownRange.end))
                  : sameDay(d, single);
                const between = !!shownRange && compare(d, shownRange.start) > 0 && compare(d, shownRange.end) < 0;
                const off = disabled(d);
                return (
                  <td key={d.getTime()} role="gridcell" aria-selected={selected || between || undefined}>
                    <button
                      type="button"
                      className="cr-calendar__day"
                      tabIndex={sameDay(d, focused) ? 0 : -1}
                      aria-label={dayName.format(d)}
                      aria-current={sameDay(d, today) ? 'date' : undefined}
                      aria-disabled={off || undefined}
                      data-outside={outside || undefined}
                      data-selected={selected || undefined}
                      data-between={between || undefined}
                      data-start={(shownRange && sameDay(d, shownRange.start)) || undefined}
                      data-end={(shownRange && sameDay(d, shownRange.end)) || undefined}
                      onClick={() => {
                        go(d);
                        pick(d);
                      }}
                      onMouseEnter={() => anchor && setHover(d)}
                    >
                      {d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
