import * as RadixDialog from '@radix-ui/react-dialog';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { IconButton } from '../../atoms/IconButton';
import { cx } from '../../internal/cx';
import { CrossIcon } from '../../internal/icons';
import '../Dialog/Dialog.css';
import './Sheet.css';

/** A panel that slides in from an edge, for detail you open and close beside your work. Radix Dialog. */
export const Sheet = RadixDialog.Root;
export const SheetTrigger = RadixDialog.Trigger;
export const SheetClose = RadixDialog.Close;

export interface SheetContentProps extends Omit<ComponentPropsWithoutRef<typeof RadixDialog.Content>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons pinned to the bottom. */
  actions?: ReactNode;
  side?: 'right' | 'left' | 'bottom';
  /** Accessible name of the close button. Default "Close". */
  closeLabel?: string;
}

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(function SheetContent(
  { title, description, actions, side = 'right', closeLabel = 'Close', className, children, ...props },
  ref,
) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="cr-dialog-overlay" />
      <RadixDialog.Content
        ref={ref}
        className={cx('cr-sheet cr-glass', className)}
        data-side={side}
        {...(description ? {} : { 'aria-describedby': undefined })}
        {...props}
      >
        <div className="cr-sheet__head">
          <RadixDialog.Title className="cr-sheet__title">{title}</RadixDialog.Title>
          <RadixDialog.Close asChild>
            <IconButton label={closeLabel} icon={<CrossIcon />} size="sm" tooltip={false} />
          </RadixDialog.Close>
        </div>
        {description && <RadixDialog.Description className="cr-sheet__description">{description}</RadixDialog.Description>}
        <div className="cr-sheet__body">{children}</div>
        {actions && <div className="cr-sheet__actions">{actions}</div>}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});
