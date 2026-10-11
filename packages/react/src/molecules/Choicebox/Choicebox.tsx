'use client';

import { useId, useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Choicebox.css';

export interface ChoiceboxOption {
  value: string;
  title: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

interface Base {
  /** The question the cards answer. */
  legend: ReactNode;
  options: ChoiceboxOption[];
  name?: string;
  className?: string;
}

export type ChoiceboxProps = Base &
  (
    | { type?: 'radio'; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
    | { type: 'checkbox'; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
  );

/** Large cards for a choice that needs a sentence of explanation each. Native radios or checkboxes inside. */
export function Choicebox(props: ChoiceboxProps) {
  const { legend, options, name, className } = props;
  const auto = useId();
  const multiple = props.type === 'checkbox';
  const [own, setOwn] = useState<string[]>(() =>
    multiple ? (props.defaultValue ?? []) : props.defaultValue ? [props.defaultValue] : [],
  );
  const selected: string[] =
    props.value === undefined ? own : multiple ? (props.value as string[]) : [props.value as string];

  const change = (value: string, checked: boolean) => {
    const next = multiple ? (checked ? [...selected, value] : selected.filter((v) => v !== value)) : [value];
    if (props.value === undefined) setOwn(next);
    if (props.type === 'checkbox') props.onValueChange?.(next);
    else props.onValueChange?.(value);
  };

  return (
    <fieldset className={cx('cr-choicebox', className)}>
      <legend className="cr-choicebox__legend">{legend}</legend>
      <div className="cr-choicebox__options">
        {options.map((o) => (
          <label key={o.value} className="cr-choicebox__card">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              className="cr-choicebox__input"
              name={name ?? auto}
              value={o.value}
              disabled={o.disabled}
              checked={selected.includes(o.value)}
              onChange={(e) => change(o.value, e.currentTarget.checked)}
            />
            <span className="cr-choicebox__text">
              <span className="cr-choicebox__title">{o.title}</span>
              {o.description && <span className="cr-choicebox__description">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
