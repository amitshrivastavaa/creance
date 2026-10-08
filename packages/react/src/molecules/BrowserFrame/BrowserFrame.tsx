import { useId, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './BrowserFrame.css';

export interface BrowserFrameProps {
  /** The address shown in the bar. Display only. */
  url?: string;
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
}

/** A browser window drawn around a preview or screenshot. */
export function BrowserFrame({ url, children, caption, className }: BrowserFrameProps) {
  const captionId = useId();
  return (
    <figure aria-labelledby={caption ? captionId : undefined} className={cx('cr-browser-frame cr-surface', className)}>
      <div className="cr-browser-frame__bar" aria-hidden="true">
        <span className="cr-browser-frame__lights">
          <span />
          <span />
          <span />
        </span>
        {url && <span className="cr-browser-frame__url">{url}</span>}
      </div>
      <div className="cr-browser-frame__body">{children}</div>
      {caption && <figcaption id={captionId} className="cr-browser-frame__caption">{caption}</figcaption>}
    </figure>
  );
}
