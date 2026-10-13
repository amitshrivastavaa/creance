'use client';

import { createElement, useId, type ReactNode } from 'react';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { cx } from '../../internal/cx';
import { AlertIcon, CrossIcon, PauseIcon, ShieldIcon } from '../../internal/icons';
import { formatDuration } from '../../internal/formatDuration';
import { useNow } from '../../internal/useNow';
import './NeedsYouInbox.css';

export type InboxKind = 'approval' | 'question' | 'failed-run' | 'review';
export type InboxUrgency = 'high' | 'normal' | 'low';

export interface InboxItem {
  id: string;
  kind: InboxKind;
  title: string;
  agentName: string;
  /** Epoch ms when the agent started waiting. Older items sort first within an urgency. */
  createdAt: number;
  urgency: InboxUrgency;
  /** One short line of context. */
  detail?: string | undefined;
}

export interface NeedsYouInboxProps {
  items: InboxItem[];
  onOpen?: (item: InboxItem) => void;
  /** Reference time for "waiting 4m". Defaults to when the inbox mounted; pass it to keep ages current. */
  now?: number;
  /** Heading text. The count is added after it. */
  title?: string;
  headingLevel?: 2 | 3 | 4;
  emptyText?: string;
  className?: string;
}

const kinds: Record<InboxKind, { label: string; plural: string; icon: ReactNode }> = {
  approval: { label: 'Approval', plural: 'approvals', icon: <ShieldIcon /> },
  question: { label: 'Question', plural: 'questions', icon: <PauseIcon /> },
  'failed-run': { label: 'Failed run', plural: 'failed runs', icon: <CrossIcon /> },
  review: { label: 'Review', plural: 'reviews', icon: <AlertIcon /> },
};
const urgencyRank: Record<InboxUrgency, number> = { high: 0, normal: 1, low: 2 };

/** Most urgent first; within an urgency, whoever has waited longest. */
export function sortInbox(items: InboxItem[]): InboxItem[] {
  return [...items].sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency] || a.createdAt - b.createdAt);
}

export function NeedsYouInbox({
  items,
  onOpen,
  now,
  title = 'Needs you',
  headingLevel = 2,
  emptyText = 'Nothing is waiting on you.',
  className,
}: NeedsYouInboxProps) {
  const headingId = useId();
  // Read once after mount: a clock read while rendering differs between server and browser.
  const mountedAt = useNow(60_000, false);
  const reference = now ?? mountedAt;
  const sorted = sortInbox(items);
  const countByKind = (Object.keys(kinds) as InboxKind[])
    .map((kind) => ({ kind, count: items.filter((i) => i.kind === kind).length }))
    .filter((c) => c.count > 0);

  return (
    <section className={cx('cr-inbox', className)} aria-labelledby={headingId}>
      <header className="cr-inbox__header">
        {createElement(
          `h${headingLevel}`,
          { id: headingId, className: 'cr-inbox__title' },
          title,
          ' ',
          <span className="cr-inbox__total">{items.length}</span>,
        )}
        {countByKind.length > 0 && (
          <ul className="cr-inbox__counts" aria-label="By type">
            {countByKind.map(({ kind, count }) => (
              <li key={kind} data-kind={kind}>
                {kinds[kind].icon} {count} {count === 1 ? kinds[kind].label.toLowerCase() : kinds[kind].plural}
              </li>
            ))}
          </ul>
        )}
      </header>

      {sorted.length === 0 ? (
        <p className="cr-inbox__empty">{emptyText}</p>
      ) : (
        <ol className="cr-inbox__list">
          {sorted.map((item) => (
            <li key={item.id} className="cr-inbox__item cr-surface" data-kind={item.kind} data-urgency={item.urgency}>
              <span className="cr-inbox__kind">
                {kinds[item.kind].icon}
                {kinds[item.kind].label}
                {item.urgency === 'high' && <span className="cr-inbox__urgent">Urgent</span>}
              </span>
              {onOpen ? (
                <button type="button" className="cr-inbox__item-title" onClick={() => onOpen(item)}>
                  {item.title}
                </button>
              ) : (
                <span className="cr-inbox__item-title">{item.title}</span>
              )}
              {item.detail && <span className="cr-inbox__detail">{item.detail}</span>}
              <span className="cr-inbox__meta">
                <Avatar name={item.agentName} size="sm" decorative />
                {item.agentName}
                {reference !== undefined && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>waiting {formatDuration(reference - item.createdAt)}</span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
