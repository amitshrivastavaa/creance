import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { BlockedIcon, CheckIcon, CrossIcon, DotIcon, PauseIcon } from '../../internal/icons';
import './Badge.css';

export type Status = 'running' | 'waiting' | 'blocked' | 'done' | 'failed';

export const statusLabels: Record<Status, string> = {
  running: 'Running',
  waiting: 'Waiting',
  blocked: 'Blocked',
  done: 'Done',
  failed: 'Failed',
};

const icons: Record<Status, ReactNode> = {
  running: <DotIcon />,
  waiting: <PauseIcon />,
  blocked: <BlockedIcon />,
  done: <CheckIcon />,
  failed: <CrossIcon />,
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: Status;
  /** Defaults to the status name, e.g. "Running". */
  children?: ReactNode;
}

/** Status is carried by icon and text as well as colour. */
export function Badge({ status, children, className, ...props }: BadgeProps) {
  return (
    <span className={cx('cr-badge', className)} data-status={status} {...props}>
      {icons[status]}
      <span>{children ?? statusLabels[status]}</span>
    </span>
  );
}
