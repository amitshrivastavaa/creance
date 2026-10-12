// Runs: every run, searchable and filterable, newest first.
import { useState } from 'react';
import { Button, Card, EmptyState, Pagination, ProgressBar, SearchInput, Select, StatusDot, Table, ToggleGroup, ToggleGroupItem } from '@creance-ui/react';
import { agents, formatAgo, formatDuration, formatTokens, runs, type Run, type RunStatus as Status } from '../data';
import { PageHead, Shell, icons, type App } from '../shell';

const statusText: Record<Status, string> = { waiting: 'Waiting for you', running: 'Running', done: 'Done', failed: 'Failed', stopped: 'Stopped by you' };

/** A run's status as a dot and a word. Stopped looks like done, since nothing is wrong. */
export function RunStatus({ status }: { status: Status }) {
  return <StatusDot status={status === 'stopped' ? 'done' : status}>{statusText[status]}</StatusDot>;
}

const pageSize = 10;

export function Runs({ app }: { app: App }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('any');
  const [agent, setAgent] = useState('any');
  const [who, setWho] = useState('everyone');
  const [page, setPage] = useState(1);

  const shown = runs.filter(
    (r) =>
      r.title.toLowerCase().includes(query.trim().toLowerCase()) &&
      (status === 'any' || r.status === status) &&
      (agent === 'any' || r.agent === agent) &&
      (who === 'everyone' || r.byMe),
  );
  const pageCount = Math.max(1, Math.ceil(shown.length / pageSize));
  const current = Math.min(page, pageCount);
  // Any change to the filters starts again from the first page.
  const filter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <Shell app={app} route="runs" crumbs={[{ label: 'Runs' }]}>
      <PageHead
        title="Runs"
        sub="Everything your agents have done, newest first."
        actions={
          <Button variant="primary" onClick={() => app.go('agents')}>
            {icons.plus}New run
          </Button>
        }
      />
      <div className="ex-filters">
        <SearchInput aria-label="Search runs" placeholder="Search runs" value={query} onChange={(e) => filter(setQuery)(e.target.value)} onClear={() => filter(setQuery)('')} />
        <Select aria-label="Status" value={status} onChange={(e) => filter(setStatus)(e.target.value)}>
          <option value="any">Status: Any</option>
          {Object.entries(statusText).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select aria-label="Agent" value={agent} onChange={(e) => filter(setAgent)(e.target.value)}>
          <option value="any">Agent: Any</option>
          {agents.map((a) => (
            <option key={a.id} value={a.name}>{a.name}</option>
          ))}
        </Select>
        <span className="ex-header__space" />
        <ToggleGroup type="single" value={who} onValueChange={(v) => v && filter(setWho)(v)} aria-label="Started by">
          <ToggleGroupItem value="everyone">Everyone</ToggleGroupItem>
          <ToggleGroupItem value="me">Me</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Card className="ex-card ex-card--flush">
        <Table<Run>
          caption="Runs"
          rows={shown.slice((current - 1) * pageSize, current * pageSize)}
          rowKey={(r) => r.id}
          emptyMessage={<EmptyState title="No runs match" description="Try another search or clear the filters." headingLevel={3} />}
          columns={[
            { key: 'title', header: 'Run', rowHeader: true, cell: (r) => <a href={`#run/${r.id}`}>{r.title}</a>, sortValue: (r) => r.title },
            { key: 'agent', header: 'Agent', cell: (r) => r.agent, sortValue: (r) => r.agent },
            { key: 'status', header: 'Status', cell: (r) => <RunStatus status={r.status} /> },
            {
              key: 'steps',
              header: 'Steps',
              cell: (r) => (
                <span className="ex-steps">
                  <ProgressBar label={`${r.title}: step ${r.steps[0]} of ${r.steps[1]}`} value={r.steps[0]} max={r.steps[1]} tone={r.status === 'failed' ? 'danger' : 'default'} />
                  <span className="ex-muted">{r.steps[0]} of {r.steps[1]}</span>
                </span>
              ),
            },
            { key: 'tokens', header: 'Tokens', align: 'end', cell: (r) => formatTokens(r.tokens), sortValue: (r) => r.tokens },
            { key: 'duration', header: 'Duration', align: 'end', cell: (r) => formatDuration(r.seconds), sortValue: (r) => r.seconds },
            { key: 'started', header: 'Started', cell: (r) => <span className="ex-muted">{formatAgo(r.started)}</span>, sortValue: (r) => -r.started },
          ]}
        />
        {shown.length > pageSize && (
          <div className="ex-card__foot">
            <Pagination page={current} pageCount={pageCount} onPageChange={setPage} label="Runs pages" summary={`${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, shown.length)} of ${shown.length}`} />
          </div>
        )}
      </Card>
    </Shell>
  );
}
