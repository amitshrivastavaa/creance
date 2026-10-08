import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Gauge.css';

export interface GaugeProps {
  /** 0 to 100. */
  value: number;
  /** What it measures: "Token budget used". */
  label: string;
  /** Above this, the ring turns red. Leave it out to keep the ring ink. */
  limit?: number;
  /** Centre text. Defaults to the rounded percentage. */
  children?: ReactNode;
  size?: number;
  className?: string;
}

/** A ring that fills to a percentage. Ink by default; red only past a limit you set. */
export function Gauge({ value, label, limit, children, size = 96, className }: GaugeProps) {
  const v = Math.max(0, Math.min(100, value));
  const over = limit !== undefined && v > limit;
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${Math.round(v)}%${over ? ', over the limit' : ''}`}
      className={cx('cr-gauge', className)}
      data-over={over || undefined}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle className="cr-gauge__track" cx="18" cy="18" r={r} />
        <circle className="cr-gauge__fill" cx="18" cy="18" r={r} strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 18 18)" />
      </svg>
      <span className="cr-gauge__value" aria-hidden="true">
        {children ?? `${Math.round(v)}%`}
      </span>
    </div>
  );
}
