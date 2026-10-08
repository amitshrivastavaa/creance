import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ChevronIcon, ChevronLeftIcon } from '../../internal/icons';
import './Pagination.css';

export interface PaginationProps {
  /** 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current one. Default 1. */
  siblings?: number;
  /** `compact` shows only previous, next and `summary`. */
  variant?: 'numbered' | 'compact';
  /** For compact: "Runs 41–60 of 230". */
  summary?: ReactNode;
  /** Accessible name of the nav, such as "Runs pages". Default "Pagination". */
  label?: string;
  className?: string;
}

/** Page numbers with the current page in ink; gaps fold into an ellipsis. */
export function pageItems(page: number, count: number, siblings: number): (number | 'gap')[] {
  const keep = new Set([1, count]);
  for (let p = page - siblings; p <= page + siblings; p++) if (p >= 1 && p <= count) keep.add(p);
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev === 2) out.push(prev + 1);
    else if (prev !== undefined && p - prev > 2) out.push('gap');
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageCount, onPageChange, siblings = 1, variant = 'numbered', summary, label = 'Pagination', className }: PaginationProps) {
  const prev = (
    <button type="button" className="cr-pagination__step" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
      <ChevronLeftIcon />
    </button>
  );
  const next = (
    <button type="button" className="cr-pagination__step" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
      <ChevronIcon />
    </button>
  );
  return (
    <nav aria-label={label} className={cx('cr-pagination', className)} data-variant={variant}>
      {prev}
      {variant === 'compact' ? (
        <span className="cr-pagination__summary">{summary ?? `Page ${page} of ${pageCount}`}</span>
      ) : (
        pageItems(page, pageCount, siblings).map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="cr-pagination__gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className="cr-pagination__page"
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )
      )}
      {next}
    </nav>
  );
}
