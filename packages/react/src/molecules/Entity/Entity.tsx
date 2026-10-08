import type { ReactNode } from 'react';
import { Avatar } from '../../atoms/Avatar';
import { cx } from '../../internal/cx';
import './Entity.css';

export interface EntityProps {
  name: string;
  kind?: 'agent' | 'human';
  /** One line under the name. */
  description?: ReactNode;
  /** Buttons or a DotsMenu at the end of the row. */
  actions?: ReactNode;
  className?: string;
}

/** An agent or a person as a row: avatar, name, a line of detail, and actions. */
export function Entity({ name, kind = 'agent', description, actions, className }: EntityProps) {
  return (
    <div className={cx('cr-entity cr-surface', className)}>
      <Avatar name={name} kind={kind} decorative />
      <div className="cr-entity__text">
        <strong className="cr-entity__name">{name}</strong>
        {description && <span className="cr-entity__description">{description}</span>}
      </div>
      {actions && <div className="cr-entity__actions">{actions}</div>}
    </div>
  );
}
