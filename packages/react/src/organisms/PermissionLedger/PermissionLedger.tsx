import { useId, useState, type ReactNode } from 'react';
import { Button } from '../../atoms/Button';
import { cx } from '../../internal/cx';
import { Table, type TableColumn } from '../../molecules/Table';
import './PermissionLedger.css';

export interface StandingPermission {
  id: string;
  /** The tool or command allowed. */
  tool: string;
  /** "Deploy Fixer" or "All agents". */
  agent: string;
  scope: ReactNode;
  /** "2 weeks ago, by you". */
  granted: ReactNode;
  /** Times used since it was granted. */
  uses: number;
  revoked?: boolean;
}

export interface PermissionLedgerProps {
  permissions: StandingPermission[];
  onRevoke: (id: string) => void;
  /** Offered right after a revoke. */
  onRestore?: (id: string) => void;
  /** Under the title, such as "4 granted, 1 revoked this week". */
  summary?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** Everything someone said "Always allow" to: for which agent, how often it has been used, and a way to take it back. */
export function PermissionLedger({ permissions, onRevoke, onRestore, summary, headingLevel = 3, className }: PermissionLedgerProps) {
  const id = useId();
  const H = `h${headingLevel}` as const;
  const [last, setLast] = useState<StandingPermission | null>(null);

  const columns: TableColumn<StandingPermission>[] = [
    { key: 'tool', header: 'Permission', cell: (p) => <code>{p.tool}</code>, rowHeader: true, sortValue: (p) => p.tool },
    { key: 'agent', header: 'Agent', cell: (p) => p.agent, sortValue: (p) => p.agent },
    { key: 'scope', header: 'Scope', cell: (p) => p.scope },
    { key: 'granted', header: 'Granted', cell: (p) => (p.revoked ? 'Revoked' : p.granted) },
    {
      key: 'uses',
      header: 'Used since',
      align: 'end',
      sortValue: (p) => p.uses,
      cell: (p) => (p.uses === 0 ? <span className="cr-ledger__pill">Unused</span> : `${p.uses} ${p.uses === 1 ? 'time' : 'times'}${p.revoked ? ' before' : ''}`),
    },
    {
      key: 'actions',
      header: <span className="cr-visually-hidden">Actions</span>,
      align: 'end',
      cell: (p) =>
        p.revoked ? (
          <span className="cr-ledger__pill">Revoked</span>
        ) : (
          <Button
            size="sm"
            variant="danger"
            aria-label={`Revoke ${p.tool} for ${p.agent}`}
            onClick={() => {
              onRevoke(p.id);
              setLast(p);
            }}
          >
            Revoke
          </Button>
        ),
    },
  ];

  return (
    <section aria-labelledby={id} className={cx('cr-ledger cr-glass', className)}>
      <div className="cr-ledger__head">
        <H id={id} className="cr-ledger__title">
          Standing permissions
        </H>
        {summary && <span className="cr-ledger__summary">{summary}</span>}
      </div>
      <Table caption="Standing permissions" columns={columns} rows={permissions} rowKey={(p) => p.id} emptyMessage="Nothing is always allowed. Every action asks first." />
      <p className="cr-ledger__note">High-risk actions never appear here: they are confirmed every time.</p>
      <div role="status" className="cr-ledger__status">
        {last && (
          <>
            <span>
              Revoked <code>{last.tool}</code> for {last.agent}. It will ask next time.
            </span>
            {onRestore && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onRestore(last.id);
                  setLast(null);
                }}
              >
                Undo
              </Button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
