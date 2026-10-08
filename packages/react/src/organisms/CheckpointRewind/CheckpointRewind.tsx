import { useId, useState, type ReactNode } from 'react';
import { Button } from '../../atoms/Button';
import { cx } from '../../internal/cx';
import './CheckpointRewind.css';

export interface Checkpoint {
  id: string;
  label: string;
  description?: ReactNode;
  /** When in the run, such as "00:18". */
  time?: string;
  /** What rewinding to this checkpoint undoes. The current point has none. */
  undoes?: {
    files?: { path: string; added: number; removed: number }[];
    /** Steps that will be forgotten. */
    steps?: string[];
    /** Anything that is not refunded or reverted, said plainly. */
    notes?: ReactNode[];
  };
}

export interface CheckpointRewindProps {
  /** Newest first. The first is where the run is now. */
  checkpoints: Checkpoint[];
  onRewind: (id: string) => void;
  onCancel?: () => void;
  /** Said under the list of changes: what a rewind can't reach. */
  limits?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** Roll the run back. Pick a checkpoint and see exactly what will be undone before confirming. */
export function CheckpointRewind({
  checkpoints,
  onRewind,
  onCancel,
  limits = "Can't be undone outside the run: anything pushed or deployed stays.",
  headingLevel = 3,
  className,
}: CheckpointRewindProps) {
  const id = useId();
  const H = `h${headingLevel}` as const;
  const [picked, setPicked] = useState<string | null>(null);
  const target = checkpoints.find((c) => c.id === picked);
  const nowId = checkpoints[0]?.id;

  return (
    <div className={cx('cr-rewind', className)}>
      <section aria-labelledby={`${id}-list`} className="cr-rewind__list cr-surface">
        <H id={`${id}-list`} className="cr-rewind__title">
          Checkpoints
        </H>
        <fieldset className="cr-rewind__options">
          <legend className="cr-visually-hidden">Rewind to</legend>
          {checkpoints.map((c) => (
            <label key={c.id} className="cr-rewind__option" data-now={c.id === nowId || undefined}>
              <input type="radio" name={id} value={c.id} checked={picked === c.id} disabled={c.id === nowId} onChange={() => setPicked(c.id)} />
              <span className="cr-rewind__text">
                <span className="cr-rewind__label">{c.id === nowId ? `Now: ${c.label}` : c.label}</span>
                {c.description && <span className="cr-rewind__description">{c.description}</span>}
              </span>
              {c.time && <span className="cr-rewind__time">{c.time}</span>}
            </label>
          ))}
        </fieldset>
      </section>

      <section aria-labelledby={`${id}-preview`} aria-live="polite" className="cr-rewind__preview cr-glass">
        {target ? (
          <>
            <H id={`${id}-preview`} className="cr-rewind__title">
              Rewind to “{target.label}”?
            </H>
            <p className="cr-rewind__lead">This undoes everything after {target.time ?? 'it'}:</p>
            <ul className="cr-rewind__undoes">
              {target.undoes?.files?.map((f) => (
                <li key={f.path}>
                  <span>
                    Revert changes to <code>{f.path}</code>
                  </span>
                  <span className="cr-rewind__stat">
                    <span aria-label={`${f.added} lines added`}>+{f.added}</span> <span aria-label={`${f.removed} lines removed`}>−{f.removed}</span>
                  </span>
                </li>
              ))}
              {target.undoes?.steps?.length ? (
                <li>
                  Forget {target.undoes.steps.length} {target.undoes.steps.length === 1 ? 'step' : 'steps'}: {target.undoes.steps.join(', ')}
                </li>
              ) : null}
              {target.undoes?.notes?.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
            {limits && <p className="cr-rewind__limits">{limits}</p>}
            <div className="cr-rewind__actions">
              <Button variant="primary" onClick={() => onRewind(target.id)}>
                Rewind
              </Button>
              <Button
                onClick={() => {
                  setPicked(null);
                  onCancel?.();
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <H id={`${id}-preview`} className="cr-rewind__title">
              Pick a checkpoint
            </H>
            <p className="cr-rewind__lead">You will see what it undoes before anything changes.</p>
          </>
        )}
      </section>
    </div>
  );
}
