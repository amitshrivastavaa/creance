import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ChevronIcon, SparkIcon } from '../../internal/icons';
import './Reasoning.css';

export interface ReasoningProps {
  /** How long the agent thought, in seconds. Shown as "Thought for 8 seconds". */
  seconds?: number;
  /** Still thinking: shown as "Thinking" in place of a duration. */
  thinking?: boolean;
  /** Replaces the default summary text. */
  summary?: ReactNode;
  /** Open when first shown. Default closed. */
  defaultOpen?: boolean;
  /** The thinking. Shown in a quieter tone than the answer. */
  children: ReactNode;
  className?: string;
}

/** The agent's thinking, folded away behind how long it took. A native `<details>`, so it opens with Enter or Space. */
export function Reasoning({ seconds, thinking, summary, defaultOpen, children, className }: ReasoningProps) {
  const text = summary ?? (thinking ? 'Thinking' : seconds === undefined ? 'Thought' : `Thought for ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  return (
    <details className={cx('cr-reasoning', className)} open={defaultOpen}>
      <summary className="cr-reasoning__summary">
        <SparkIcon />
        {text}
        <ChevronIcon className="cr-icon cr-reasoning__chevron" />
      </summary>
      <div className="cr-reasoning__body">{children}</div>
    </details>
  );
}
