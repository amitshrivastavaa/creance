import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Description.css';

export interface DescriptionProps {
  items: { term: ReactNode; details: ReactNode }[];
  /** `columns` puts terms beside details; `stacked` puts them above. Default columns. */
  layout?: 'columns' | 'stacked';
  className?: string;
}

/** Terms and their values, such as a run's goal, model and budget, as a real description list. */
export function Description({ items, layout = 'columns', className }: DescriptionProps) {
  return (
    <dl className={cx('cr-description', className)} data-layout={layout}>
      {items.map((item, i) => (
        <div key={i} className="cr-description__row">
          <dt className="cr-description__term">{item.term}</dt>
          <dd className="cr-description__details">{item.details}</dd>
        </div>
      ))}
    </dl>
  );
}
