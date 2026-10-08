import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Code } from '../../atoms/Code/Code';
import { DiffLine, type DiffLineType } from '../../molecules/DiffLine/DiffLine';
import { KeyboardHint } from '../../molecules/KeyboardHint/KeyboardHint';
import { cx } from '../../internal/cx';
import { CheckIcon, CrossIcon } from '../../internal/icons';
import { LiveRegion } from '../../internal/LiveRegion';
import './DiffReview.css';

export interface DiffHunkLine {
  type: DiffLineType;
  content: string;
  oldNumber?: number | undefined;
  newNumber?: number | undefined;
}

export interface DiffHunk {
  id: string;
  /** The `@@ -12,4 +12,6 @@` header. */
  header: string;
  lines: DiffHunkLine[];
}

export type HunkDecision = 'accepted' | 'rejected';

export interface DiffReviewProps {
  file: string;
  hunks: DiffHunk[];
  /** Called once every hunk has a decision and the person applies them. */
  onApply?: (result: { accepted: string[]; rejected: string[] }) => void;
  /** Once set, the review is read-only and shows what was applied. */
  applied?: { accepted: string[]; rejected: string[] } | undefined;
  /** What the change is for, in the agent's words. */
  description?: string | undefined;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

function counts(hunks: DiffHunk[]) {
  let added = 0;
  let removed = 0;
  for (const line of hunks.flatMap((h) => h.lines)) {
    if (line.type === 'add') added++;
    if (line.type === 'remove') removed++;
  }
  return { added, removed };
}

/**
 * Keyboard: J / K move between hunks, Y accepts and N rejects the focused hunk.
 * Shortcuts only work while focus is inside the review.
 */
export function DiffReview({ file, hunks, onApply, applied, description, headingLevel = 3, className }: DiffReviewProps) {
  const titleId = useId();
  const [decisions, setDecisions] = useState<Record<string, HunkDecision>>({});
  const [message, setMessage] = useState('');
  const hunkRefs = useRef<Array<HTMLElement | null>>([]);
  const Heading = `h${headingLevel}` as const;
  const HunkHeading = `h${headingLevel + 1}` as 'h3' | 'h4' | 'h5';

  const readOnly = applied !== undefined;
  const decisionFor = (id: string): HunkDecision | undefined =>
    applied
      ? applied.accepted.includes(id)
        ? 'accepted'
        : applied.rejected.includes(id)
          ? 'rejected'
          : undefined
      : decisions[id];
  const decided = hunks.filter((h) => decisionFor(h.id)).length;
  const accepted = hunks.filter((h) => decisionFor(h.id) === 'accepted').map((h) => h.id);
  const rejected = hunks.filter((h) => decisionFor(h.id) === 'rejected').map((h) => h.id);
  const { added, removed } = counts(hunks);

  function decide(id: string, decision: HunkDecision) {
    setDecisions((d) => ({ ...d, [id]: decision }));
  }
  function decideAll(decision: HunkDecision) {
    setDecisions(Object.fromEntries(hunks.map((h) => [h.id, decision])));
    setMessage(decision === 'accepted' ? 'All hunks accepted' : 'All hunks rejected');
  }
  function apply() {
    onApply?.({ accepted, rejected });
    setMessage(`Applied ${accepted.length} of ${hunks.length} hunks`);
  }

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const current = hunkRefs.current.findIndex((el) => el?.contains(document.activeElement));
    const key = e.key.toLowerCase();
    if (key === 'j' || key === 'k') {
      const next = key === 'j' ? Math.min(current + 1, hunks.length - 1) : Math.max(current - 1, 0);
      hunkRefs.current[current === -1 ? 0 : next]?.focus();
    } else if (!readOnly && current !== -1 && (key === 'y' || key === 'n')) {
      const hunk = hunks[current];
      if (!hunk) return;
      decide(hunk.id, key === 'y' ? 'accepted' : 'rejected');
      setMessage(`Hunk ${current + 1} ${key === 'y' ? 'accepted' : 'rejected'}`);
    } else {
      return;
    }
    e.preventDefault();
  }

