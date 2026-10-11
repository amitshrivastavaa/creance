'use client';

import { useId, type ReactNode } from 'react';
import { Radio } from '../../atoms/Radio';
import { cx } from '../../internal/cx';
import './RadioGroup.css';

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** The question the options answer. Rendered as the fieldset legend. */
  legend: ReactNode;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name. Generated if omitted. */
  name?: string;
  className?: string;
}

/** Native radios in a fieldset: arrow keys move between options, Tab leaves the group. */
export function RadioGroup({ legend, options, value, defaultValue, onValueChange, name, className }: RadioGroupProps) {
  const auto = useId();
  return (
    <fieldset className={cx('cr-radio-group', className)}>
      <legend className="cr-radio-group__legend">{legend}</legend>
      {options.map((o) => (
        <Radio
          key={o.value}
          name={name ?? auto}
          value={o.value}
          label={o.label}
          description={o.description}
          disabled={o.disabled}
          {...(value !== undefined ? { checked: value === o.value } : { defaultChecked: defaultValue === o.value })}
          onChange={(e) => e.currentTarget.checked && onValueChange?.(o.value)}
        />
      ))}
    </fieldset>
  );
}
