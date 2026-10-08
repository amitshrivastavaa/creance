import type { HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import './MiddleTruncate.css';

export interface MiddleTruncateProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  /** Characters kept at the start. Default 14. */
  start?: number;
  /** Characters kept at the end. Default 16. */
  end?: number;
  /** Monospace, for IDs and paths. Default true. */
  mono?: boolean;
}

/** Shortens the middle, where paths and IDs are alike, and keeps the start and end, where they differ. */
export function MiddleTruncate({ text, start = 14, end = 16, mono = true, className, ...props }: MiddleTruncateProps) {
  const short = text.length > start + end + 1 ? `${text.slice(0, start)}…${text.slice(-end)}` : text;
  return (
    <span className={cx('cr-middle-truncate', className)} data-mono={mono || undefined} title={text} {...props}>
      {short === text ? (
        text
      ) : (
        <>
          <span aria-hidden="true">{short}</span>
          <span className="cr-visually-hidden">{text}</span>
        </>
      )}
    </span>
  );
}
