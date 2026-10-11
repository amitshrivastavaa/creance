'use client';

import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cx } from '../../internal/cx';
import '../../atoms/Toggle/Toggle.css';
import './ToggleGroup.css';

/**
 * Radix ToggleGroup as a segmented control. `type="single"` picks one (Unified or Split);
 * `type="multiple"` picks any (Bold, Italic). Arrow keys move between items. Give it an `aria-label`.
 */
export const ToggleGroup = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixToggleGroup.Root>>(
  function ToggleGroup({ className, ...props }, ref) {
    return <RadixToggleGroup.Root ref={ref} className={cx('cr-toggle-group', className)} {...props} />;
  },
);

/** Icon-only items need an `aria-label`. */
export const ToggleGroupItem = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof RadixToggleGroup.Item>>(
  function ToggleGroupItem({ className, ...props }, ref) {
    return <RadixToggleGroup.Item ref={ref} className={cx('cr-toggle-group__item', className)} {...props} />;
  },
);
