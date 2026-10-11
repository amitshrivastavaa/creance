'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../atoms/Button/Button';
import { cx } from '../../internal/cx';
import { ArrowDownIcon } from '../../internal/icons';
import { LiveRegion } from '../../internal/LiveRegion';
import './MessageList.css';

const PIN_THRESHOLD = 24;

export interface MessageListProps {
  /** The messages, oldest first. */
  children: ReactNode;
  /** Accessible name of the scrollable region. Default "Conversation". */
  label?: string;
  /** Text of the button shown when new content arrives while the person has scrolled up. Default "Jump to latest". */
  jumpLabel?: string;
  /**
   * Read out politely when it changes, for example "Deploy Fixer replied". Streaming text is not announced
   * word by word; say what happened once it has.
   */
  announcement?: string;
  className?: string;
}

/**
 * A scrolling column of messages that follows new content. Following pauses when the person scrolls up,
 * and a button brings them back.
 */
export function MessageList({ children, label = 'Conversation', jumpLabel = 'Jump to latest', announcement = '', className }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const jumping = useRef(false);
  const [hasNew, setHasNew] = useState(false);

  // The content grows as messages arrive and as text streams in: follow it, or offer the way back.
  useEffect(() => {
    const el = scrollRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const follow = () => {
      if (pinned.current) el.scrollTop = el.scrollHeight;
      else if (el.scrollHeight > el.clientHeight) setHasNew(true);
    };
    follow();
    const observer = new ResizeObserver(follow);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

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

  return (
    <div className={cx('cr-message-list', className)}>
      {/* Focusable so keyboard users can scroll it. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div ref={scrollRef} className="cr-message-list__scroll" role="region" aria-label={label} tabIndex={0} onScroll={onScroll}>
        <div ref={innerRef} className="cr-message-list__inner">
          {children}
        </div>
      </div>
      {hasNew && (
        <Button size="sm" className="cr-message-list__jump" onClick={jumpToLatest}>
          <ArrowDownIcon /> {jumpLabel}
        </Button>
      )}
      <LiveRegion message={announcement} />
    </div>
  );
}
