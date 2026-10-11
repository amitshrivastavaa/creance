import type { ReactNode } from 'react';
import { ChartLegend, ChartTable, formatter, seriesColor, type ChartTone, type ValueFormat } from '../../internal/chart';
import { cx } from '../../internal/cx';
import './DonutChart.css';

export interface DonutSlice {
  label: string;
  value: number;
  /** `danger` is red, for a failure. Other slices step down in ink in the order given. */
  tone?: ChartTone;
}

export interface DonutChartProps extends ValueFormat {
  /** Up to five slices read well. Put the largest first. */
  data: DonutSlice[];
  /** What the chart shows, for screen readers and as the table's caption: "Run outcomes". */
  label: string;
  /** Under the total in the middle: "runs". */
  centerLabel?: ReactNode;
  /** Diameter in pixels. Default 170. */
  size?: number;
  /** Lists each slice with its value and share. Default true. */
  legend?: boolean;
  className?: string;
}

/** Parts of a whole. The legend gives each slice its value and share, so nothing depends on telling shades apart. */
export function DonutChart({ data, label, centerLabel, size = 170, legend = true, className, ...format }: DonutChartProps) {
  const fmt = formatter(format);
  const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
  const stroke = Math.round(size * 0.12);
  const radius = (size - stroke) / 2;
  const around = 2 * Math.PI * radius;
  const share = (v: number) => (total ? `${Math.round((v / total) * 100)}%` : '0%');
  const slices = data.map((d, i) => {
    const before = data.slice(0, i);
    // Ink steps down through the slices that are not failures; each arc starts where the last one ended.
    const step = before.filter((b) => b.tone !== 'danger').length;
    const start = before.reduce((sum, b) => sum + Math.max(b.value, 0), 0);
    const arc = (v: number) => (total ? (v / total) * around : 0);
    return { ...d, color: seriesColor(step, d.tone), length: arc(Math.max(d.value, 0)), offset: arc(start) };
  });

  return (
    <figure className={cx('cr-chart cr-donut', className)}>
      <div className="cr-donut__ring" style={{ width: size, height: size }} aria-hidden="true">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              // A small gap separates neighbours without relying on their shades.
              strokeDasharray={`${Math.max(s.length - 3, 0.5)} ${around}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </svg>
        <div className="cr-donut__center">
          <span className="cr-donut__total">{fmt(total)}</span>
          {centerLabel && <span className="cr-donut__unit">{centerLabel}</span>}
        </div>
      </div>
      {legend && <ChartLegend items={slices.map((s) => ({ name: s.label, color: s.color, value: fmt(s.value), share: share(s.value) }))} />}
      <ChartTable caption={label} columns={['Slice', 'Value', 'Share']} rows={[...data.map((d) => [d.label, fmt(d.value), share(d.value)]), ['Total', fmt(total), '100%']]} />
    </figure>
  );
}
