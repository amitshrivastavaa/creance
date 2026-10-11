'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import '../Menu/Menu.css';
import './ContextCard.css';

export interface ContextCardProps {
  /** One focusable element, such as a link to the agent. */
  children: ReactElement;
  /** A preview. Supplementary: everything here must also be reachable by following the trigger. */
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Milliseconds of hover or focus before it shows. Default 400. */
  delay?: number;
  className?: string;
}

/**
 * A preview card that appears on hover or keyboard focus and stays while the pointer is over it.
 * Escape dismisses it. Focus never moves into it, so it never traps anyone.
 */
export function ContextCard({ children, content, side = 'bottom', delay = 400, className }: ContextCardProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 120);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      {/* An anchor, not a trigger: activating the element does what it always does (follow the link). */}
      <RadixPopover.Anchor asChild onPointerEnter={show} onPointerLeave={hide} onFocus={show} onBlur={hide}>
        {children}
      </RadixPopover.Anchor>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className={cx('cr-context-card cr-popover', className)}
          side={side}
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onPointerEnter={() => clearTimeout(timer.current)}
          onPointerLeave={hide}
        >
          {content}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
