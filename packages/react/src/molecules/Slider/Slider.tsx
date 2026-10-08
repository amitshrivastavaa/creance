import * as RadixSlider from '@radix-ui/react-slider';
import { useId, useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Slider.css';

export interface SliderProps {
  label: ReactNode;
  /** One value, or two for a range. */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Fires once when the person lets go. */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** How a value reads, on screen and to screen readers: `(v) => `${v / 1000}K tokens``. */
  formatValue?: (value: number) => string;
  /** Names for the thumbs of a range, such as ['Minimum retry delay', 'Maximum retry delay']. */
  thumbLabels?: string[];
  /** Labels under the track. Use for stepped sliders; otherwise the ends show min and max. */
  marks?: { value: number; label: ReactNode }[];
  disabled?: boolean;
  name?: string;
  className?: string;
}

/** Radix Slider with a label and a live value. Arrow keys step; Page Up and Down take bigger steps. */
export function Slider({
  label,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  formatValue = String,
  thumbLabels,
  marks,
  disabled,
  name,
  className,
}: SliderProps) {
  const labelId = useId();
  const [own, setOwn] = useState(defaultValue ?? [min]);
  const current = value ?? own;
  const shown = current.map(formatValue).join(' to ');
  return (
    <div className={cx('cr-slider', className)} data-disabled={disabled || undefined}>
      <div className="cr-slider__head">
        <span id={labelId} className="cr-slider__label">
          {label}
        </span>
        <span className="cr-slider__value" aria-hidden="true">
          {shown}
        </span>
      </div>
      <RadixSlider.Root
        className="cr-slider__root"
        value={current}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        name={name}
        onValueChange={(v) => {
          if (value === undefined) setOwn(v);
          onValueChange?.(v);
        }}
        onValueCommit={onValueCommit}
      >
        <RadixSlider.Track className="cr-slider__track">
          <RadixSlider.Range className="cr-slider__range" />
        </RadixSlider.Track>
        {current.map((v, i) => (
          <RadixSlider.Thumb
            key={i}
            className="cr-slider__thumb"
            aria-labelledby={thumbLabels?.[i] ? undefined : labelId}
            aria-label={thumbLabels?.[i]}
            aria-valuetext={formatValue(v)}
          />
        ))}
      </RadixSlider.Root>
      <div className="cr-slider__marks" aria-hidden="true">
        {(marks ?? [
          { value: min, label: formatValue(min) },
          { value: max, label: formatValue(max) },
        ]).map((m) => (
          <span key={m.value} data-active={current.includes(m.value) || undefined}>
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
