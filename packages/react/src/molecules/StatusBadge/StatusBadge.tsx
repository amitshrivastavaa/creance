'use client';

import { Badge, statusLabels, type Status } from '../../atoms/Badge/Badge';
import { formatDuration } from '../../internal/formatDuration';
import { useNow } from '../../internal/useNow';
import './StatusBadge.css';

export interface StatusBadgeProps {
  status: Status;
  /** Epoch ms. When set, the badge shows elapsed time: "Running · 12s". */
  startedAt?: number | undefined;
  /** Epoch ms. Freezes the elapsed time. Without it, the time ticks while status is running or waiting. */
  endedAt?: number | undefined;
  /** Overrides the status word, e.g. "Retrying". */
  label?: string;
  className?: string;
}

/**
 * The ticking time is deliberately not a live region: announcing every second would drown out everything else.
 * Organisms announce status transitions instead.
 */
export function StatusBadge({ status, startedAt, endedAt, label, className }: StatusBadgeProps) {
  const ticking = startedAt !== undefined && endedAt === undefined && (status === 'running' || status === 'waiting');
  const now = useNow(1000, ticking);
  // Until mounted, an open-ended time is unknown, so it is left out rather than shown wrong.
  const end = endedAt ?? now;
  const elapsed = startedAt === undefined || end === undefined ? undefined : end - startedAt;
  return (
    <Badge status={status} className={className}>
      {label ?? statusLabels[status]}
      {elapsed !== undefined && (
        <span className="cr-status-badge__time">
          <span aria-hidden="true"> · </span>
          <span className="cr-visually-hidden">, </span>
          {formatDuration(elapsed)}
        </span>
      )}
    </Badge>
  );
}
