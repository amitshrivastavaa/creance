import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { Input } from '../../atoms/Input';
import { cx } from '../../internal/cx';
import { ArrowDownIcon, CrossIcon, PlusIcon } from '../../internal/icons';
import { LiveRegion } from '../../internal/LiveRegion';
import './PlanEditor.css';

export interface PlanStep {
  id: string;
  text: string;
}

export interface PlanEditorProps {
  /** The plan as the agent proposed it. */
  steps: PlanStep[];
  agentName: string;
  /** Called with the plan the person approved. Nothing runs before this. */
  onStart: (steps: PlanStep[]) => void;
  /** Default "{agentName}'s plan". */
  title?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

interface Row extends PlanStep {
  origin: 'agent' | 'you';
  edited: boolean;
  removed: boolean;
}

const fromAgent = (steps: PlanStep[]): Row[] => steps.map((s) => ({ ...s, origin: 'agent', edited: false, removed: false }));
let added = 0;

/**
 * The agent proposes a plan; the person reorders, edits, removes or adds steps before anything runs.
 * Alt+Up and Alt+Down move the focused step; every move is announced.
 */
export function PlanEditor({ steps, agentName, onStart, title, headingLevel = 3, className }: PlanEditorProps) {
  const id = useId();
  const H = `h${headingLevel}` as const;
  const [rows, setRows] = useState(() => fromAgent(steps));
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const refocus = useRef<string | null>(null);
  const live = rows.filter((r) => !r.removed);
  const changes = rows.filter((r) => r.origin === 'you' || r.edited || r.removed).length;

  useEffect(() => {
    if (refocus.current) document.getElementById(refocus.current)?.focus();
    refocus.current = null;
  });

  const move = (rowId: string, dir: -1 | 1) => {
    const order = live.map((r) => r.id);
    const at = order.indexOf(rowId);
    const to = at + dir;
    if (to < 0 || to >= order.length) return;
    const swap = order[to]!;
    setRows((prev) => {
      const next = [...prev];
      const a = next.findIndex((r) => r.id === rowId);
      const b = next.findIndex((r) => r.id === swap);
      [next[a], next[b]] = [next[b]!, next[a]!];
      return next;
    });
    setMessage(`Step moved to position ${to + 1} of ${order.length}`);
    refocus.current = `${id}-text-${rowId}`;
  };

  const save = (rowId: string) => {
    const text = draft.trim();
    setRows((prev) =>
      text ? prev.map((r) => (r.id === rowId ? { ...r, text, edited: r.origin === 'agent' && text !== steps.find((s) => s.id === rowId)?.text } : r)) : prev.filter((r) => r.id !== rowId || r.origin === 'agent'),
    );
    setEditing(null);
    refocus.current = `${id}-text-${rowId}`;
  };

  const keys = (e: KeyboardEvent, rowId: string) => {
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      move(rowId, e.key === 'ArrowUp' ? -1 : 1);
    }
  };

  return (
    <section aria-labelledby={id} className={cx('cr-plan cr-glass', className)}>
      <div className="cr-plan__head">
        <H id={id} className="cr-plan__title">
          {title ?? `${agentName}'s plan`}
        </H>
        <span className="cr-plan__summary">
          Nothing runs until you start it.{changes ? ` ${changes} ${changes === 1 ? 'change' : 'changes'} from the agent's plan.` : ''}
        </span>
      </div>
      <ol className="cr-plan__steps">
        {rows.map((r) => {
          const n = live.indexOf(r) + 1;
          const tag = r.removed ? 'Removed' : r.origin === 'you' ? 'Added by you' : r.edited ? 'Edited' : null;
          return (
            <li key={r.id} className="cr-plan__step" data-removed={r.removed || undefined}>
              <span className="cr-plan__num" aria-hidden="true">
                {r.removed ? '−' : n}
              </span>
              {editing === r.id ? (
                <Input
                  autoFocus
                  aria-label={`Step ${n}`}
                  value={draft}
                  onChange={(e) => setDraft(e.currentTarget.value)}
                  onBlur={() => save(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') save(r.id);
                    if (e.key === 'Escape') {
                      setEditing(null);
                      refocus.current = `${id}-text-${r.id}`;
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  id={`${id}-text-${r.id}`}
                  className="cr-plan__text"
                  disabled={r.removed}
                  aria-label={r.removed ? undefined : `Edit step ${n}: ${r.text}`}
                  onClick={() => {
                    setDraft(r.text);
                    setEditing(r.id);
                  }}
                  onKeyDown={(e) => keys(e, r.id)}
                >
                  {r.text}
                </button>
              )}
              {tag && <span className="cr-plan__tag">{tag}</span>}
              {r.removed ? (
                <Button size="sm" variant="ghost" onClick={() => setRows((p) => p.map((x) => (x.id === r.id ? { ...x, removed: false } : x)))}>
                  Restore
                </Button>
              ) : (
                <span className="cr-plan__tools">
                  <IconButton size="sm" tooltip={false} label={`Move step ${n} up`} icon={<ArrowDownIcon className="cr-plan__up" />} disabled={n === 1} onClick={() => move(r.id, -1)} />
                  <IconButton size="sm" tooltip={false} label={`Move step ${n} down`} icon={<ArrowDownIcon />} disabled={n === live.length} onClick={() => move(r.id, 1)} />
                  <IconButton
                    size="sm"
                    tooltip={false}
                    label={`Remove step ${n}`}
                    icon={<CrossIcon />}
                    onClick={() => {
                      setRows((p) => (r.origin === 'you' ? p.filter((x) => x.id !== r.id) : p.map((x) => (x.id === r.id ? { ...x, removed: true } : x))));
                      setMessage(`Step ${n} removed`);
                    }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <Button
        variant="ghost"
        className="cr-plan__add"
        onClick={() => {
          const rowId = `added-${++added}`;
          setRows((p) => [...p, { id: rowId, text: '', origin: 'you', edited: false, removed: false }]);
          setDraft('');
          setEditing(rowId);
        }}
      >
        <PlusIcon />
        Add a step
      </Button>
      <div className="cr-plan__actions">
        <span className="cr-plan__hint">Alt + ↑ ↓ moves the focused step.</span>
        <Button disabled={!changes} onClick={() => setRows(fromAgent(steps))}>
          Reset to the agent&apos;s plan
        </Button>
        <Button variant="primary" disabled={!live.length || editing !== null} onClick={() => onStart(live.map(({ id: i, text }) => ({ id: i, text })))}>
          Start with this plan
        </Button>
      </div>
      <LiveRegion message={message} />
    </section>
  );
}
