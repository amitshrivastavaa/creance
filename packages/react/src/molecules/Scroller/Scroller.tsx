'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ChevronIcon, ChevronLeftIcon } from '../../internal/icons';
import './Scroller.css';

export interface ScrollerProps {
  children: ReactNode;
  /** Names the scrolling region, which is focusable so keyboard users can scroll it. */
  label: string;
  className?: string;
}

/** A horizontal strip that fades at an edge with more beyond it, with arrows on hover and focus. */
export function Scroller({ children, label, className }: ScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft > 1, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const smooth = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <div className={cx('cr-scroller', className)} data-start={edges.start || undefined} data-end={edges.end || undefined}>
      {/* The region is focusable so arrow keys scroll it; its contents keep their own focus order. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div ref={ref} role="region" aria-label={label} tabIndex={0} className="cr-scroller__track" onScroll={measure}>
        {children}
      </div>
      {/* Mouse helpers: keyboard users scroll the focused region directly. */}
      <button type="button" tabIndex={-1} aria-hidden="true" className="cr-scroller__arrow" data-side="start" onClick={() => page(-1)}>
        <ChevronLeftIcon />
      </button>
      <button type="button" tabIndex={-1} aria-hidden="true" className="cr-scroller__arrow" data-side="end" onClick={() => page(1)}>
        <ChevronIcon />
      </button>
    </div>
  );
}
