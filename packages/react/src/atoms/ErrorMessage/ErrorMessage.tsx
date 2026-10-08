import type { HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import { InfoIcon } from '../../internal/icons';
import './ErrorMessage.css';

export interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Announce it when it appears, for errors that follow an action such as Save. Default false. */
  live?: boolean;
}

/** What went wrong and what to do next, in one line of red text. Never apologises, never vague. */
export function ErrorMessage({ live, className, children, ...props }: ErrorMessageProps) {
  return (
    <p role={live ? 'alert' : undefined} className={cx('cr-error-message', className)} {...props}>
      <InfoIcon />
      <span>{children}</span>
    </p>
  );
}
