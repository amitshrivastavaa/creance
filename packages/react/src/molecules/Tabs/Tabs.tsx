'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cx } from '../../internal/cx';
import './Tabs.css';

/** Radix Tabs: arrow keys move between tabs, Home and End jump to the ends. */
export const Tabs = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixTabs.Root>>(function Tabs(
  { className, ...props },
  ref,
) {
  return <RadixTabs.Root ref={ref} className={cx('cr-tabs', className)} {...props} />;
});

/** The segmented control holding the tabs. Give it an `aria-label`. */
export const TabsList = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixTabs.List>>(function TabsList(
  { className, ...props },
  ref,
) {
  return <RadixTabs.List ref={ref} className={cx('cr-tabs__list', className)} {...props} />;
});

export const TabsTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof RadixTabs.Trigger>>(
  function TabsTrigger({ className, ...props }, ref) {
    return <RadixTabs.Trigger ref={ref} className={cx('cr-tabs__trigger', className)} {...props} />;
  },
);

export const TabsContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixTabs.Content>>(
  function TabsContent({ className, ...props }, ref) {
    return <RadixTabs.Content ref={ref} className={cx('cr-tabs__content', className)} {...props} />;
  },
);
