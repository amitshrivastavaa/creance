'use client';

import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import { useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { CheckIcon, ChevronDownIcon } from '../../internal/icons';
import '../Menu/Menu.css';
import './ModelPicker.css';

export interface ModelOption {
  value: string;
  label: string;
  /** One line on when to use it. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface ModelPickerProps {
  models: ModelOption[];
  value?: string;
  /** Default is the first model. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name of the button, read before the chosen model. Default "Model". */
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Chooses which model answers. A Radix menu of radio items: arrow keys move, Enter chooses, Escape closes. */
export function ModelPicker({ models, value: controlled, defaultValue, onValueChange, label = 'Model', disabled, className }: ModelPickerProps) {
  const [own, setOwn] = useState(defaultValue ?? models[0]?.value ?? '');
  const value = controlled ?? own;
  const current = models.find((m) => m.value === value);

  return (
    <RadixMenu.Root>
      <RadixMenu.Trigger className={cx('cr-model-picker', className)} aria-label={`${label}: ${current?.label ?? 'none'}`} disabled={disabled}>
        {current?.label ?? label}
        <ChevronDownIcon />
      </RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content className="cr-menu cr-popover cr-model-picker__menu" sideOffset={6} align="start">
          <RadixMenu.RadioGroup
            value={value}
            onValueChange={(next) => {
              setOwn(next);
              onValueChange?.(next);
            }}
          >
            {models.map((m) => (
              <RadixMenu.RadioItem key={m.value} value={m.value} disabled={m.disabled} className="cr-menu__item">
                <span className="cr-menu__text">
                  <span className="cr-model-picker__name">{m.label}</span>
                  {m.description && <span className="cr-menu__description">{m.description}</span>}
                </span>
                <RadixMenu.ItemIndicator>
                  <CheckIcon />
                </RadixMenu.ItemIndicator>
              </RadixMenu.RadioItem>
            ))}
          </RadixMenu.RadioGroup>
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
}
