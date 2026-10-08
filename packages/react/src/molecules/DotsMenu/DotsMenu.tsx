import type { ReactNode } from 'react';
import { IconButton } from '../../atoms/IconButton';
import { DotsIcon } from '../../internal/icons';
import { Menu, MenuContent, MenuTrigger } from '../Menu';

export interface DotsMenuProps {
  /** Say whose actions these are: "More actions for Docs Writer". */
  label: string;
  /** `MenuItem`s. Put destructive ones last, after a separator. */
  children: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

/** A "…" button that opens a menu of secondary actions for one row or card. */
export function DotsMenu({ label, children, size = 'sm', className }: DotsMenuProps) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <IconButton label={label} icon={<DotsIcon />} tooltip={false} size={size} className={className} />
      </MenuTrigger>
      <MenuContent align="end">{children}</MenuContent>
    </Menu>
  );
}
