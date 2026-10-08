import * as RadixDialog from '@radix-ui/react-dialog';
import { useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { cx } from '../../internal/cx';
import '../Dialog/Dialog.css';
import './DestructiveActionModal.css';

export interface DestructiveActionModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The button that opens it. */
  trigger?: ReactElement;
  /** A question: "Delete Deploy Fixer?" */
  title: ReactNode;
  /** Exactly what is lost, and that it can't be undone. */
  description: ReactNode;
  /** Names the action: "Delete agent". */
  confirmLabel: string;
  /** Default "Cancel". */
  cancelLabel?: string;
  /** When set, the action stays off until this exact text is typed. Use it for things that can't be recovered. */
  confirmText?: string;
  onConfirm: () => void;
  className?: string;
}

/**
 * An alert dialog for an action that can't be undone. Focus starts on Cancel, and the red action can
 * require typing a name first.
 */
export function DestructiveActionModal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmText,
  onConfirm,
  className,
}: DestructiveActionModalProps) {
  const id = useId();
  const [typed, setTyped] = useState('');
  const cancel = useRef<HTMLButtonElement>(null);
  const ready = confirmText === undefined || typed === confirmText;

  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) setTyped('');
        onOpenChange?.(o);
      }}
    >
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="cr-dialog-overlay" />
        <RadixDialog.Content
          role="alertdialog"
          className={cx('cr-dialog cr-glass cr-destructive', className)}
          onOpenAutoFocus={(e) => {
            // The safe choice gets focus, unless there is a name to type.
            if (confirmText === undefined) {
              e.preventDefault();
              cancel.current?.focus();
            }
          }}
        >
          <RadixDialog.Title className="cr-dialog__title">{title}</RadixDialog.Title>
          <RadixDialog.Description className="cr-dialog__description">{description}</RadixDialog.Description>
          {confirmText !== undefined && (
            <div className="cr-destructive__confirm">
              <label htmlFor={`${id}-confirm`} className="cr-destructive__label">
                Type <code>{confirmText}</code> to confirm
              </label>
              <Input id={`${id}-confirm`} value={typed} autoComplete="off" spellCheck={false} onChange={(e) => setTyped(e.currentTarget.value)} />
            </div>
          )}
          <div className="cr-dialog__actions">
            <RadixDialog.Close asChild>
              <Button ref={cancel}>{cancelLabel}</Button>
            </RadixDialog.Close>
            <Button
              className="cr-destructive__action"
              disabled={!ready}
              onClick={() => {
                onConfirm();
                setTyped('');
                onOpenChange?.(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
