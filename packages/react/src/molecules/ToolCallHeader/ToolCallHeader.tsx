import { createElement } from 'react';
import type { Status } from '../../atoms/Badge/Badge';
import { Code } from '../../atoms/Code/Code';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { cx } from '../../internal/cx';
import './ToolCallHeader.css';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

const toBadge: Record<ToolCallStatus, { status: Status; label: string }> = {
  pending: { status: 'waiting', label: 'Pending' },
  running: { status: 'running', label: 'Running' },
  success: { status: 'done', label: 'Succeeded' },
  error: { status: 'failed', label: 'Failed' },
};

export interface ToolCallHeaderProps {
  tool: string;
  status: ToolCallStatus;
  startedAt?: number | undefined;
  endedAt?: number | undefined;
  /** Shown when greater than 1. */
  attempt?: number;
  /** Heading level of the tool name, to fit the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function ToolCallHeader({
  tool,
  status,
  startedAt,
  endedAt,
  attempt = 1,
  headingLevel = 3,
  className,
}: ToolCallHeaderProps) {
  const badge = toBadge[status];
  return (
    <div className={cx('cr-tool-header', className)}>
      {createElement(
        `h${headingLevel}`,
        { className: 'cr-tool-header__name' },
        <span className="cr-visually-hidden">Tool call: </span>,
        <Code>{tool}</Code>,
      )}
      {attempt > 1 && <span className="cr-tool-header__attempt">Attempt {attempt}</span>}
      <StatusBadge
        status={badge.status}
        label={badge.label}
        startedAt={status === 'pending' ? undefined : startedAt}
        endedAt={endedAt}
      />
    </div>
  );
}
