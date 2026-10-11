'use client';

import { Button } from '../../atoms/Button/Button';
import { cx } from '../../internal/cx';
import './Suggestions.css';

export interface SuggestionsProps {
  /** Short prompts. Each is what gets sent. */
  items: string[];
  onSelect?: (item: string) => void;
  /** Accessible name of the list. Default "Suggestions". */
  label?: string;
  className?: string;
}

/** Starting points above the input. Choosing one sends it. */
export function Suggestions({ items, onSelect, label = 'Suggestions', className }: SuggestionsProps) {
  return (
    <ul className={cx('cr-suggestions', className)} aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <Button size="sm" onClick={() => onSelect?.(item)}>
            {item}
          </Button>
        </li>
      ))}
    </ul>
  );
}
