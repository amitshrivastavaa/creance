import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './StatusDot.css';

export type DotStatus = 'running' | 'waiting' | 'done' | 'failed' | 'queued';

const words: Record<DotStatus, string> = {
  running: 'Running',
  waiting: 'Waiting for you',
  done: 'Done',
  failed: 'Failed',
  queued: 'Queued',
};

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status: DotStatus;
  /** Defaults to the status in words. The label always shows: a dot alone says nothing. */
  children?: ReactNode;
}

/** A small mark and a word. Each status has its own shape as well as tone, so colour is never the only cue. */
export function StatusDot({ status, children, className, ...props }: StatusDotProps) {
  return (
    <span className={cx('cr-status-dot', className)} data-status={status} {...props}>
      <span className="cr-status-dot__mark" aria-hidden="true" />
      {children ?? words[status]}
    </span>
  );
}
