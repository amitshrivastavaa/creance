import { useState, type MouseEventHandler, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Breadcrumbs.css';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface BreadcrumbsProps {
  /** From the top level down. The last item is the current page. */
  items: BreadcrumbItem[];
  /** Above this many items, the middle collapses into a button. Default 4. */
  maxItems?: number;
  /** Accessible name of the nav. Default "Breadcrumb". */
  label?: string;
  className?: string;
}

/** Where you are, as a trail of links. Long trails keep the first and last levels and fold the middle. */
export function Breadcrumbs({ items, maxItems = 4, label = 'Breadcrumb', className }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const fold = !expanded && items.length > maxItems;
  const hidden = fold ? items.length - 2 : 0;
  const shown = fold ? [items[0]!, null, items[items.length - 1]!] : items;

  return (
    <nav aria-label={label} className={cx('cr-breadcrumbs', className)}>
      <ol className="cr-breadcrumbs__list">
        {shown.map((item, i) => {
          const last = i === shown.length - 1;
          return (
            <li key={i} className="cr-breadcrumbs__item">
              {item === null ? (
                <button type="button" className="cr-breadcrumbs__more" aria-label={`Show ${hidden} hidden levels`} onClick={() => setExpanded(true)}>
                  …
                </button>
              ) : (
                <a
                  className="cr-breadcrumbs__link"
                  href={item.href}
                  onClick={item.onClick}
                  aria-current={last ? 'page' : undefined}
                >
                  {item.label}
                </a>
              )}
              {!last && (
                <span className="cr-breadcrumbs__sep" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
