import type { ReactNode } from 'react';
import { ProgressBar } from '../../atoms/ProgressBar';
import { cx } from '../../internal/cx';
import './ProjectBanner.css';

export interface ProjectBannerProps {
  /** The project. Its first letter becomes the badge. */
  name: string;
  /** One sentence: what needs attention. */
  message: ReactNode;
  /** Optional progress toward a limit, with an accessible label. */
  progress?: { value: number; max: number; label: string };
  /** The one action, such as "Raise budget". */
  action?: ReactNode;
  className?: string;
}

/** A project-wide notice at the top of a project's pages, with one action. */
export function ProjectBanner({ name, message, progress, action, className }: ProjectBannerProps) {
  return (
    <section aria-label={`${name} notice`} className={cx('cr-project-banner cr-surface', className)}>
      <span className="cr-project-banner__badge" aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="cr-project-banner__text">
        <strong>{name}</strong>
        <span className="cr-project-banner__message">{message}</span>
      </div>
      {progress && (
        <div className="cr-project-banner__progress">
          <ProgressBar value={progress.value} max={progress.max} label={progress.label} />
        </div>
      )}
      {action}
    </section>
  );
}
