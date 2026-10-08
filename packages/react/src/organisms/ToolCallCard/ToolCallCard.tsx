import { Button } from '../../atoms/Button/Button';
import { Code } from '../../atoms/Code/Code';
import { Spinner } from '../../atoms/Spinner/Spinner';
import { ToolCallHeader, type ToolCallStatus } from '../../molecules/ToolCallHeader/ToolCallHeader';
import { cx } from '../../internal/cx';
import { AlertIcon, RetryIcon } from '../../internal/icons';
import { LiveRegion } from '../../internal/LiveRegion';
import './ToolCallCard.css';

export interface ToolCallCardProps {
  tool: string;
  status: ToolCallStatus;
  /** Arguments the agent passed. Shown as collapsible JSON. */
  input?: unknown;
  output?: unknown;
  error?: string | undefined;
  startedAt?: number | undefined;
  endedAt?: number | undefined;
  attempt?: number;
  /** Earlier attempts that failed, oldest first, so a retried call still shows what went wrong. */
  previousAttempts?: Array<{ attempt: number; error?: string | undefined }>;
  /** Shows a Retry button on error. Omit it when the agent retries on its own. */
  onRetry?: () => void;
  /** Hide Retry when the backend says the failure is permanent. Default true. */
  retryable?: boolean | undefined;
  /** Open the input section initially. */
  defaultOpen?: boolean;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Announce failures in a live region. Turn off when a parent (like RunTimeline) already announces them. */
  announce?: boolean;
  className?: string;
}

function json(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

export function ToolCallCard({
  tool,
  status,
  input,
  output,
  error,
  startedAt,
  endedAt,
  attempt = 1,
  previousAttempts = [],
  onRetry,
  retryable = true,
  defaultOpen = false,
  headingLevel = 3,
  announce = true,
  className,
}: ToolCallCardProps) {
  return (
    <article className={cx('cr-tool-card cr-surface', className)} data-status={status}>
      <ToolCallHeader
        tool={tool}
        status={status}
        startedAt={startedAt}
        endedAt={endedAt}
        attempt={attempt}
        headingLevel={headingLevel}
      />

      {previousAttempts.length > 0 && (
        <ul className="cr-tool-card__attempts" aria-label="Earlier attempts">
          {previousAttempts.map((a) => (
            <li key={a.attempt}>
              Attempt {a.attempt} failed{a.error ? `: ${a.error}` : ''}
            </li>
          ))}
        </ul>
      )}

      {input !== undefined && (
        <details className="cr-tool-card__section" open={defaultOpen}>
          <summary>Input</summary>
          <Code block>{json(input)}</Code>
        </details>
      )}

      {status === 'pending' && <p className="cr-tool-card__note">Waiting to start</p>}
      {status === 'running' && (
        <p className="cr-tool-card__note">
          <Spinner size="sm" /> Running
        </p>
      )}
      {status === 'success' && output !== undefined && (
        <details className="cr-tool-card__section">
          <summary>Result</summary>
          <Code block>{json(output)}</Code>
        </details>
      )}
      {status === 'error' && (
        <div className="cr-tool-card__error">
          <p>
            <AlertIcon /> <span className="cr-visually-hidden">Error: </span>
            {error ?? 'The tool call failed.'}
          </p>
          {onRetry && retryable && (
            <Button size="sm" onClick={onRetry}>
              <RetryIcon /> Retry
            </Button>
          )}
        </div>
      )}
      {announce && <LiveRegion message={status === 'error' ? `Tool call ${tool} failed: ${error ?? ''}` : ''} />}
    </article>
  );
}
