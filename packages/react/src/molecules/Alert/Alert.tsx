import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { AlertIcon, InfoIcon } from '../../internal/icons';
import './Alert.css';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  /** `danger` for failures. It is announced when it appears, so render it only when something just went wrong. */
  tone?: 'info' | 'danger';
}

/** A message in the page: what happened, and what to do about it. */
export function Alert({ title, tone = 'info', className, children, ...props }: AlertProps) {
  const Icon = tone === 'danger' ? AlertIcon : InfoIcon;
  return (
    <div role={tone === 'danger' ? 'alert' : 'note'} className={cx('cr-alert', className)} data-tone={tone} {...props}>
      <Icon />
      <div className="cr-alert__body">
        <strong className="cr-alert__title">{title}</strong>
        {children && <div className="cr-alert__text">{children}</div>}
      </div>
    </div>
  );
}
