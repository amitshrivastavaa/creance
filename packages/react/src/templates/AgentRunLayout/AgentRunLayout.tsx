'use client';

import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { Avatar } from '../../atoms/Avatar/Avatar';
import type { Status } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { BudgetMeter, type BudgetMeterProps } from '../../molecules/BudgetMeter/BudgetMeter';
import { StatusBadge } from '../../molecules/StatusBadge/StatusBadge';
import { cx } from '../../internal/cx';
import { CrossIcon } from '../../internal/icons';
import './AgentRunLayout.css';

export type RunLayoutStatus = 'idle' | 'running' | 'waiting' | 'completed' | 'failed';

const statusBadge: Record<RunLayoutStatus, { status: Status; label: string }> = {
  idle: { status: 'waiting', label: 'Not started' },
  running: { status: 'running', label: 'Running' },
  waiting: { status: 'waiting', label: 'Waiting for you' },
  completed: { status: 'done', label: 'Completed' },
  failed: { status: 'failed', label: 'Failed' },
};

export interface AgentRunLayoutProps {
  agentName: string;
  /** What the run is trying to do. */
  goal?: string | undefined;
  status: RunLayoutStatus;
  startedAt?: number | undefined;
  endedAt?: number | undefined;
  budget?: Pick<BudgetMeterProps, 'used' | 'limit' | 'unit'> | undefined;
  /** Left column, usually a RunTimeline. It gets a fixed height and scrolls internally. */
  timeline: ReactNode;
  /** Right column: the ApprovalPrompt, DiffReview or ToolCallCard in focus. */
  detail: ReactNode;
  /** Full-width slot above the columns, e.g. an AgentHandoffBanner. */
  banner?: ReactNode;
  /** Drawer content, usually a NeedsYouInbox. The header button shows `inboxCount`. */
  inbox?: ReactNode;
  inboxCount?: number;
  inboxOpen?: boolean;
  onInboxOpenChange?: (open: boolean) => void;
  /** Extra controls at the end of the header. */
  actions?: ReactNode;
  className?: string;
}

/**
 * The agent run screen: header with agent, status and budget; timeline left, detail right;
 * an inbox drawer for everything else waiting on the person. Layout only: it renders the slots it's given.
 */
export function AgentRunLayout({
  agentName,
  goal,
  status,
  startedAt,
  endedAt,
  budget,
  timeline,
  detail,
  banner,
  inbox,
  inboxCount = 0,
  inboxOpen,
  onInboxOpenChange,
  actions,
  className,
}: AgentRunLayoutProps) {
  const badge = statusBadge[status];
  return (
    <div className={cx('cr-run-layout', className)}>
      <header className="cr-run-layout__header cr-glass">
        <div className="cr-run-layout__agent">
          <Avatar name={agentName} decorative />
          <div className="cr-run-layout__titles">
            <h1 className="cr-run-layout__name">{agentName}</h1>
            {goal && <p className="cr-run-layout__goal">{goal}</p>}
          </div>
          <StatusBadge status={badge.status} label={badge.label} startedAt={startedAt} endedAt={endedAt} />
        </div>
        <div className="cr-run-layout__tools">
          {budget && <BudgetMeter {...budget} />}
          {inbox && (
            <Dialog.Root {...(inboxOpen !== undefined && { open: inboxOpen })} onOpenChange={onInboxOpenChange}>
              <Dialog.Trigger asChild>
                <Button>
                  Needs you <span className="cr-run-layout__count">{inboxCount}</span>
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="cr-run-layout__overlay" />
                <Dialog.Content className="cr-run-layout__drawer cr-glass" aria-describedby={undefined}>
                  <div className="cr-run-layout__drawer-bar">
                    <Dialog.Title className="cr-run-layout__drawer-title">Inbox</Dialog.Title>
                    <Dialog.Close asChild>
                      <IconButton label="Close inbox" icon={<CrossIcon />} tooltip={false} />
                    </Dialog.Close>
                  </div>
                  {inbox}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
          {actions}
        </div>
      </header>

      {banner && <div className="cr-run-layout__banner">{banner}</div>}

      <main className="cr-run-layout__main">
        <section className="cr-run-layout__timeline cr-surface" aria-label="Timeline">
          {timeline}
        </section>
        <section className="cr-run-layout__detail" aria-label="Details">
          {detail}
        </section>
      </main>
    </div>
  );
}
