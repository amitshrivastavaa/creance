import { useEffect, useId, useState, type KeyboardEvent } from 'react';

export interface ListItem {
  key: string;
  disabled?: boolean;
}

/**
 * Keyboard model for an ARIA 1.2 combobox: focus stays in the input while arrow keys move a
 * highlighted option, exposed through aria-activedescendant.
 */
export function useListbox<T extends ListItem>(items: T[], open: boolean, onPick: (item: T) => void) {
  const listId = useId();
  // The highlight resets to the first usable item whenever the list opens or what it shows
  // changes. Keyed on content, not identity, so a fresh options array each render is fine.
  const key = `${open}\n${items.map((i) => i.key).join('\n')}`;
  const [chosen, setChosen] = useState({ key: '', index: -1 });
  const active = chosen.key === key ? chosen.index : open ? items.findIndex((i) => !i.disabled) : -1;
  const setActive = (index: number) => setChosen({ key, index });
  const optionId = (i: number) => `${listId}-${i}`;

  useEffect(() => {
    if (active < 0) return;
    document.getElementById(optionId(active))?.scrollIntoView?.({ block: 'nearest' });
  });

  const move = (from: number, step: 1 | -1) => {
    for (let n = 1; n <= items.length; n++) {
      const i = (from + step * n + items.length) % items.length;
      if (!items[i]?.disabled) return i;
    }
    return -1;
  };

  /** Returns true when the key was handled. */
  const onKeyDown = (e: KeyboardEvent, openList: () => void) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return openList(), true;
      setActive(move(active < 0 ? (e.key === 'ArrowDown' ? -1 : 0) : active, e.key === 'ArrowDown' ? 1 : -1));
      return true;
    }
    if (!open) return false;
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setActive(e.key === 'Home' ? move(-1, 1) : move(0, -1));
      return true;
    }
    if (e.key === 'Enter' && active >= 0 && items[active]) {
      e.preventDefault();
      onPick(items[active]);
      return true;
    }
    return false;
  };

  return {
    listId,
    active,
    setActive,
    optionId,
    onKeyDown,
    activeDescendant: open && active >= 0 ? optionId(active) : undefined,
  };
}

/** The label with the first case-insensitive match of the query in bold. */
export function splitMatch(label: string, query: string): [string, string, string] {
  const i = query ? label.toLowerCase().indexOf(query.toLowerCase()) : -1;
  return i < 0 ? [label, '', ''] : [label.slice(0, i), label.slice(i, i + query.length), label.slice(i + query.length)];
}

export const defaultFilter = (label: string, query: string) => label.toLowerCase().includes(query.trim().toLowerCase());
