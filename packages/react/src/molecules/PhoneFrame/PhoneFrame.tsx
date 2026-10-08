import { useId, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './PhoneFrame.css';

export interface PhoneFrameProps {
  children: ReactNode;
  caption?: ReactNode;
  /** Screen width in CSS pixels. Default 220. */
  width?: number;
  className?: string;
}

/** A phone drawn around content, to show a component at phone size. */
export function PhoneFrame({ children, caption, width = 220, className }: PhoneFrameProps) {
  const captionId = useId();
  return (
    <figure aria-labelledby={caption ? captionId : undefined} className={cx('cr-phone-frame', className)} style={{ width }}>
      <div className="cr-phone-frame__body">
        <div className="cr-phone-frame__screen">
          <span className="cr-phone-frame__island" aria-hidden="true" />
          {children}
        </div>
      </div>
      {caption && <figcaption id={captionId} className="cr-phone-frame__caption">{caption}</figcaption>}
    </figure>
  );
}
