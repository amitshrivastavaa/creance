import { cx } from '../../internal/cx';
import './Avatar.css';

export interface AvatarProps {
  /** Agent or person name. Used for the initials and the accessible name. */
  name: string;
  /** "agent" gets a square shape so agents and people are distinguishable without colour. */
  kind?: 'agent' | 'human';
  size?: 'sm' | 'md';
  /** Hide from assistive tech when the name is already shown next to the avatar. */
  decorative?: boolean;
  className?: string;
}

function initials(name: string): string {
  const words = name.trim().split(/[\s_-]+/).filter(Boolean);
  const letters = words.length > 1 ? (words[0]?.[0] ?? '') + (words[1]?.[0] ?? '') : name.slice(0, 2);
  return letters.toUpperCase();
}

export function Avatar({ name, kind = 'agent', size = 'md', decorative = false, className }: AvatarProps) {
  return (
    <span
      className={cx('cr-avatar', className)}
      data-kind={kind}
      data-size={size}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': name })}
    >
      {initials(name)}
    </span>
  );
}
