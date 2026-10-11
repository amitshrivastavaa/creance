'use client';

import { useEffect, useId, useState } from 'react';
import { cx } from '../../internal/cx';
import { MonitorIcon, MoonIcon, SunIcon } from '../../internal/icons';
import './ThemeSwitcher.css';

export type ThemeChoice = 'light' | 'dark' | 'system';

export interface ThemeSwitcherProps {
  value?: ThemeChoice;
  defaultValue?: ThemeChoice;
  onValueChange?: (value: ThemeChoice) => void;
  /**
   * Sets `data-theme` on `<html>` (removed for "system"), which is how @creance-ui/tokens switch theme.
   * Turn off to apply the theme yourself. Default true. Saving the choice is up to the app.
   */
  apply?: boolean;
  /** Accessible name of the group. Default "Theme". */
  label?: string;
  className?: string;
}

const choices = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'Match system', Icon: MonitorIcon },
] as const;

/** Light, dark or match the system: native radios drawn as an icon segmented control. */
export function ThemeSwitcher({ value, defaultValue = 'system', onValueChange, apply = true, label = 'Theme', className }: ThemeSwitcherProps) {
  const name = useId();
  const [own, setOwn] = useState<ThemeChoice>(defaultValue);
  const current = value ?? own;

  useEffect(() => {
    if (!apply) return;
    const root = document.documentElement;
    if (current === 'system') delete root.dataset.theme;
    else root.dataset.theme = current;
  }, [apply, current]);

  return (
    <div role="radiogroup" aria-label={label} className={cx('cr-theme-switcher', className)}>
      {choices.map(({ value: v, label: l, Icon }) => (
        <label key={v} className="cr-theme-switcher__option" title={l}>
          <input
            type="radio"
            name={name}
            value={v}
            className="cr-visually-hidden"
            aria-label={l}
            checked={current === v}
            onChange={() => {
              if (value === undefined) setOwn(v);
              onValueChange?.(v);
            }}
          />
          <Icon />
        </label>
      ))}
    </div>
  );
}
