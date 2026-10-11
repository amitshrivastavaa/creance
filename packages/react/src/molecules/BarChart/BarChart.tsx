import { ChartLegend, ChartTable, formatter, niceScale, seriesColor, type ChartTone, type ValueFormat } from '../../internal/chart';
import { cx } from '../../internal/cx';
import './BarChart.css';

export interface BarSeries {
  name: string;
  /** One value per label. */
  values: number[];
  /** `danger` is red, for a failure. */
  tone?: ChartTone;
}

export interface BarChartProps extends ValueFormat {
  /** The categories along the bottom. */
  labels: string[];
  /** One series draws plain bars. More than one stacks them, first at the bottom. */
  series: BarSeries[];
  /** What the chart shows, for screen readers and as the table's caption: "Runs per day". */
  label: string;
  /** What the labels are, as the heading of the table's first column. Default "Category". */
  axisLabel?: string;
  /** Index of one bar to pick out in ink with its value shown. The others turn grey. Single series only. */
  highlight?: number;
  /** Height in pixels. Default 200. */
  height?: number;
  /** Names the series. Default true when there is more than one. */
  legend?: boolean;
  className?: string;
}

/** Amounts across categories. Hovering a bar shows its value; the whole chart is also a table for screen readers. */
export function BarChart({ labels, series, label, axisLabel = 'Category', highlight, height = 200, legend = series.length > 1, className, ...format }: BarChartProps) {
  const fmt = formatter(format);
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + Math.max(s.values[i] ?? 0, 0), 0));
  const scale = niceScale(Math.max(...totals, 0), 3);
  const stacked = series.length > 1;
  // Ink steps down through the series that are not failures.
  const colors = series.map((s, i) => seriesColor(series.slice(0, i).filter((b) => b.tone !== 'danger').length, s.tone));

  return (
    <figure className={cx('cr-chart cr-bar-chart', className)}>
      {legend && <ChartLegend items={series.map((s, i) => ({ name: s.name, color: colors[i]! }))} />}
      <div className="cr-chart__plot cr-bar-chart__plot" style={{ height }} aria-hidden="true">
        {scale.ticks.map((t) => (
          <span key={t} className="cr-chart__tick" style={{ bottom: `${(t / scale.max) * 100}%` }}>
            <span className="cr-chart__tick-label">{fmt(t)}</span>
          </span>
        ))}
        <div className="cr-bar-chart__bars">
          {labels.map((name, i) => (
            <div key={i} className="cr-bar-chart__column" data-highlight={highlight === i || undefined} data-dim={(highlight !== undefined && highlight !== i) || undefined}>
              <span className="cr-bar-chart__value">{fmt(totals[i]!)}</span>
              <span className="cr-bar-chart__stack" style={{ height: `${(totals[i]! / scale.max) * 100}%` }}>
                {series.map((s, n) => (
                  <span key={n} className="cr-bar-chart__bar" style={{ flexGrow: Math.max(s.values[i] ?? 0, 0), background: colors[n] }} />
                ))}
              </span>
              <span className="cr-bar-chart__label">{name}</span>
            </div>
          ))}
        </div>
      </div>
      <ChartTable
        caption={label}
        columns={[axisLabel, ...series.map((s) => s.name), ...(stacked ? ['Total'] : [])]}
        rows={labels.map((name, i) => [name, ...series.map((s) => fmt(s.values[i] ?? 0)), ...(stacked ? [fmt(totals[i]!)] : [])])}
      />
    </figure>
  );
}
