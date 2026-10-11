'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Dialog.css';

/** Radix Dialog: traps focus, closes on Escape, returns focus to the trigger. */
export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export interface DialogContentProps extends Omit<ComponentPropsWithoutRef<typeof RadixDialog.Content>, 'title'> {
  title: ReactNode;
  /** One or two sentences: what happens, and what does not. */
  description?: ReactNode;
  /** Buttons, right-aligned. Put the safe choice first and the action that answers the title last. */
  actions?: ReactNode;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { title, description, actions, className, children, ...props },
  ref,
) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="cr-dialog-overlay" />
      <RadixDialog.Content
        ref={ref}
        className={cx('cr-dialog cr-glass', className)}
        {...(description ? {} : { 'aria-describedby': undefined })}
        {...props}
      >
        <RadixDialog.Title className="cr-dialog__title">{title}</RadixDialog.Title>
        {description && <RadixDialog.Description className="cr-dialog__description">{description}</RadixDialog.Description>}
        {children}
        {actions && <div className="cr-dialog__actions">{actions}</div>}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});
