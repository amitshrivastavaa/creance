import { useRef, useState } from 'react';
import { cx } from '../../internal/cx';
import { CheckIcon, CrossIcon, PlusIcon } from '../../internal/icons';
import { Highlight, useItems, type ComboboxBaseProps, type Item } from '../Combobox/Combobox';
import { useListbox } from '../Combobox/useListbox';
import '../../atoms/Input/Input.css';
import '../Combobox/Combobox.css';

export interface MultiSelectProps extends ComboboxBaseProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Accessible name prefix of each chip's remove button. Default "Remove". */
  removeLabel?: string;
}

/**
 * Pick several from a list. Picks become chips; Enter toggles the highlighted option and the
 * list stays open; Backspace in an empty field removes the last chip.
 */
export function MultiSelect(props: MultiSelectProps) {
  const { value, defaultValue = [], onValueChange, placeholder, emptyMessage = 'No matches', onCreate, createLabel, disabled, id, className, removeLabel = 'Remove' } = props;
  const [own, setOwn] = useState<string[]>(defaultValue);
  const selected = value ?? own;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const byValue = new Map(props.options.map((o) => [o.value, o]));

  const set = (next: string[]) => {
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };
  const items = useItems(props, query, true);
  const pick = (item: Item) => {
    if (item.create !== undefined) {
      onCreate?.(item.create);
    } else {
      const v = item.option!.value;
      set(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
    }
    setQuery('');
  };
  const list = useListbox(items, open, pick);

  return (
    <div
      className={cx('cr-combobox', className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
          setQuery('');
        }
      }}
    >
      {/* A mouse convenience: clicking between chips focuses the input, which is already in the tab order. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="cr-combobox__field cr-input"
        data-multiple=""
        data-disabled={disabled || undefined}
        aria-invalid={props['aria-invalid']}
        onClick={() => input.current?.focus()}
      >
        {selected.map((v) => {
          const label = byValue.get(v)?.label ?? v;
          return (
            <span key={v} className="cr-combobox__chip">
              {label}
              <button
                type="button"
                className="cr-combobox__chip-remove"
                aria-label={`${removeLabel} ${label}`}
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  set(selected.filter((s) => s !== v));
                  input.current?.focus();
                }}
              >
                <CrossIcon />
              </button>
            </span>
          );
        })}
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
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (list.onKeyDown(e, () => setOpen(true))) return;
            if (e.key === 'Backspace' && !query && selected.length) set(selected.slice(0, -1));
            if (e.key === 'Escape' && open) {
              e.preventDefault();
              setOpen(false);
            }
          }}
        />
      </div>
      <ul
        id={list.listId}
        role="listbox"
        aria-multiselectable="true"
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
            aria-selected={item.option ? selected.includes(item.option.value) : false}
            aria-disabled={item.disabled || undefined}
            className="cr-combobox__option"
            data-active={i === list.active || undefined}
            data-create={item.create !== undefined || undefined}
            onMouseMove={() => !item.disabled && list.setActive(i)}
            onClick={() => !item.disabled && pick(item)}
          >
            {item.option ? (
              <>
                <span className="cr-combobox__check">{selected.includes(item.option.value) && <CheckIcon />}</span>
                {item.option.leading}
                <Highlight label={item.option.label} query={query} />
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
