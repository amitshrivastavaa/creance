import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './ShowMore.css';

export interface ShowMoreProps {
  children: ReactNode;
  /** Height shown while collapsed, in pixels. Default 96. */
  collapsedHeight?: number;
  /** Button text while collapsed: "Show 209 more lines". Default "Show more". */
  moreLabel?: ReactNode;
  lessLabel?: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

/** Long content cut to a few lines with a fade. The button only appears when the content overflows. */
export function ShowMore({
  children,
  collapsedHeight = 96,
  moreLabel = 'Show more',
  lessLabel = 'Show less',
  defaultExpanded = false,
  className,
}: ShowMoreProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [overflows, setOverflows] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setOverflows(el.scrollHeight > collapsedHeight + 1);
  }, [children, collapsedHeight]);

  const collapsed = overflows && !expanded;
  return (
    <div className={cx('cr-show-more', className)}>
      <div
        ref={ref}
        id={id}
        className="cr-show-more__content"
        data-collapsed={collapsed || undefined}
        style={collapsed ? { maxHeight: collapsedHeight } : undefined}
      >
        {children}
      </div>
      {overflows && (
        <button
          type="button"
          className="cr-show-more__toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}
