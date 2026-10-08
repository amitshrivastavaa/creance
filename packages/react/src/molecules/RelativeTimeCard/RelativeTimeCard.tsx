import { useEffect, useState } from 'react';
import { cx } from '../../internal/cx';
import { Description } from '../Description';
import { ContextCard } from '../ContextCard';
import './RelativeTimeCard.css';

export interface RelativeTimeCardProps {
  date: Date;
  /** BCP 47 locale. Defaults to the browser's. */
  locale?: string;
  /** Override "now", for tests and screenshots. */
  now?: Date;
  className?: string;
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
];

/** "2 hours ago", in the person's language. */
export function formatRelative(date: Date, now: Date, locale?: string) {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const [unit, size] = units.find(([, s]) => Math.abs(seconds) >= s) ?? ['second', 1];
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(seconds / size), unit);
}

/**
 * A relative time that updates every minute. Hover or focus it to see the exact time in your
 * time zone and in UTC. The `<time>` element carries the machine-readable date.
 */
export function RelativeTimeCard({ date, locale, now, className }: RelativeTimeCardProps) {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (now) return;
    const id = setInterval(() => setTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [now]);
  const current = now ?? new Date(tick);
  const exact = (timeZone?: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(date);

  return (
    <ContextCard
      content={
        <Description
          items={[
            { term: 'Your time', details: exact() },
            { term: 'UTC', details: exact('UTC') },
            { term: 'Relative', details: formatRelative(date, current, locale) },
          ]}
        />
      }
    >
      {/* Focusable so keyboard users can reveal the exact time, the same way hover does. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <time dateTime={date.toISOString()} tabIndex={0} className={cx('cr-relative-time', className)}>
        {formatRelative(date, current, locale)}
      </time>
    </ContextCard>
  );
}
