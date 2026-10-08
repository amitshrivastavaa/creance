import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Code } from '../../atoms/Code/Code';
import { KeyboardHint } from '../../molecules/KeyboardHint/KeyboardHint';
import { RiskLabel, type Risk } from '../../molecules/RiskLabel/RiskLabel';
import { cx } from '../../internal/cx';
import { deprecate } from '../../internal/deprecate';
import { LiveRegion } from '../../internal/LiveRegion';
import './ApprovalPrompt.css';

export type ApprovalDecision = 'allow-once' | 'always-allow' | 'deny';

export interface ApprovalPromptProps {
  /** The exact command or operation, e.g. "npm install zod@3". */
  action: string;
  /** What it acts on, e.g. a file, repo or environment. */
  target?: string | undefined;
  risk: Risk;
  /** Why the agent wants to do this, in the agent's words. */
  reason: string;
  agentName?: string | undefined;
  /** Called with the scope the person allowed: just this once, or always. */
  onAllow?: (scope: 'once' | 'always') => void;
  /**
   * @deprecated Renamed to `onAllow` in 0.2.0, to match the "Allow" buttons. Still works, with a
   * development warning; removed in 1.0. Run `npx creance-codemod-on-allow src` to migrate.
   */
  onApprove?: (scope: 'once' | 'always') => void;
  onDeny?: () => void;
  /** Once set, the prompt shows the outcome instead of the buttons. */
  decision?: ApprovalDecision | undefined;
  /** Offer "Always allow". Defaults to false for high risk: a dangerous action should be confirmed every time. */
  allowAlways?: boolean;
  /** Move focus to the prompt when it appears. Default true; turn off when several prompts render at once. */
  autoFocus?: boolean;
  /** A, Shift+A and D while focus is inside the prompt. Default true. */
  shortcuts?: boolean;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

const outcome: Record<ApprovalDecision, { text: string; status: 'done' | 'failed' }> = {
  'allow-once': { text: 'Allowed once', status: 'done' },
  'always-allow': { text: 'Always allowed', status: 'done' },
  deny: { text: 'Denied', status: 'failed' },
};

export function ApprovalPrompt({
  action,
  target,
  risk,
  reason,
  agentName = 'The agent',
  onAllow,
  onApprove,
  onDeny,
  decision,
  allowAlways = risk !== 'high',
  autoFocus = true,
  shortcuts = true,
  headingLevel = 3,
  className,
}: ApprovalPromptProps) {
  const titleId = useId();
  const reasonId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const outcomeRef = useRef<HTMLParagraphElement>(null);
  const Heading = `h${headingLevel}` as const;

  const usesOnApprove = onApprove !== undefined;
  useEffect(() => {
    if (usesOnApprove) {
      deprecate(
        'ApprovalPrompt.onApprove',
        'ApprovalPrompt: `onApprove` is deprecated and will be removed in 1.0. Rename it to `onAllow`. See docs/MIGRATIONS.md.',
      );
    }
  }, [usesOnApprove]);
  const allow = onAllow ?? onApprove;

  useEffect(() => {
    if (autoFocus && !decision) rootRef.current?.focus();
    // Only on mount: re-focusing on every render would steal focus from the buttons.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After a decision the buttons disappear; keep focus in the prompt instead of dropping it to <body>.
  useEffect(() => {
    const active = document.activeElement;
    if (decision && (active === document.body || rootRef.current?.contains(active))) outcomeRef.current?.focus();
  }, [decision]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!shortcuts || decision || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')) return;
    const key = e.key.toLowerCase();
    if (key === 'a' && e.shiftKey && allowAlways) allow?.('always');
    else if (key === 'a' && !e.shiftKey) allow?.('once');
    else if (key === 'd' && !e.shiftKey) onDeny?.();
    else return;
    e.preventDefault();
  }

  const announcement = decision
    ? `${outcome[decision].text}: ${action}`
    : `Approval needed. ${agentName} wants to run ${action}. ${risk} risk.`;

  return (
    // A labelled group, not a modal: the person can still read the run before deciding.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={rootRef}
      role="group"
      aria-labelledby={titleId}
      aria-describedby={reasonId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={cx('cr-approval cr-glass', className)}
      data-risk={risk}
      data-resolved={decision ? true : undefined}
    >
      <div className="cr-approval__head">
        <Heading id={titleId} className="cr-approval__title">
          {agentName} wants to run <Code>{action}</Code>
          {target && (
            <>
              {' '}
              on <Code>{target}</Code>
            </>
          )}
        </Heading>
        <RiskLabel level={risk} />
      </div>
      <p id={reasonId} className="cr-approval__reason">
        {reason}
      </p>

      {decision ? (
        <p ref={outcomeRef} tabIndex={-1} className="cr-approval__outcome">
          <Badge status={outcome[decision].status}>{outcome[decision].text}</Badge>
        </p>
      ) : (
        <div className="cr-approval__actions">
          <Button variant="primary" onClick={() => allow?.('once')} aria-keyshortcuts={shortcuts ? 'A' : undefined}>
            Allow once {shortcuts && <KeyboardHint keys={['A']} />}
          </Button>
          {allowAlways && (
            <Button onClick={() => allow?.('always')} aria-keyshortcuts={shortcuts ? 'Shift+A' : undefined}>
              Always allow {shortcuts && <KeyboardHint keys={['Shift', 'A']} />}
            </Button>
          )}
          <Button variant="danger" onClick={() => onDeny?.()} aria-keyshortcuts={shortcuts ? 'D' : undefined}>
            Deny {shortcuts && <KeyboardHint keys={['D']} />}
          </Button>
        </div>
      )}
      <LiveRegion message={announcement} />
    </div>
  );
}
