import { cx } from '../../internal/cx';
import './Sparkline.css';

export interface SparklineProps {
  values: number[];
  /** What the trend is, for screen readers: "Tokens per day, last 14 days". */
  label: string;
  /** `area` is a line with a soft fill. Default `line`. */
  variant?: 'line' | 'area' | 'bars';
  width?: number;
  height?: number;
  className?: string;
}

/** A trend with no axes, for a table cell or a stat card. The last point is marked. */
export function Sparkline({ values, label, variant = 'line', width = 120, height = 36, className }: SparklineProps) {
  const pad = 3;
  const lo = variant === 'bars' ? 0 : Math.min(...values);
  const span = Math.max(...values) - lo || 1;
  const y = (v: number) => height - pad - ((v - lo) / span) * (height - 2 * pad);
  const common = { className: cx('cr-sparkline', className), width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': label, 'data-variant': variant };

  if (variant === 'bars') {
    const slot = width / values.length;
    return (
      <svg {...common}>
        {values.map((v, i) => {
          const h = Math.max(2, height - y(v) - pad);
          return <rect key={i} className="cr-sparkline__bar" data-last={i === values.length - 1 || undefined} x={i * slot + 1.5} y={height - h} width={Math.max(1, slot - 3)} height={h} rx="2" />;
        })}
      </svg>
    );
  }

  const step = values.length > 1 ? (width - 2 * pad) / (values.length - 1) : 0;
  const points = values.map((v, i) => [pad + i * step, y(v)] as const);
  const line = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  return (
    <svg {...common}>
      {variant === 'area' && last && <path className="cr-sparkline__area" d={`${line} L${last[0].toFixed(1)} ${height} L${pad} ${height} Z`} />}
      <path className="cr-sparkline__line" d={line} />
      {last && <circle className="cr-sparkline__dot" cx={last[0]} cy={last[1]} r="2.6" />}
    </svg>
  );
}
