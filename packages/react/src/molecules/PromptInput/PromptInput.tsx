'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { CrossIcon, FileIcon, ImageIcon, PlusIcon, SendIcon, StopIcon } from '../../internal/icons';
import './PromptInput.css';

export interface PromptAttachment {
  id: string;
  name: string;
  /** Shown after the name, for example "48 KB". */
  detail?: string;
  kind?: 'file' | 'image';
}

export interface PromptInputProps {
  /** Accessible name of the form and its text field, for example "Message Deploy Fixer". */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text on Enter or Send. An uncontrolled field then clears. */
  onSubmit?: (value: string) => void;
  /** `working` turns Send into Stop. Default `ready`. */
  status?: 'ready' | 'working';
  onStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Files already attached, shown above the text. */
  attachments?: PromptAttachment[];
  onRemoveAttachment?: (id: string) => void;
  /** Shows the attach button. Called with the files the person picks. */
  onAttach?: (files: File[]) => void;
  /** File types the picker offers, as for `<input accept>`. */
  accept?: string;
  /** Beside the attach button: a ModelPicker, toggles. */
  tools?: ReactNode;
  /** Text before the button. Default is the keyboard hint. Pass `null` for none. */
  hint?: ReactNode;
  sendLabel?: string;
  stopLabel?: string;
  attachLabel?: string;
  className?: string;
}

const defaultHint = (
  <>
    <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line
  </>
);

/**
 * Where you write to an agent. Enter sends and Shift+Enter starts a new line. Send is the one blue button;
 * while the agent works it becomes Stop.
 */
export function PromptInput({
  label,
  value: controlled,
  defaultValue = '',
  onValueChange,
  onSubmit,
  status = 'ready',
  onStop,
  placeholder,
  disabled,
  attachments,
  onRemoveAttachment,
  onAttach,
  accept,
  tools,
  hint = defaultHint,
  sendLabel = 'Send',
  stopLabel = 'Stop',
  attachLabel = 'Attach a file',
  className,
}: PromptInputProps) {
  const [own, setOwn] = useState(defaultValue);
  const value = controlled ?? own;
  const field = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const working = status === 'working';
  const empty = value.trim() === '';

  // Grow with the text, up to the limit in the stylesheet.
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function change(next: string) {
    setOwn(next);
    onValueChange?.(next);
  }

  function submit() {
    if (empty || disabled) return;
    onSubmit?.(value.trim());
    change('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter while composing text in an input method confirms the composition, not the message.
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    submit();
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    if (files.length) onAttach?.(files);
    e.target.value = '';
  }

  return (
    <form
      aria-label={label}
      className={cx('cr-prompt cr-glass', className)}
      data-status={status}
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        submit();
      }}
    >
      {attachments && attachments.length > 0 && (
        <ul className="cr-prompt__attachments" aria-label="Attached files">
          {attachments.map((a) => (
            <li key={a.id} className="cr-prompt__attachment">
              <span className="cr-prompt__attachment-icon">{a.kind === 'image' ? <ImageIcon /> : <FileIcon />}</span>
              <span className="cr-prompt__attachment-name">{a.name}</span>
              {a.detail && <span className="cr-prompt__attachment-detail">{a.detail}</span>}
              {onRemoveAttachment && (
                <button type="button" className="cr-prompt__remove" aria-label={`Remove ${a.name}`} onClick={() => onRemoveAttachment(a.id)}>
                  <CrossIcon />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <textarea
        ref={field}
        className="cr-prompt__field"
        aria-label={label}
        rows={1}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => change(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="cr-prompt__bar">
        {onAttach && (
          <>
            <input ref={picker} type="file" hidden multiple accept={accept} tabIndex={-1} onChange={onPick} />
            <button type="button" className="cr-prompt__attach" aria-label={attachLabel} disabled={disabled} onClick={() => picker.current?.click()}>
              <PlusIcon />
            </button>
          </>
        )}
        {tools}
        {hint !== null && <span className="cr-prompt__hint">{hint}</span>}
        {working ? (
          <button type="button" className="cr-prompt__go" data-kind="stop" aria-label={stopLabel} onClick={onStop}>
            <StopIcon />
          </button>
        ) : (
          <button type="submit" className="cr-prompt__go" data-kind="send" aria-label={sendLabel} disabled={empty || disabled}>
            <SendIcon />
          </button>
        )}
      </div>
    </form>
  );
}
