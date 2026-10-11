import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from '../../internal/icons';
import { VisuallyHidden } from '../../internal/VisuallyHidden';
import './StatCard.css';

export interface StatTrend {
  direction: 'up' | 'down' | 'flat';
  /** The amount of change: "12%", "4", "No change". */
  label: ReactNode;
  /** `bad` turns the chip red. Up is not always good: use it for a change that is bad news. */
  tone?: 'neutral' | 'bad';
}

export interface StatCardProps {
  /** What the number is. */
  label: ReactNode;
  value: ReactNode;
  trend?: StatTrend;
  /** Beside the trend: what it is compared with, or a second fact. */
  note?: ReactNode;
  /** Beside the value, usually a Sparkline. */
  chart?: ReactNode;
  className?: string;
}

const words = { up: 'Up', down: 'Down', flat: '' };
const icons = { up: <ArrowUpIcon />, down: <ArrowDownIcon />, flat: <MinusIcon /> };

/** One number, what it is, and how it moved. The arrow carries the direction, and is read out in words. */
export function StatCard({ label, value, trend, note, chart, className }: StatCardProps) {
  return (
    <div className={cx('cr-stat cr-surface', className)}>
      <span className="cr-stat__label">{label}</span>
      <span className="cr-stat__row">
        <span className="cr-stat__value">{value}</span>
        {chart}
      </span>
      {(trend || note) && (
        <span className="cr-stat__foot">
          {trend && (
            <span className="cr-stat__trend" data-tone={trend.tone ?? 'neutral'}>
              {icons[trend.direction]}
              {words[trend.direction] && <VisuallyHidden>{words[trend.direction]} </VisuallyHidden>}
              {trend.label}
            </span>
          )}
          {note && <span className="cr-stat__note">{note}</span>}
        </span>
      )}
    </div>
  );
}
