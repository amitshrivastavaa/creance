import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { StopIcon } from '../../internal/icons';
import './KillSwitch.css';

export interface KillSwitchProps {
  /** Called once the button has been held for `holdMs`. */
  onStop: () => void;
  /** Milliseconds to hold. Default 1000. */
  holdMs?: number;
  /** Shown after stopping. Leave out to keep the button. */
  stopped?: boolean;
  /** "Deploy Fixer stopped". */
  stoppedLabel?: ReactNode;
  onResume?: () => void;
  /** What stopping means, shown under the button: "Stops Deploy Fixer after its current call." */
  description?: ReactNode;
  label?: string;
  /** Smaller, with the description kept for screen readers but hidden on screen. For headers and toolbars. */
  compact?: boolean;
  className?: string;
}

/**
 * Always within reach, never pressed by accident: hold for a second to stop the agent; let go early
 * and nothing happens. Holding Space or Enter does the same from the keyboard.
 */
export function KillSwitch({
  onStop,
  holdMs = 1000,
  stopped,
  stoppedLabel = 'Agent stopped',
  onResume,
  description,
  label = 'Hold to stop',
  compact,
  className,
}: KillSwitchProps) {
  const descId = useId();
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const start = () => {
    if (holding) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onStop();
    }, holdMs);
  };
  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };

  if (stopped) {
    return (
      <div className={cx('cr-kill', className)}>
        <span role="status" className="cr-kill__stopped">
          <StopIcon />
          {stoppedLabel}
        </span>
        {onResume && (
          <button type="button" className="cr-kill__resume" onClick={onResume}>
            Resume run
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cx('cr-kill', className)} data-compact={compact || undefined}>
      <button
        type="button"
        className="cr-kill__button"
        data-holding={holding || undefined}
        aria-describedby={descId}
        style={{ '--cr-kill-hold': `${holdMs}ms` } as CSSProperties}
        onPointerDown={(e) => {
          if (e.button === 0) start();
        }}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!e.repeat) start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') cancel();
        }}
        onBlur={cancel}
        onContextMenu={(e) => e.preventDefault()}
      >
        <StopIcon />
        <span className="cr-kill__label">{holding ? 'Keep holding' : label}</span>
        {/* A white copy of the content inside the sweeping fill, so the label reads on both sides of its edge. */}
        <span className="cr-kill__fill" aria-hidden="true">
          <StopIcon />
          <span className="cr-kill__label">{holding ? 'Keep holding' : label}</span>
        </span>
      </button>
      <span id={descId} className={compact ? 'cr-visually-hidden' : 'cr-kill__description'}>
        {description ?? `Press and hold for ${holdMs / 1000} second${holdMs === 1000 ? '' : 's'}.`}
      </span>
    </div>
  );
}
