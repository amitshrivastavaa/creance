'use client';

import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChartLegend, ChartTable, formatter, niceScale, seriesColor, type ValueFormat } from '../../internal/chart';
import { cx } from '../../internal/cx';
import { LiveRegion } from '../../internal/LiveRegion';
import './LineChart.css';

export interface LineSeries {
  name: string;
  /** One value per label. */
  values: number[];
  /** `dashed` marks a comparison, so it differs from the main line in more than shade. */
  style?: 'solid' | 'dashed';
}

export interface LineChartProps extends ValueFormat {
  /** The points along the bottom, in order: dates, hours. */
  labels: string[];
  /** The first series is the main one: solid ink with a soft fill. Two or three read well. */
  series: LineSeries[];
  /** What the chart shows, for screen readers and as the table's caption: "Tokens per day". */
  label: string;
  /** What the labels are, as the heading of the table's first column. Default "Point". */
  axisLabel?: string;
  /** Height of the plot in pixels. Default 240. */
  height?: number;
  /** Names the series. Default true when there is more than one. */
  legend?: boolean;
  className?: string;
}

/**
 * A trend over time. Pointing at the plot, or focusing it and pressing the arrow keys, reads out one point
 * at a time. The whole chart is also a table for screen readers.
 */
export function LineChart({ labels, series, label, axisLabel = 'Point', height = 240, legend = series.length > 1, className, ...format }: LineChartProps) {
  const fmt = formatter(format);
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const [spoken, setSpoken] = useState('');
  const count = labels.length;
  const scale = niceScale(Math.max(...series.flatMap((s) => s.values), 0));
  const x = (i: number) => (count > 1 ? (i / (count - 1)) * 100 : 50);
  const y = (v: number) => 100 - (v / scale.max) * 100;
  const path = (values: number[]) => values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(' ');
  const colors = series.map((_, i) => seriesColor(i === 0 ? 0 : i));
  // At most seven labels along the bottom, evenly spread.
  const every = Math.max(1, Math.ceil(count / 7));
  const describe = (i: number) => `${labels[i]}: ${series.map((s) => `${s.name} ${fmt(s.values[i] ?? 0)}`).join(', ')}`;

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    if (!box.width || count === 0) return;
    setActive(Math.min(count - 1, Math.max(0, Math.round(((e.clientX - box.left) / box.width) * (count - 1)))));
  }

  function onKeyDown(e: KeyboardEvent) {
    const move: Record<string, number> = { ArrowRight: (active ?? -1) + 1, ArrowLeft: (active ?? count) - 1, Home: 0, End: count - 1 };
    if (e.key === 'Escape') return setActive(null);
    if (!(e.key in move) || count === 0) return;
    e.preventDefault();
    const next = Math.min(count - 1, Math.max(0, move[e.key]!));
    setActive(next);
    setSpoken(describe(next));
  }

  return (
    <figure className={cx('cr-chart cr-line-chart', className)}>
      {legend && <ChartLegend items={series.map((s, i) => ({ name: s.name, color: colors[i]!, dashed: s.style === 'dashed' }))} />}
      {/* Focusable so the points can be read with the arrow keys; the drawing inside is decoration. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="cr-chart__plot cr-line-chart__plot"
        style={{ height }}
        role="img"
        aria-label={`${label}. Press the left and right arrow keys to read each point.`}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        {scale.ticks.map((t) => (
          <span key={t} className="cr-chart__tick" style={{ bottom: `${(t / scale.max) * 100}%` }}>
            <span className="cr-chart__tick-label">{fmt(t)}</span>
          </span>
        ))}
        {/* Stretched to the plot; strokes keep their width because they do not scale. */}
        <svg className="cr-line-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ color: colors[0] }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {series[0] && count > 1 && <path d={`${path(series[0].values)} L100 100 L0 100 Z`} fill={`url(#${id})`} />}
          {series
            .map((s, i) => <path key={i} className="cr-line-chart__line" data-style={s.style ?? 'solid'} d={path(s.values)} stroke={colors[i]} />)
            // The main series is drawn last, on top.
            .reverse()}
        </svg>
        {active !== null && (
          <>
            <span className="cr-line-chart__rule" style={{ left: `${x(active)}%` }} />
            {series.map((s, i) => (
              <span key={i} className="cr-line-chart__marker" data-main={i === 0 || undefined} style={{ left: `${x(active)}%`, top: `${y(s.values[active] ?? 0)}%`, color: colors[i] }} />
            ))}
            <div className="cr-line-chart__tip cr-popover" data-side={x(active) > 60 ? 'left' : 'right'} style={{ left: `${x(active)}%` }}>
              <span className="cr-line-chart__tip-title">{labels[active]}</span>
              <ChartLegend items={series.map((s, i) => ({ name: s.name, color: colors[i]!, dashed: s.style === 'dashed', value: fmt(s.values[active] ?? 0) }))} />
            </div>
          </>
        )}
      </div>
      <div className="cr-chart__labels" aria-hidden="true">
        {labels.map((name, i) =>
          i % every === 0 ? (
            <span key={i} className="cr-line-chart__label" data-edge={i === 0 ? 'start' : i === count - 1 ? 'end' : undefined} style={{ left: `${x(i)}%` }}>
              {name}
            </span>
          ) : null,
        )}
      </div>
      <LiveRegion message={spoken} />
      <ChartTable caption={label} columns={[axisLabel, ...series.map((s) => s.name)]} rows={labels.map((name, i) => [name, ...series.map((s) => fmt(s.values[i] ?? 0))])} />
    </figure>
  );
}
