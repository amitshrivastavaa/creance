'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Code } from '../../atoms/Code/Code';
import { StatusBadge } from '../../molecules/StatusBadge/StatusBadge';
import type { ToolCallStatus } from '../../molecules/ToolCallHeader/ToolCallHeader';
import { cx } from '../../internal/cx';
import { ArrowDownIcon, CheckIcon, CrossIcon, DotIcon, PauseIcon } from '../../internal/icons';
import { LiveRegion } from '../../internal/LiveRegion';
import './RunTimeline.css';

export type TimelineStepStatus = 'running' | 'waiting' | 'done' | 'failed';

export interface TimelineToolCall {
  id: string;
  tool: string;
  status: ToolCallStatus;
  startedAt?: number | undefined;
  endedAt?: number | undefined;
  attempt?: number | undefined;
  error?: string | undefined;
}

export interface TimelineStep {
  id: string;
  title: string;
  status: TimelineStepStatus;
  startedAt?: number | undefined;
  endedAt?: number | undefined;
  error?: string | undefined;
  toolCalls?: TimelineToolCall[];
  children?: TimelineStep[];
}

export interface RunTimelineProps {
  steps: TimelineStep[];
  /** Follow new steps as they stream in. Following pauses when the person scrolls up. Default true. */
  live?: boolean;
  /** Accessible name of the scrollable region. */
  label?: string;
  /** Makes tool calls selectable, e.g. to show a ToolCallCard in a detail panel. */
  onSelectToolCall?: (id: string) => void;
  selectedToolCallId?: string | undefined;
  /** Shown before the first step arrives. */
  emptyText?: string;
  className?: string;
}

const stepIcon = { running: <DotIcon />, waiting: <PauseIcon />, done: <CheckIcon />, failed: <CrossIcon /> };
const badge = {
  running: { status: 'running', label: 'Running' },
  waiting: { status: 'waiting', label: 'Waiting for you' },
  done: { status: 'done', label: 'Done' },
  failed: { status: 'failed', label: 'Failed' },
} as const;
const callBadge = {
  pending: { status: 'waiting', label: 'Pending' },
  running: { status: 'running', label: 'Running' },
  success: { status: 'done', label: 'Succeeded' },
  error: { status: 'failed', label: 'Failed' },
} as const;

/** Distance from the bottom, in px, that still counts as "at the latest". */
const PIN_THRESHOLD = 32;

function walk(steps: TimelineStep[], visit: (s: TimelineStep) => void) {
  for (const s of steps) {
    visit(s);
    if (s.children) walk(s.children, visit);
  }
}

/** The newest thing worth announcing: a failure or a step that needs the person. */
function announcementFor(steps: TimelineStep[], seen: Set<string>): string | undefined {
  let message: string | undefined;
  walk(steps, (s) => {
    const key = `${s.id}:${s.status}`;
    if ((s.status === 'failed' || s.status === 'waiting') && !seen.has(key)) {
      seen.add(key);
      message = s.status === 'failed' ? `Step failed: ${s.title}. ${s.error ?? ''}` : `Waiting for you: ${s.title}`;
    }
    for (const c of s.toolCalls ?? []) {
      const callKey = `${c.id}:${c.attempt ?? 1}:${c.status}`;
      if (c.status === 'error' && !seen.has(callKey)) {
        seen.add(callKey);
        message = `Tool call ${c.tool} failed: ${c.error ?? ''}`;
      }
    }
  });
  return message;
}

export function RunTimeline({
  steps,
  live = true,
  label = 'Run timeline',
  onSelectToolCall,
  selectedToolCallId,
  emptyText = 'Waiting for the agent to start.',
  className,
}: RunTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const jumping = useRef(false);
  const [hasNew, setHasNew] = useState(false);
  const seen = useRef(new Set<string>());
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const message = announcementFor(steps, seen.current);
    if (message) setAnnouncement(message);
  }, [steps]);

  // New content: follow it if the person is at the bottom, otherwise offer "Jump to latest".
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !live) return;
    if (pinned.current) el.scrollTop = el.scrollHeight;
    else if (el.scrollHeight > el.clientHeight) setHasNew(true);
  }, [steps, live]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < PIN_THRESHOLD;
    if (jumping.current) {
      if (atBottom) jumping.current = false;
      return;
    }
    pinned.current = atBottom;
    if (atBottom) setHasNew(false);
  }

  function jumpToLatest() {
    const el = scrollRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    pinned.current = true;
    jumping.current = !reduce;
    setHasNew(false);
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }

  function renderSteps(list: TimelineStep[]) {
    return (
      <ol className="cr-timeline__list">
        {list.map((step) => (
          <li key={step.id} className="cr-timeline__step" data-status={step.status}>
            <span className="cr-timeline__marker" aria-hidden="true">
              {stepIcon[step.status]}
            </span>
            <div className="cr-timeline__body">
              <div className="cr-timeline__row">
                <span className="cr-timeline__title">{step.title}</span>
                <StatusBadge
                  status={badge[step.status].status}
                  label={badge[step.status].label}
                  startedAt={step.status === 'waiting' ? undefined : step.startedAt}
                  endedAt={step.endedAt}
                />
              </div>
              {step.error && <p className="cr-timeline__error">{step.error}</p>}
              {!!step.toolCalls?.length && (
                <ul className="cr-timeline__calls" aria-label={`Tool calls in ${step.title}`}>
                  {step.toolCalls.map((call) => {
                    const content = (
                      <>
                        <Code>{call.tool}</Code>
                        {(call.attempt ?? 1) > 1 && <span className="cr-timeline__attempt">attempt {call.attempt}</span>}
                        <StatusBadge
                          status={callBadge[call.status].status}
                          label={callBadge[call.status].label}
                          startedAt={call.status === 'pending' ? undefined : call.startedAt}
                          endedAt={call.endedAt}
                        />
                      </>
                    );
                    return (
                      <li key={call.id} className="cr-timeline__call" data-status={call.status}>
                        {onSelectToolCall ? (
                          <button
                            type="button"
                            className="cr-timeline__call-button"
                            aria-current={selectedToolCallId === call.id ? 'true' : undefined}
                            onClick={() => onSelectToolCall(call.id)}
                          >
                            {content}
                          </button>
                        ) : (
                          <div className="cr-timeline__call-row">{content}</div>
                        )}
                        {call.status === 'error' && call.error && (
                          <p className="cr-timeline__error">{call.error}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {!!step.children?.length && renderSteps(step.children)}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className={cx('cr-timeline', className)}>
      {/* Focusable so keyboard users can scroll it. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div ref={scrollRef} className="cr-timeline__scroll" role="region" aria-label={label} tabIndex={0} onScroll={onScroll}>
        {steps.length ? renderSteps(steps) : <p className="cr-timeline__empty">{emptyText}</p>}
      </div>
      {hasNew && (
        <Button size="sm" variant="primary" className="cr-timeline__jump" onClick={jumpToLatest}>
          <ArrowDownIcon /> Jump to latest
        </Button>
      )}
      <LiveRegion message={announcement} />
    </div>
  );
}
