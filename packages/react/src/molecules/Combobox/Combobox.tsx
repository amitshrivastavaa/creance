import { useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ChevronDownIcon, PlusIcon } from '../../internal/icons';
import { defaultFilter, splitMatch, useListbox } from './useListbox';
import '../../atoms/Input/Input.css';
import './Combobox.css';

export interface ComboboxOption {
  value: string;
  /** Plain text: it is what the field shows and what typing matches. */
  label: string;
  /** Shown at the start of the row, such as an Avatar. */
  leading?: ReactNode;
  /** Shown at the end of the row, such as a status. */
  meta?: ReactNode;
  disabled?: boolean;
}

/** Shared by Combobox and MultiSelect. */
export interface ComboboxBaseProps {
  options: ComboboxOption[];
  placeholder?: string;
  /** Shown when nothing matches and there is no create option. Default "No matches". */
  emptyMessage?: ReactNode;
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** Offer to create what was typed when nothing matches it exactly. */
  onCreate?: (query: string) => void;
  createLabel?: (query: string) => ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

export interface ComboboxProps extends ComboboxBaseProps {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface Item {
  key: string;
  option?: ComboboxOption;
  create?: string;
  disabled?: boolean;
}

export function useItems(props: ComboboxBaseProps, query: string, filtering: boolean) {
  const { options, filter, onCreate } = props;
  return useMemo<Item[]>(() => {
    const q = filtering ? query.trim() : '';
    const shown = q
      ? options.filter((o) => (filter ? filter(o, q) : defaultFilter(o.label, q)))
      : options;
    const items: Item[] = shown.map((o) => ({ key: o.value, option: o, disabled: o.disabled }));
    if (onCreate && q && !options.some((o) => o.label.toLowerCase() === q.toLowerCase())) {
      items.push({ key: `create:${q}`, create: q });
    }
    return items;
  }, [options, filter, onCreate, query, filtering]);
}

export function Highlight({ label, query }: { label: string; query: string }) {
  const [a, b, c] = splitMatch(label, query.trim());
  return (
    <span className="cr-combobox__label">
      {a}
      {b && <strong>{b}</strong>}
      {c}
    </span>
  );
}

/**
 * Type to filter a list and pick one. Focus stays in the field: arrow keys move, Enter picks,
 * Escape closes. Wrap it in `Field` for a label.
 */
export function Combobox(props: ComboboxProps) {
  const { value, defaultValue = null, onValueChange, placeholder, emptyMessage = 'No matches', onCreate, createLabel, disabled, id, className } = props;
  const [own, setOwn] = useState<string | null>(defaultValue);
  const selected = value === undefined ? own : value;
  const selectedLabel = props.options.find((o) => o.value === selected)?.label ?? '';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selectedLabel);
  const [typed, setTyped] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const items = useItems(props, query, typed);
  const close = () => {
    setOpen(false);
    setTyped(false);
  };
  const pick = (item: Item) => {
    if (item.create !== undefined) {
      onCreate?.(item.create);
      close();
      return;
    }
    const next = item.option!.value;
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
    setQuery(item.option!.label);
    close();
  };
  const list = useListbox(items, open, pick);

  return (
    <div
      className={cx('cr-combobox', className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          close();
          setQuery(selectedLabel);
        }
      }}
    >
      <div className="cr-combobox__field cr-input" data-disabled={disabled || undefined} aria-invalid={props['aria-invalid']}>
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={list.listId}
          aria-autocomplete="list"
          aria-activedescendant={list.activeDescendant}
          aria-label={props['aria-label']}
          aria-labelledby={props['aria-labelledby']}
          aria-describedby={props['aria-describedby']}
          aria-invalid={props['aria-invalid']}
          className="cr-combobox__input"
          autoComplete="off"
          placeholder={placeholder}
          disabled={disabled}
          value={open || typed ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setTyped(true);
            setOpen(true);
          }}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (list.onKeyDown(e, () => setOpen(true))) return;
            if (e.key === 'Escape' && open) {
              e.preventDefault();
              close();
              setQuery(selectedLabel);
            }
          }}
        />
        <span className="cr-combobox__chevron" aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </div>
      <ul
        id={list.listId}
        role="listbox"
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        className="cr-combobox__list cr-popover"
        hidden={!open}
        onMouseDown={(e) => e.preventDefault()}
      >
        {items.map((item, i) => (
          // Options are reached from the keyboard through the input (aria-activedescendant).
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <li
            key={item.key}
            id={list.optionId(i)}
            role="option"
            aria-selected={item.option ? item.option.value === selected : false}
            aria-disabled={item.disabled || undefined}
            className="cr-combobox__option"
            data-active={i === list.active || undefined}
            data-create={item.create !== undefined || undefined}
            onMouseMove={() => !item.disabled && list.setActive(i)}
            onClick={() => !item.disabled && pick(item)}
          >
            {item.option ? (
              <>
                {item.option.leading}
                <Highlight label={item.option.label} query={typed ? query : ''} />
                {item.option.meta && <span className="cr-combobox__meta">{item.option.meta}</span>}
              </>
            ) : (
              <>
                <PlusIcon />
                {createLabel ? createLabel(item.create!) : `Create “${item.create}”`}
              </>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li role="presentation" className="cr-combobox__empty">
            {emptyMessage}
          </li>
        )}
      </ul>
    </div>
  );
}
