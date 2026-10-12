// Audit log: every action by an agent or a person, with the full record one click away.
import { useState } from 'react';
import { Avatar, Button, Card, EmptyState, JsonView, SearchInput, Select, Sheet, SheetContent, StatusDot, Table, toast } from '@creance-ui/react';
import { audit, type AuditEvent } from '../data';
import { PageHead, Shell, type App } from '../shell';

const result = (r: AuditEvent['result']) =>
  r === 'Waiting' ? <StatusDot status="waiting">Waiting</StatusDot> : r === 'Succeeded' ? <span className="ex-muted">Succeeded</span> : <StatusDot status="failed">{r}</StatusDot>;

export function AuditLog({ app }: { app: App }) {
  const [query, setQuery] = useState('');
  const [actor, setActor] = useState('any');
  const [open, setOpen] = useState<AuditEvent>();
  const actors = [...new Set(audit.map((e) => e.actor))];
  const shown = audit.filter((e) => (actor === 'any' || e.actor === actor) && `${e.event} ${e.target}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Shell app={app} route="audit-log" crumbs={[{ label: 'Audit log' }]}>
      <PageHead
        title="Audit log"
        sub="Every action by an agent or a person, kept for 90 days."
        actions={<Button onClick={() => toast({ title: 'Export CSV. This is a sample app: there is nothing to export.' })}>Export CSV</Button>}
      />
      <div className="ex-filters">
        <SearchInput aria-label="Search events" placeholder="Search events" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} />
        <Select aria-label="Actor" value={actor} onChange={(e) => setActor(e.target.value)}>
          <option value="any">Actor: Anyone</option>
          {actors.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </Select>
        <span className="ex-header__space" />
        <Select aria-label="Period" defaultValue="7">
          <option value="1">Today</option>
          <option value="7">Last 7 days</option>
          <option value="90">Last 90 days</option>
        </Select>
      </div>
      <Card className="ex-card ex-card--flush">
        <Table<AuditEvent>
          caption="Events today"
          rows={shown}
          rowKey={(e) => e.id}
          emptyMessage={<EmptyState title="No events match" description="Try another search or actor." headingLevel={2} />}
          columns={[
            { key: 'time', header: 'Time', cell: (e) => <span className="ex-muted">{e.time}</span> },
            { key: 'actor', header: 'Actor', cell: (e) => <span className="ex-actor"><Avatar name={e.actor} kind={e.kind} size="sm" decorative />{e.actor}</span> },
            { key: 'event', header: 'Event', rowHeader: true, cell: (e) => e.event },
            { key: 'target', header: 'Target', cell: (e) => <code>{e.target}</code> },
            { key: 'result', header: 'Result', cell: (e) => result(e.result) },
            {
              key: 'open',
              header: <span className="ex-sr">Details</span>,
              align: 'end',
              cell: (e) => (
                <Button size="sm" variant="ghost" onClick={() => setOpen(e)} aria-label={`Details: ${e.event}, ${e.target}`}>
                  Details
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(undefined)}>
        {open && (
          <SheetContent title={open.event} description={`${open.actor} at ${open.time} today`}>
            <JsonView value={open.detail} label="Event record" copyable />
          </SheetContent>
        )}
      </Sheet>
    </Shell>
  );
}
