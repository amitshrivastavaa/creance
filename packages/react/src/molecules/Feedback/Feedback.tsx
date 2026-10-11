'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../atoms/Button';
import { Textarea } from '../../atoms/Textarea';
import { cx } from '../../internal/cx';
import { ThumbIcon } from '../../internal/icons';
import './Feedback.css';

export type FeedbackRating = 'up' | 'down';

export interface FeedbackProps {
  /** Default "Was this useful?" */
  question?: ReactNode;
  /** Label of the comment box, per rating. */
  commentLabel?: (rating: FeedbackRating) => ReactNode;
  onSubmit: (feedback: { rating: FeedbackRating; comment: string }) => void;
  /** Shown after sending. Default "Thanks for the feedback." */
  thanks?: ReactNode;
  className?: string;
}

/** Thumbs up or down, then an optional comment. Sends nothing until the person presses Send. */
export function Feedback({
  question = 'Was this useful?',
  commentLabel = (r) => (r === 'up' ? 'What worked?' : 'What went wrong?'),
  onSubmit,
  thanks = 'Thanks for the feedback.',
  className,
}: FeedbackProps) {
  const qId = useId();
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);

  if (sent) {
    return (
      <p role="status" className={cx('cr-feedback cr-feedback__thanks', className)}>
        {thanks}
      </p>
    );
  }

  const choose = (r: FeedbackRating) => {
    setRating(r);
    requestAnimationFrame(() => box.current?.focus());
  };

  return (
    <form
      className={cx('cr-feedback', className)}
      aria-labelledby={qId}
      onSubmit={(e) => {
        e.preventDefault();
        if (!rating) return;
        onSubmit({ rating, comment: comment.trim() });
        setSent(true);
      }}
    >
      <div className="cr-feedback__row">
        <span id={qId} className="cr-feedback__question">
          {question}
        </span>
        <button type="button" className="cr-feedback__thumb" aria-label="Useful" aria-pressed={rating === 'up'} onClick={() => choose('up')}>
          <ThumbIcon />
        </button>
        <button
          type="button"
          className="cr-feedback__thumb"
          data-down=""
          aria-label="Not useful"
          aria-pressed={rating === 'down'}
          onClick={() => choose('down')}
        >
          <ThumbIcon />
        </button>
      </div>
      {rating && (
        <div className="cr-feedback__more">
          <label className="cr-feedback__label" htmlFor={`${qId}-comment`}>
            {commentLabel(rating)}
          </label>
          <Textarea ref={box} id={`${qId}-comment`} rows={3} value={comment} onChange={(e) => setComment(e.currentTarget.value)} />
          <div className="cr-feedback__actions">
            <Button type="submit" variant="primary">
              Send feedback
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setRating(null);
                setComment('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
