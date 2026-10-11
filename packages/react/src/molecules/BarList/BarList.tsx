import type { ReactNode } from 'react';
import { formatter, type ValueFormat } from '../../internal/chart';
import { cx } from '../../internal/cx';
import './BarList.css';

export interface BarListItem {
  label: ReactNode;
  value: number;
}

export interface BarListProps extends ValueFormat {
  /** Shown in the order given. Sort them yourself, largest first, for a ranking. */
  items: BarListItem[];
  /** Accessible name of the list: "Tokens by agent". */
  label: string;
  className?: string;
}

/** A ranking: a name, a bar and a value on every row. The longest bar is ink. */
export function BarList({ items, label, className, ...format }: BarListProps) {
  const fmt = formatter(format);
  const max = Math.max(...items.map((i) => i.value), 0) || 1;
  return (
    <ul className={cx('cr-chart cr-bar-list', className)} aria-label={label}>
      {items.map((item, i) => (
        <li key={i} className="cr-bar-list__item" data-top={item.value === max || undefined}>
          <span className="cr-bar-list__head">
            <span className="cr-bar-list__label">{item.label}</span>
            <span className="cr-bar-list__value">{fmt(item.value)}</span>
          </span>
          <span className="cr-bar-list__track" aria-hidden="true">
            <span className="cr-bar-list__bar" style={{ width: `${(Math.max(item.value, 0) / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
