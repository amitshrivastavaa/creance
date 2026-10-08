import * as RadixTooltip from '@radix-ui/react-tooltip';
import { useRef, type ReactElement, type ReactNode } from 'react';
import { useLiquidGlass } from '../../internal/liquidGlass';
import './Tooltip.css';

export interface TooltipProps {
  /** Supplementary text. Never put information here that is not available another way. */
  content: ReactNode;
  /** A single focusable element. */
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/** Radix Tooltip: shows on hover and keyboard focus, dismisses on Escape. */
function GlassContent({ children, side }: { children: ReactNode; side: TooltipProps['side'] }) {
  const ref = useRef<HTMLDivElement>(null);
  const lens = useLiquidGlass(ref);
  return (
    <RadixTooltip.Content ref={ref} className="cr-tooltip cr-glass" side={side} sideOffset={6}>
      {lens}
      {children}
    </RadixTooltip.Content>
  );
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={400}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <GlassContent side={side}>{content}</GlassContent>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
