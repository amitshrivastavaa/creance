import { cx } from '../../internal/cx';
import { CopyButton } from '../CopyButton';
import './Snippet.css';

export interface SnippetProps {
  /** One command, or several run in order. */
  commands: string | string[];
  /** `dark` stands out in light pages; `light` blends in. Default dark. */
  tone?: 'dark' | 'light';
  /** The prompt sign shown before each line. It is never copied. Default "$". */
  prompt?: string;
  /** Accessible name of the copy button. Default "Copy command" or "Copy commands". */
  copyLabel?: string;
  className?: string;
}

/** Shell commands with a prompt sign and a copy button that copies only the commands. */
export function Snippet({ commands, tone = 'dark', prompt = '$', copyLabel, className }: SnippetProps) {
  const lines = Array.isArray(commands) ? commands : [commands];
  return (
    <div className={cx('cr-snippet', className)} data-tone={tone}>
      <pre className="cr-snippet__lines">
        {lines.map((line, i) => (
          <div key={i} className="cr-snippet__line">
            <span className="cr-snippet__prompt" aria-hidden="true">
              {prompt}
            </span>
            <code>{line}</code>
          </div>
        ))}
      </pre>
      <CopyButton value={lines.join('\n')} label={copyLabel ?? (lines.length > 1 ? 'Copy commands' : 'Copy command')} />
    </div>
  );
}
