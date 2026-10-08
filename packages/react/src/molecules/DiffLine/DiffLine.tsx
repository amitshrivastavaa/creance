import { cx } from '../../internal/cx';
import './DiffLine.css';

export type DiffLineType = 'add' | 'remove' | 'context';

export interface DiffLineProps {
  type: DiffLineType;
  content: string;
  oldNumber?: number | undefined;
  newNumber?: number | undefined;
  className?: string;
}

const sign: Record<DiffLineType, string> = { add: '+', remove: '-', context: ' ' };
const spoken: Record<DiffLineType, string> = { add: 'Added: ', remove: 'Removed: ', context: '' };

/**
 * One line of a unified diff. The +/- sign is visual only; screen readers hear "Added:" or "Removed:",
 * and the content sits in `<ins>` or `<del>`.
 */
export function DiffLine({ type, content, oldNumber, newNumber, className }: DiffLineProps) {
  const Text = type === 'add' ? 'ins' : type === 'remove' ? 'del' : 'span';
  return (
    <div className={cx('cr-diff-line', className)} data-type={type}>
      <span className="cr-diff-line__num" aria-hidden="true">
        {oldNumber ?? ''}
      </span>
      <span className="cr-diff-line__num" aria-hidden="true">
        {newNumber ?? ''}
      </span>
      <span className="cr-diff-line__sign" aria-hidden="true">
        {sign[type]}
      </span>
      <Text className="cr-diff-line__content">
        {spoken[type] && <span className="cr-visually-hidden">{spoken[type]}</span>}
        {content || ' '}
      </Text>
    </div>
  );
}
