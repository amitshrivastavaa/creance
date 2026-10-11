// Shared by the charts: scales, number formatting, the legend, and the table every chart carries for screen readers.
import type { ReactNode } from 'react';
import './chart.css';

/** A round maximum at or above the data, with evenly spaced ticks up to it. */
export function niceScale(max: number, count = 4): { max: number; ticks: number[] } {
  if (!(max > 0)) return { max: 1, ticks: [0, 1] };
  const rough = max / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 3, 4, 5, 6, 8, 10].map((m) => m * power).find((s) => s * count >= max) ?? 10 * power;
  // toPrecision trims binary noise such as 0.30000000000000004.
  return { max: step * count, ticks: Array.from({ length: count + 1 }, (_, i) => Number((i * step).toPrecision(12))) };
}

export interface ValueFormat {
  /** Appended to every value, for example "K" or "%". */
  unit?: string;
  /** Replaces the default formatting. `unit` is then ignored. */
  formatValue?: (value: number) => string;
}

/** The locale is fixed so the server and the browser print the same text. */
export const formatter =
  ({ unit = '', formatValue }: ValueFormat) =>
  (value: number) =>
    formatValue ? formatValue(value) : `${value.toLocaleString('en-US')}${unit}`;

export type ChartTone = 'default' | 'danger';

/** The fill for the nth series or slice: ink stepping down in strength, or red for a failure. */
export const seriesColor = (index: number, tone: ChartTone = 'default') => (tone === 'danger' ? 'var(--cr-chart-danger)' : `var(--cr-chart-${Math.min(index, 4) + 1})`);

export function ChartLegend({ items }: { items: { name: ReactNode; color: string; dashed?: boolean; value?: ReactNode; share?: ReactNode }[] }) {
  return (
    <ul className="cr-chart-legend" aria-hidden="true">
      {items.map((item, i) => (
        <li key={i} className="cr-chart-legend__item">
          <span className="cr-chart-legend__swatch" data-dashed={item.dashed || undefined} style={{ color: item.color }} />
          <span className="cr-chart-legend__name">{item.name}</span>
          {item.value !== undefined && <span className="cr-chart-legend__value">{item.value}</span>}
          {item.share !== undefined && <span className="cr-chart-legend__share">{item.share}</span>}
        </li>
      ))}
    </ul>
  );
}

/** The chart's data as a table, for screen readers. The drawing itself is hidden from them. */
export function ChartTable({ caption, columns, rows }: { caption: string; columns: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <table className="cr-visually-hidden">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {row.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
