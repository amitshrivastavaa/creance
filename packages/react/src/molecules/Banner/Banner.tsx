import { useState, type ReactNode } from 'react';
import { IconButton } from '../../atoms/IconButton';
import { cx } from '../../internal/cx';
import { AlertIcon, CrossIcon, DotIcon, InfoIcon } from '../../internal/icons';
import './Banner.css';

export interface BannerProps {
  children: ReactNode;
  /** `neutral` for notices, `ink` for "needs you", `danger` for outages and failures. */
  tone?: 'neutral' | 'ink' | 'danger';
  /** A link or button, such as "Open inbox". */
  action?: ReactNode;
  /** Shows a dismiss button. */
  onDismiss?: () => void;
  /** Remember the dismissal in this browser under this key, so the banner stays gone. */
  storageKey?: string;
  className?: string;
}

const read = (key?: string) => {
  try {
    return key ? localStorage.getItem(key) === 'dismissed' : false;
  } catch {
    return false;
  }
};

const icons = { neutral: InfoIcon, ink: DotIcon, danger: AlertIcon };

/** A full-width message across the top of a page or panel. */
export function Banner({ children, tone = 'neutral', action, onDismiss, storageKey, className }: BannerProps) {
  const [dismissed, setDismissed] = useState(() => read(storageKey));
  if (dismissed) return null;
  const Icon = icons[tone];
  const dismissible = onDismiss || storageKey;
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cx('cr-banner', className)} data-tone={tone}>
      <Icon />
      <div className="cr-banner__text">{children}</div>
      {action && <div className="cr-banner__action">{action}</div>}
      {dismissible && (
        <IconButton
          className="cr-banner__dismiss"
          label="Dismiss"
          icon={<CrossIcon />}
          size="sm"
          tooltip={false}
          onClick={() => {
            try {
              if (storageKey) localStorage.setItem(storageKey, 'dismissed');
            } catch {
              // Storage can be unavailable (private mode); dismissing still works for this page view.
            }
            setDismissed(true);
            onDismiss?.();
          }}
        />
      )}
    </div>
  );
}
