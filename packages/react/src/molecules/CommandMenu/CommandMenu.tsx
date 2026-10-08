import * as RadixDialog from '@radix-ui/react-dialog';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Kbd } from '../../atoms/Kbd';
import { cx } from '../../internal/cx';
import { SearchIcon } from '../../internal/icons';
import { Highlight } from '../Combobox/Combobox';
import { defaultFilter, useListbox } from '../Combobox/useListbox';
import '../Combobox/Combobox.css';
import '../Dialog/Dialog.css';
import '../Menu/Menu.css';
import './CommandMenu.css';

export interface Command {
  id: string;
  label: string;
  /** Heading the command is listed under. Groups keep the order they first appear in. */
  group?: string;
  /** Other words that should find it. */
  keywords?: string[];
  icon?: ReactNode;
  /** Shown at the end of the row: a status, a date. */
  meta?: ReactNode;
  /** Display only. */
  shortcut?: ReactNode;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  onSelect: () => void;
}

export interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
  placeholder?: string;
  emptyMessage?: ReactNode;
  /** Toggle with ⌘K (Ctrl+K elsewhere) from anywhere on the page. Default true. */
  hotkey?: boolean;
  /** Accessible name of the dialog. Default "Command menu". */
  label?: string;
  className?: string;
}

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Search everything and act from the keyboard: a dialog with a filtered, grouped list of commands. */
export function CommandMenu({
  open,
  onOpenChange,
  commands,
  placeholder = 'Type a command or search',
  emptyMessage = 'No results',
  hotkey = true,
  label = 'Command menu',
  className,
}: CommandMenuProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (isMac() ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey, open, onOpenChange]);

  const items = useMemo(() => {
    const q = query.trim();
    const hits = q ? commands.filter((c) => [c.label, ...(c.keywords ?? [])].some((w) => defaultFilter(w, q))) : commands;
    // Flatten in group order so arrow keys follow what is on screen.
    const order = [...new Set(hits.map((c) => c.group ?? ''))];
    return order.flatMap((g) => hits.filter((c) => (c.group ?? '') === g)).map((c) => ({ key: c.id, disabled: c.disabled, command: c }));
  }, [commands, query]);

  const close = () => {
    onOpenChange(false);
    setQuery('');
  };
  const run = (item: (typeof items)[number]) => {
    close();
    item.command.onSelect();
  };
  const list = useListbox(items, open, run);

  return (
    <RadixDialog.Root open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="cr-dialog-overlay cr-command-overlay" />
        <RadixDialog.Content className={cx('cr-command cr-glass', className)} aria-label={label} aria-describedby={undefined}>
          <RadixDialog.Title className="cr-visually-hidden">{label}</RadixDialog.Title>
          <div className="cr-command__search">
            <SearchIcon />
            <input
              role="combobox"
              aria-expanded="true"
              aria-controls={list.listId}
              aria-autocomplete="list"
              aria-activedescendant={list.activeDescendant}
              aria-label={placeholder}
              className="cr-command__input"
              placeholder={placeholder}
              value={query}
              autoComplete="off"
              onChange={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={(e) => list.onKeyDown(e, () => {})}
            />
            <Kbd>Esc</Kbd>
          </div>
          {/* Focus stays in the input; the list and its options are driven by aria-activedescendant. */}
          {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
          <div id={list.listId} role="listbox" aria-label="Results" className="cr-command__list" onMouseDown={(e) => e.preventDefault()}>
            {items.length === 0 && <p className="cr-command__empty">{emptyMessage}</p>}
            {items.map((item, i) => {
              const c = item.command;
              const heading = c.group && c.group !== items[i - 1]?.command.group ? c.group : null;
              return (
                <div key={c.id} role="presentation">
                  {heading && (
                    <div role="presentation" className="cr-command__group">
                      {heading}
                    </div>
                  )}
                  {/* Options are reached from the keyboard through the input (aria-activedescendant). */}
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
                  <div
                    id={list.optionId(i)}
                    role="option"
                    aria-selected={i === list.active}
                    aria-disabled={c.disabled || undefined}
                    className="cr-combobox__option"
                    data-active={i === list.active || undefined}
                    data-tone={c.tone}
                    onMouseMove={() => !c.disabled && list.setActive(i)}
                    onClick={() => !c.disabled && run(item)}
                  >
                    {c.icon}
                    <Highlight label={c.label} query={query} />
                    {c.meta && <span className="cr-combobox__meta">{c.meta}</span>}
                    {c.shortcut && <span className="cr-command__shortcut">{c.shortcut}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cr-command__footer" aria-hidden="true">
            <span>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
            </span>
            <span>
              <Kbd>↵</Kbd> open
            </span>
            <span>
              <Kbd>Esc</Kbd> close
            </span>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
