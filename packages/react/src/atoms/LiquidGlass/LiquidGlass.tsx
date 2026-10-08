import { forwardRef, useRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import { useLiquidGlass } from '../../internal/liquidGlass';
import { mergeRefs } from '../../internal/mergeRefs';

export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  /** "regular" frosts more for legibility; "clear" shows more of what is behind. */
  variant?: 'regular' | 'clear';
}

/**
 * A Liquid Glass surface for your own floating controls and bars. Use it sparingly, above content,
 * never for content itself. Set the shape with border-radius; refraction follows it.
 */
export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(function LiquidGlass(
  { variant = 'regular', className, children, ...props },
  ref,
) {
  const own = useRef<HTMLDivElement>(null);
  const lens = useLiquidGlass(own);
  return (
    <div
      ref={mergeRefs(ref, own)}
      className={cx('cr-glass', className)}
      data-glass={variant === 'clear' ? 'clear' : undefined}
      {...props}
    >
      {lens}
      {children}
    </div>
  );
});
