// Agents: who works here, what each one does, and how busy it has been.
import { useState } from 'react';
import { Avatar, Button, Card, DotsMenu, EmptyState, MenuItem, MenuSeparator, SearchInput, Select, Sparkline, StatusDot, toast } from '@creance-ui/react';
import { agents } from '../data';
import { PageHead, Shell, icons, type App } from '../shell';

const sample = 'This is a sample app: nothing runs.';

export function Agents({ app }: { app: App }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('active');
  const runsThisWeek = (week: number[]) => week.reduce((a, b) => a + b, 0) * 2;
  const shown = agents
    .filter((a) => `${a.name} ${a.description}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : runsThisWeek(b.week) - runsThisWeek(a.week)));

  return (
    <Shell app={app} route="agents" crumbs={[{ label: 'Agents' }]}>
      <PageHead
        title="Agents"
        sub={`${agents.length} agents in Acme. Each one asks before anything you have not allowed.`}
        actions={
          <Button variant="primary" onClick={() => toast({ title: `New agent. ${sample}` })}>
            {icons.plus}New agent
          </Button>
        }
      />
      <div className="ex-filters">
        <SearchInput aria-label="Search agents" placeholder="Search agents" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} />
        <span className="ex-header__space" />
        <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="active">Sort: Most active</option>
          <option value="name">Sort: Name</option>
        </Select>
      </div>
      {shown.length === 0 && (
        <Card className="ex-card">
          <EmptyState title="No agents match" description="Try another name." headingLevel={2} />
        </Card>
      )}
      <div className="ex-grid ex-grid--3">
        {shown.map((a) => (
          <Card as="article" key={a.id} className="ex-card ex-agent" aria-labelledby={`${a.id}-h`}>
            <div className="ex-agent__head">
              <Avatar name={a.name} kind="agent" decorative />
              <div>
                <h2 id={`${a.id}-h`}>{a.name}</h2>
                <StatusDot status={a.status}>{a.status === 'failed' ? 'Last run failed' : a.status === 'waiting' ? 'Waiting for you' : a.state}</StatusDot>
              </div>
              <DotsMenu label={`More for ${a.name}`}>
                <MenuItem onSelect={() => app.go('runs')}>See its runs</MenuItem>
                <MenuItem onSelect={() => app.go('permissions')}>Permissions</MenuItem>
                <MenuItem onSelect={() => toast({ title: `${a.name} paused. ${sample}` })}>Pause</MenuItem>
                <MenuSeparator />
                <MenuItem tone="danger" onSelect={() => toast({ title: `${a.name} would be removed. ${sample}`, tone: 'danger' })}>
                  Remove
                </MenuItem>
              </DotsMenu>
            </div>
            <p>{a.description}</p>
            <div className="ex-agent__facts">
              <dl>
                <dt>Runs this week</dt>
                <dd>{runsThisWeek(a.week)}</dd>
              </dl>
              <Sparkline variant="bars" values={a.week} label={`${a.name}: runs per day this week`} width={84} height={30} />
              <dl>
                <dt>Permissions</dt>
                <dd>{a.permissions} standing</dd>
              </dl>
            </div>
            <div className="ex-agent__actions">
              <Button size="sm" onClick={() => (a.name === 'Deploy Fixer' ? app.go('run/r41') : toast({ title: `Starting ${a.name}. ${sample}` }))}>
                {icons.play}
                {a.name === 'Deploy Fixer' ? 'Open its run' : 'Start run'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => app.go('settings')}>
                Settings
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
