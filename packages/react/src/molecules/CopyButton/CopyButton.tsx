'use client';

import { forwardRef, useEffect, useState } from 'react';
import { IconButton, type IconButtonProps } from '../../atoms/IconButton';
import { LiveRegion } from '../../internal/LiveRegion';
import { CheckIcon, CopyIcon } from '../../internal/icons';
import { cx } from '../../internal/cx';
import './CopyButton.css';

export interface CopyButtonProps extends Omit<IconButtonProps, 'icon' | 'label' | 'onClick' | 'value' | 'onCopy'> {
  /** The text to copy, or a function that returns it at click time. */
  value: string | (() => string);
  /** What is copied, as the button's name: "Copy command", "Copy run ID". */
  label?: string;
  onCopy?: (text: string) => void;
}

/** Copies text to the clipboard. The icon turns to a check for two seconds and screen readers hear "Copied". */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { value, label = 'Copy', onCopy, className, size = 'sm', ...props },
  ref,
) {
  const [copied, setCopied] = useState(0);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(0), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <>
      <IconButton
        ref={ref}
        size={size}
        tooltip={false}
        label={label}
        icon={copied ? <CheckIcon /> : <CopyIcon />}
        className={cx('cr-copy-button', className)}
        data-copied={copied ? '' : undefined}
        onClick={async () => {
          const text = typeof value === 'function' ? value() : value;
          await navigator.clipboard?.writeText(text);
          onCopy?.(text);
          setCopied(Date.now());
        }}
        {...props}
      />
      {/* A new key each time so a second copy is announced again. */}
      {copied ? <LiveRegion key={copied} message="Copied" /> : null}
    </>
  );
});
