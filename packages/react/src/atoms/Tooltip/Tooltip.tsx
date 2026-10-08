import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactElement, ReactNode } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  /** Supplementary text. Never put information here that is not available another way. */
  content: ReactNode;
  /** A single focusable element. */
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/** Radix Tooltip: shows on hover and keyboard focus, dismisses on Escape. */
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={400}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className="cr-tooltip cr-glass" side={side} sideOffset={6}>
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
