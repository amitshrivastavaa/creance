'use client';

import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { LiveRegion } from '../../internal/LiveRegion';
import { Message } from '../../molecules/Message/Message';
import { MessageList } from '../../molecules/MessageList/MessageList';
import { PromptInput, type PromptInputProps } from '../../molecules/PromptInput/PromptInput';
import { Reasoning } from '../../molecules/Reasoning/Reasoning';
import { Sources, type Source } from '../../molecules/Sources/Sources';
import { Suggestions } from '../../molecules/Suggestions/Suggestions';
import './Chat.css';

export interface ChatMessage {
  id: string;
  from: 'user' | 'assistant';
  /** The message. Render markdown yourself; the kit does not parse it. */
  content?: ReactNode;
  /** `pending` shows dots before the first word, `streaming` a caret after the last. Default `done`. */
  status?: 'pending' | 'streaming' | 'done';
  /** The thinking behind an assistant message, shown folded above it. */
  reasoning?: { content: ReactNode; seconds?: number; thinking?: boolean };
  /** What the answer is based on, listed under it. */
  sources?: Source[];
  /** Under a finished assistant message: copy, try again, feedback. */
  actions?: ReactNode;
}

export interface ChatProps extends Pick<PromptInputProps, 'placeholder' | 'tools' | 'attachments' | 'onRemoveAttachment' | 'onAttach' | 'accept' | 'hint' | 'disabled'> {
  /** Oldest first. You own the list: add the person's message in `onSend`, then the agent's as it arrives. */
  messages: ChatMessage[];
  /** Shown above the agent's messages and used in labels. Default "Assistant". */
  agentName?: string;
  /** Beside the agent's name, usually an Avatar. */
  avatar?: ReactNode;
  /** Called with the text when the person sends a message or chooses a suggestion. */
  onSend?: (text: string) => void;
  /** `working` turns Send into Stop. Default `ready`. */
  status?: 'ready' | 'working';
  onStop?: () => void;
  /** Starting points above the input. Choosing one sends it. */
  suggestions?: string[];
  /** Shown in place of the messages when there are none. */
  empty?: ReactNode;
  /** After the last message, inside the scrolling list: an ApprovalPrompt, a DiffReview, a tool call. */
  children?: ReactNode;
  /** Height of the whole chat. Default fills its container. */
  height?: number | string;
  className?: string;
}

/**
 * A whole conversation with an agent: the messages, starting suggestions and the input. It follows new
 * messages until the person scrolls up, and announces each finished reply once, not every streamed word.
 */
export function Chat({
  messages,
  agentName = 'Assistant',
  avatar,
  onSend,
  status = 'ready',
  onStop,
  suggestions,
  empty,
  children,
  height,
  className,
  ...prompt
}: ChatProps) {
  const last = messages[messages.length - 1];
  const replied = last?.from === 'assistant' && (last.status ?? 'done') === 'done' ? last.id : undefined;

  return (
    <div className={cx('cr-chat', className)} style={height === undefined ? undefined : { height }}>
      <MessageList label={`Conversation with ${agentName}`}>
        {messages.length === 0 && empty ? <div className="cr-chat__empty">{empty}</div> : null}
        {messages.map((m) => (
          <Message key={m.id} from={m.from} name={m.from === 'assistant' ? agentName : undefined} avatar={avatar} status={m.status} actions={m.actions}>
            {m.reasoning && (
              <Reasoning seconds={m.reasoning.seconds} thinking={m.reasoning.thinking}>
                {m.reasoning.content}
              </Reasoning>
            )}
            {m.content}
            {m.sources && m.sources.length > 0 && <Sources items={m.sources} />}
          </Message>
        ))}
        {children}
      </MessageList>
      <div className="cr-chat__composer">
        {suggestions && suggestions.length > 0 && <Suggestions items={suggestions} onSelect={onSend} />}
        <PromptInput label={`Message ${agentName}`} status={status} onSubmit={onSend} onStop={onStop} {...prompt} />
      </div>
      {/* Remounted for each finished reply, so the same words are announced again. */}
      <LiveRegion key={replied ?? 'none'} message={replied ? `${agentName} replied` : ''} />
    </div>
  );
}
