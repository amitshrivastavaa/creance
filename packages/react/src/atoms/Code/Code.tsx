import type { HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import './Code.css';

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  /** Render as a `<pre>` block instead of inline `<code>`. */
  block?: boolean;
}

export function Code({ block = false, className, ...props }: CodeProps) {
  if (!block) return <code className={cx('cr-code', className)} {...props} />;
  return (
    // tabIndex: a scrollable region must be reachable by keyboard.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <pre className={cx('cr-code-block', className)} tabIndex={0}>
      <code {...props} />
    </pre>
  );
}
