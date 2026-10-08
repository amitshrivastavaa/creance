import { ProgressBar } from '../../atoms/ProgressBar/ProgressBar';
import { cx } from '../../internal/cx';
import './BudgetMeter.css';

export interface BudgetMeterProps {
  used: number;
  limit: number;
  unit: 'tokens' | 'usd';
  /** Visible label. Defaults to "Token budget" or "Cost budget". */
  label?: string;
  className?: string;
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' });

export function formatBudget(value: number, unit: BudgetMeterProps['unit']): string {
  return unit === 'usd' ? usd.format(value) : compact.format(value);
}

/** Warns at 80% of the limit, turns to danger at 100%. */
export function BudgetMeter({ used, limit, unit, label, className }: BudgetMeterProps) {
  const ratio = limit > 0 ? used / limit : 0;
  const tone = ratio >= 1 ? 'danger' : ratio >= 0.8 ? 'warning' : 'default';
  const name = label ?? (unit === 'usd' ? 'Cost budget' : 'Token budget');
  const summary = `${formatBudget(used, unit)} / ${formatBudget(limit, unit)}${unit === 'tokens' ? ' tokens' : ''}`;
  return (
    <div className={cx('cr-budget', className)} data-tone={tone}>
      <div className="cr-budget__row">
        <span className="cr-budget__label">
          {name}
        </span>
        <span className="cr-budget__value">
          {summary}
          {tone === 'danger' && <span className="cr-budget__flag"> · over limit</span>}
        </span>
      </div>
      <ProgressBar label={`${name}: ${summary}`} value={used} max={limit} tone={tone} />
    </div>
  );
}
