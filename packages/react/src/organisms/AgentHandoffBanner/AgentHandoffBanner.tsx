import { useEffect, useId, useRef } from 'react';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { Button } from '../../atoms/Button/Button';
import { cx } from '../../internal/cx';
import { LiveRegion } from '../../internal/LiveRegion';
import './AgentHandoffBanner.css';

export interface HandoffAction {
  id: string;
  label: string;
  primary?: boolean;
}

export interface AgentHandoffBannerProps {
  agentName: string;
  /** What the agent did and what state it left things in. */
  summary: string;
  actions?: HandoffAction[];
  onAction?: (id: string) => void;
  /** "completed" finished the goal; "stopped" ended early (for example after a denial). */
  outcome?: 'completed' | 'stopped' | 'failed';
  /** Move focus to the banner heading when it appears, so keyboard users land on the next actions. Default true. */
  focusOnMount?: boolean;
  headingLevel?: 2 | 3;
  className?: string;
}

const headline = {
  completed: 'finished and handed back to you',
  stopped: 'stopped and handed back to you',
  failed: 'failed and handed back to you',
};

export function AgentHandoffBanner({
  agentName,
  summary,
  actions = [],
  onAction,
  outcome = 'completed',
  focusOnMount = true,
  headingLevel = 2,
  className,
}: AgentHandoffBannerProps) {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const Heading = `h${headingLevel}` as const;

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={cx('cr-handoff cr-surface', className)} aria-labelledby={headingId} data-outcome={outcome}>
      <Avatar name={agentName} decorative />
      <div className="cr-handoff__body">
        <Heading id={headingId} ref={headingRef} tabIndex={-1} className="cr-handoff__title">
          {agentName} {headline[outcome]}
        </Heading>
        <p className="cr-handoff__summary">{summary}</p>
        {actions.length > 0 && (
          <div className="cr-handoff__actions">
            {actions.map((a) => (
              <Button key={a.id} variant={a.primary ? 'primary' : 'secondary'} onClick={() => onAction?.(a.id)}>
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      <LiveRegion message={`${agentName} ${headline[outcome]}. ${summary}`} />
    </section>
  );
}
