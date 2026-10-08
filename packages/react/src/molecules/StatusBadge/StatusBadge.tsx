import { useEffect, useState } from 'react';
import { Badge, statusLabels, type Status } from '../../atoms/Badge/Badge';
import { formatDuration } from '../../internal/formatDuration';
import './StatusBadge.css';

export interface StatusBadgeProps {
  status: Status;
  /** Epoch ms. When set, the badge shows elapsed time: "Running · 12s". */
  startedAt?: number | undefined;
  /** Epoch ms. Freezes the elapsed time. Without it, the time ticks while status is running. */
  endedAt?: number | undefined;
  /** Overrides the status word, e.g. "Retrying". */
  label?: string;
  className?: string;
}

function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

/**
 * The ticking time is deliberately not a live region: announcing every second would drown out everything else.
 * Organisms announce status transitions instead.
 */
export function StatusBadge({ status, startedAt, endedAt, label, className }: StatusBadgeProps) {
  const ticking = startedAt !== undefined && endedAt === undefined && status === 'running';
  const now = useNow(ticking);
  const elapsed = startedAt === undefined ? undefined : (endedAt ?? now) - startedAt;
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
