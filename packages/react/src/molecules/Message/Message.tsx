import type { ReactNode } from 'react';
import { LoadingDots } from '../../atoms/LoadingDots/LoadingDots';
import { cx } from '../../internal/cx';
import { VisuallyHidden } from '../../internal/VisuallyHidden';
import './Message.css';

export interface MessageProps {
  /** `user` sits on the right in a tile. `assistant` is plain text on the page, under its name. */
  from: 'user' | 'assistant';
  /** Who is speaking. Shown above an assistant message; read out for a user message. Default "You" or "Assistant". */
  name?: string;
  /** Beside the name of an assistant message, usually an Avatar. */
  avatar?: ReactNode;
  /**
   * `pending` shows three dots before the first word. `streaming` puts a caret at the end of the text.
   * Default `done`.
   */
  status?: 'pending' | 'streaming' | 'done';
  /** What screen readers hear while `pending`. Default "{name} is thinking". */
  pendingLabel?: string;
  /** Under a finished assistant message: copy, try again, feedback. */
  actions?: ReactNode;
  /** The message. Render markdown yourself; the kit does not parse it. */
  children?: ReactNode;
  className?: string;
}

/** One turn in a conversation. The message body is whatever you render, including Reasoning, Sources and tool calls. */
export function Message({ from, name, avatar, status = 'done', pendingLabel, actions, children, className }: MessageProps) {
  const who = name ?? (from === 'user' ? 'You' : 'Assistant');
  return (
    <div className={cx('cr-message', className)} data-from={from} data-status={status}>
      {from === 'assistant' ? (
        <div className="cr-message__who">
          {avatar}
          <span>{who}</span>
        </div>
      ) : (
        <VisuallyHidden>{who}: </VisuallyHidden>
      )}
      {status === 'pending' ? (
        <LoadingDots tone="muted">
          <VisuallyHidden>{pendingLabel ?? `${who} is thinking`}</VisuallyHidden>
        </LoadingDots>
      ) : (
        <div className="cr-message__content">{children}</div>
      )}
      {actions && status === 'done' && <div className="cr-message__actions">{actions}</div>}
    </div>
  );
}
