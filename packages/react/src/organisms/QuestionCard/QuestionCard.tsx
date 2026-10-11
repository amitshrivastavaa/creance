'use client';

import { useId, useState, type ReactNode } from 'react';
import { Button } from '../../atoms/Button';
import { Textarea } from '../../atoms/Textarea';
import { cx } from '../../internal/cx';
import './QuestionCard.css';

export interface QuestionOption {
  value: string;
  label: string;
  description?: ReactNode;
}

export interface QuestionCardProps {
  agentName: string;
  question: string;
  /** Answers the agent can offer. Leave out for a free-text question. */
  options?: QuestionOption[];
  /** Add "Something else" with a text box. Default true when there are options. */
  allowOther?: boolean;
  /** The option the agent would pick, pre-selected and said openly. */
  defaultValue?: string;
  /** Names the option group. Default "Answer". */
  optionsLabel?: string;
  /** What happens if nobody answers: "If no one answers in 30 minutes, Data Loader will pause, not guess." */
  timeoutNote?: ReactNode;
  onAnswer: (answer: string) => void;
  /** Shows "Ask me later". */
  onDefer?: () => void;
  /** Once answered, the card shows the answer instead of the form. */
  answer?: string;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** When the agent needs information rather than permission: options when it has them, free text when not. */
export function QuestionCard({
  agentName,
  question,
  options,
  allowOther = !!options?.length,
  defaultValue,
  optionsLabel = 'Answer',
  timeoutNote,
  onAnswer,
  onDefer,
  answer,
  headingLevel = 3,
  className,
}: QuestionCardProps) {
  const id = useId();
  const H = `h${headingLevel}` as const;
  const [choice, setChoice] = useState(defaultValue ?? options?.[0]?.value ?? '');
  const [text, setText] = useState('');
  const other = !options?.length || choice === '__other';
  const value = other ? text.trim() : options!.find((o) => o.value === choice)?.label ?? choice;

  if (answer !== undefined) {
    return (
      <section aria-labelledby={id} className={cx('cr-question cr-surface', className)} data-answered="">
        <span className="cr-question__who">{agentName} asked</span>
        <H id={id} className="cr-question__title">
          {question}
        </H>
        <span className="cr-question__answer">You answered {answer}</span>
      </section>
    );
  }

  return (
    <form
      aria-labelledby={id}
      className={cx('cr-question cr-glass', className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (value) onAnswer(value);
      }}
    >
      <span className="cr-question__who">{agentName} is asking</span>
      <H id={id} className="cr-question__title">
        {question}
      </H>
      {options?.length ? (
        <fieldset className="cr-question__options">
          <legend className="cr-visually-hidden">{optionsLabel}</legend>
          {[...options, ...(allowOther ? [{ value: '__other', label: 'Something else' } as QuestionOption] : [])].map((o) => (
            <label key={o.value} className="cr-question__option">
              <input type="radio" name={id} value={o.value} checked={choice === o.value} onChange={() => setChoice(o.value)} />
              <span className="cr-question__option-text">
                <span>{o.label}</span>
                {o.description && <span className="cr-question__option-description">{o.description}</span>}
              </span>
            </label>
          ))}
        </fieldset>
      ) : null}
      {other && (
        <div className="cr-question__free">
          <label htmlFor={`${id}-text`} className="cr-question__free-label">
            Your answer
          </label>
          <Textarea id={`${id}-text`} rows={3} value={text} onChange={(e) => setText(e.currentTarget.value)} />
        </div>
      )}
      {timeoutNote && <p className="cr-question__note">{timeoutNote}</p>}
      <div className="cr-question__actions">
        <Button type="submit" variant="primary" disabled={!value}>
          {options?.length ? 'Answer' : 'Send answer'}
        </Button>
        {onDefer && <Button onClick={onDefer}>Ask me later</Button>}
      </div>
    </form>
  );
}