  return (
    // Keyboard shortcuts are a convenience on top of the buttons, which stay fully usable.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      className={cx('cr-diff-review', className)}
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      data-readonly={readOnly || undefined}
    >
      <header className="cr-diff-review__header">
        <Heading id={titleId} className="cr-diff-review__title">
          <span className="cr-visually-hidden">Review changes to </span>
          <Code>{file}</Code>
        </Heading>
        <span className="cr-diff-review__stat">
          <span className="cr-diff-review__added">+{added}</span>{' '}
          <span className="cr-diff-review__removed">−{removed}</span>
          <span className="cr-visually-hidden">
            : {added} lines added, {removed} removed
          </span>
        </span>
      </header>
      {description && <p className="cr-diff-review__description">{description}</p>}

      <div className="cr-diff-review__hunks">
        {hunks.map((hunk, i) => {
          const decision = decisionFor(hunk.id);
          const headingId = `${titleId}-h${i}`;
          return (
            <section
              key={hunk.id}
              ref={(el) => {
                hunkRefs.current[i] = el;
              }}
              className="cr-diff-review__hunk cr-surface"
              data-decision={decision}
              aria-labelledby={headingId}
              tabIndex={-1}
            >
              <div className="cr-diff-review__hunk-bar">
                <HunkHeading id={headingId} className="cr-diff-review__hunk-title">
                  Hunk {i + 1} of {hunks.length}
                  <span className="cr-diff-review__hunk-header" aria-hidden="true">
                    {hunk.header}
                  </span>
                </HunkHeading>
                {readOnly ? (
                  <Badge status={decision === 'accepted' ? 'done' : decision === 'rejected' ? 'failed' : 'waiting'}>
                    {decision === 'accepted' ? 'Applied' : decision === 'rejected' ? 'Rejected' : 'Not reviewed'}
                  </Badge>
                ) : (
                  <span className="cr-diff-review__hunk-actions">
                    <Button
                      size="sm"
                      aria-pressed={decision === 'accepted'}
                      aria-keyshortcuts="Y"
                      onClick={() => decide(hunk.id, 'accepted')}
                      data-choice="accept"
                    >
                      <CheckIcon /> Accept
                    </Button>
                    <Button
                      size="sm"
                      aria-pressed={decision === 'rejected'}
                      aria-keyshortcuts="N"
                      onClick={() => decide(hunk.id, 'rejected')}
                      data-choice="reject"
                    >
                      <CrossIcon /> Reject
                    </Button>
                  </span>
                )}
              </div>
              <div className="cr-diff-review__lines">
                {hunk.lines.map((line, j) => (
                  <DiffLine key={j} {...line} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="cr-diff-review__bar cr-glass">
        {readOnly ? (
          <span>
            Applied {accepted.length} of {hunks.length} hunks
          </span>
        ) : (
          <>
            <span className="cr-diff-review__progress">
              {decided} of {hunks.length} reviewed
              <KeyboardHint keys={['J']} label="next" />
              <KeyboardHint keys={['K']} label="previous" />
              <KeyboardHint keys={['Y']} label="accept" />
              <KeyboardHint keys={['N']} label="reject" />
            </span>
            <span className="cr-diff-review__bar-actions">
              <Button size="sm" variant="ghost" onClick={() => decideAll('rejected')}>
                Reject all
              </Button>
              <Button size="sm" onClick={() => decideAll('accepted')}>
                Accept all
              </Button>
              <Button size="sm" variant="primary" disabled={decided < hunks.length} onClick={apply}>
                Apply {accepted.length} of {hunks.length}
              </Button>
            </span>
          </>
        )}
      </footer>
      <LiveRegion message={message} />
    </section>
  );
}
