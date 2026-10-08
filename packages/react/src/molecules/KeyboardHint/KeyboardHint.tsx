import { Fragment } from 'react';
import { Kbd } from '../../atoms/Kbd/Kbd';
import { cx } from '../../internal/cx';
import './KeyboardHint.css';

export interface KeyboardHintProps {
  /** Keys pressed together, e.g. ['Shift', 'A']. */
  keys: string[];
  /** What the shortcut does. Omit when the hint sits inside the control it triggers. */
  label?: string;
  className?: string;
}

/**
 * A visual hint. The control itself should expose the shortcut with `aria-keyshortcuts`,
 * so the hint is hidden from screen readers when it has no label.
 */
export function KeyboardHint({ keys, label, className }: KeyboardHintProps) {
  return (
    <span className={cx('cr-kbd-hint', className)} aria-hidden={label ? undefined : true}>
      <span className="cr-kbd-hint__keys">
        {keys.map((key, i) => (
          <Fragment key={key}>
            {i > 0 && <span aria-hidden="true">+</span>}
            <Kbd>{key}</Kbd>
          </Fragment>
        ))}
      </span>
      {label && <span className="cr-kbd-hint__label">{label}</span>}
    </span>
  );
}
