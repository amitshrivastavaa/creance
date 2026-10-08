import { useId, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './ConfidenceMeter.css';

export type ConfidenceLevel = 'guessing' | 'unsure' | 'likely' | 'very-likely' | 'certain';

const levels: ConfidenceLevel[] = ['guessing', 'unsure', 'likely', 'very-likely', 'certain'];
const scaleWords: Record<ConfidenceLevel, string> = {
  guessing: 'Guessing',
  unsure: 'Unsure',
  likely: 'Likely',
  'very-likely': 'Very likely',
  certain: 'Certain',
};
const summaryWords: Record<ConfidenceLevel, string> = {
  guessing: 'Guessing',
  unsure: 'Unsure',
  likely: 'Fairly sure',
  'very-likely': 'Very sure',
  certain: 'Certain',
};

export interface ConfidenceMeterProps {
  /** The lower end of the agent's honest range. */
  low: ConfidenceLevel;
  /** The upper end. Defaults to `low`. A wide range is itself information. */
  high?: ConfidenceLevel;
  /** The claim the confidence is about: "Fairly sure this fixes the deploy". Full variant only. */
  title?: ReactNode;
  agentName?: string;
  /** Why, including what was not checked. Full variant only. */
  reasons?: ReactNode[];
  /** `compact` is a small pill for use inside other components. */
  variant?: 'full' | 'compact';
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** How sure the agent is, as a range in words with reasons, never a falsely precise percentage. */
export function ConfidenceMeter({ low, high = low, title, agentName, reasons, variant = 'full', headingLevel = 3, className }: ConfidenceMeterProps) {
  const id = useId();
  const [a, b] = [levels.indexOf(low), levels.indexOf(high)].sort((x, y) => x - y) as [number, number];
  // Round down: when the range straddles two words, say the less confident one.
  const mid = levels[Math.floor((a + b) / 2)]!;
  const summary = summaryWords[mid];
  const range = a === b ? scaleWords[levels[a]!] : `between ${scaleWords[levels[a]!].toLowerCase()} and ${scaleWords[levels[b]!].toLowerCase()}`;
  const label = `Confidence: ${summary.toLowerCase()}, ${range}`;
  // The band covers the chosen levels on a five-step scale.
  const band = { left: `${(a / 5) * 100}%`, width: `${((b - a + 1) / 5) * 100}%` };

  if (variant === 'compact') {
    return (
      <span className={cx('cr-confidence cr-confidence--compact', className)}>
        <span className="cr-confidence__track" role="img" aria-label={label}>
          <span className="cr-confidence__band" style={band} />
        </span>
        <span aria-hidden="true">{summary}</span>
      </span>
    );
  }

  const H = `h${headingLevel}` as const;
  return (
    <section className={cx('cr-confidence cr-surface', className)} aria-labelledby={title ? id : undefined} aria-label={title ? undefined : label}>
      {(title || agentName) && (
        <div className="cr-confidence__head">
          {title && (
            <H id={id} className="cr-confidence__title">
              {title}
            </H>
          )}
          {agentName && <span className="cr-confidence__agent">{agentName}</span>}
        </div>
      )}
      <div className="cr-confidence__meter">
        <span className="cr-confidence__track" role="img" aria-label={label}>
          <span className="cr-confidence__band" style={band} />
        </span>
        <div className="cr-confidence__scale" aria-hidden="true">
          {levels.map((l, i) => (
            <span key={l} data-active={(i >= a && i <= b) || undefined}>
              {scaleWords[l]}
            </span>
          ))}
        </div>
      </div>
      {reasons && reasons.length > 0 && (
        <div className="cr-confidence__reasons">
          <span className="cr-confidence__why">Why</span>
          <ul>
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
