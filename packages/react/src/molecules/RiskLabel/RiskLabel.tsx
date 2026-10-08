import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { AlertIcon, CheckIcon, ShieldIcon } from '../../internal/icons';
import './RiskLabel.css';

export type Risk = 'low' | 'medium' | 'high';

const content: Record<Risk, { icon: ReactNode; text: string }> = {
  low: { icon: <CheckIcon />, text: 'Low risk' },
  medium: { icon: <ShieldIcon />, text: 'Medium risk' },
  high: { icon: <AlertIcon />, text: 'High risk' },
};

export interface RiskLabelProps {
  level: Risk;
  className?: string;
}

/** Each level has its own icon and text, so it never depends on colour alone. */
export function RiskLabel({ level, className }: RiskLabelProps) {
  return (
    <span className={cx('cr-risk', className)} data-level={level}>
      {content[level].icon}
      {content[level].text}
    </span>
  );
}
