// Overview: what the agents did lately and what is waiting for you.
import { useState } from 'react';
import { Button, Card, DonutChart, LineChart, NeedsYouInbox, Sparkline, StatCard, StatusDot, Table, ToggleGroup, ToggleGroupItem } from '@creance-ui/react';
import { formatAgo, formatTokens, runs, tokenSeries, type Run } from '../data';
import { PageHead, Shell, icons, type App } from '../shell';
import { RunStatus } from './Runs';

export function Overview({ app }: { app: App }) {
  const [days, setDays] = useState('14');
  const series = tokenSeries(Number(days));
  const total = series.current.reduce((a, b) => a + b, 0);

  return (
    <Shell app={app} route="overview" crumbs={[{ label: 'Overview' }]}>
      <PageHead
        title="Overview"
        sub={`3 runs going, ${app.inbox.length} waiting for you. Last ${days} days.`}
        actions={
          <>
            <ToggleGroup type="single" value={days} onValueChange={(v) => v && setDays(v)} aria-label="Period">
              <ToggleGroupItem value="7">7 days</ToggleGroupItem>
              <ToggleGroupItem value="14">14 days</ToggleGroupItem>
              <ToggleGroupItem value="30">30 days</ToggleGroupItem>
            </ToggleGroup>
            <Button variant="primary" onClick={() => app.go('agents')}>
              {icons.plus}New run
            </Button>
          </>
        }
      />
      <div className="ex-grid ex-grid--4">
        <StatCard label="Runs today" value="20" trend={{ direction: 'up', label: '4' }} note="vs yesterday" chart={<Sparkline variant="bars" values={[12, 18, 9, 22, 16, 5, 20]} label="Runs over 7 days" width={84} height={34} />} />
        <StatCard label="Waiting for you" value={app.inbox.length} trend={{ direction: 'flat', label: 'No change' }} note="oldest 2 hours" />
        <StatCard label={`Tokens, ${days} days`} value={`${formatTokens(total * 1000)}`} trend={{ direction: 'up', label: '12%' }} note="vs the period before" chart={<Sparkline variant="area" values={series.current} label={`Tokens over ${days} days`} width={96} height={34} />} />
        <StatCard label="Failed runs" value="3" trend={{ direction: 'up', label: '2', tone: 'bad' }} note="vs yesterday" />
      </div>
      <div className="ex-grid ex-grid--side">
        <Card as="section" className="ex-card" aria-labelledby="tokens-h">
          <h2 id="tokens-h">Tokens per day</h2>
          <LineChart
            label="Tokens per day, this period against the previous one"
            axisLabel="Day"
            labels={series.labels}
            series={[
              { name: 'This period', values: series.current },
              { name: 'Previous period', values: series.previous, style: 'dashed' },
            ]}
            unit="K"
            height={300}
          />
        </Card>
        <Card as="section" className="ex-card">
          <NeedsYouInbox items={app.inbox.slice(0, 3)} onOpen={(item) => app.go(`inbox/${item.id}`)} title="Needs you" headingLevel={2} emptyText="Nothing is waiting for you." />
          {app.inbox.length > 3 && <a href="#inbox" className="ex-more">{app.inbox.length - 3} more in your inbox</a>}
        </Card>
      </div>
      <div className="ex-grid ex-grid--side">
        <Card as="section" className="ex-card ex-card--flush" aria-labelledby="recent-h">
          <div className="ex-card__head">
            <h2 id="recent-h">Recent runs</h2>
            <a href="#runs">All runs</a>
          </div>
          <Table<Run>
            caption="Recent runs"
            rows={runs.slice(0, 4)}
            rowKey={(r) => r.id}
            columns={[
              { key: 'title', header: 'Run', rowHeader: true, cell: (r) => <a href={`#run/${r.id}`}>{r.title}</a> },
              { key: 'agent', header: 'Agent', cell: (r) => r.agent },
              { key: 'status', header: 'Status', cell: (r) => <RunStatus status={r.status} /> },
              { key: 'tokens', header: 'Tokens', align: 'end', cell: (r) => formatTokens(r.tokens) },
              { key: 'started', header: 'Started', cell: (r) => <span className="ex-muted">{formatAgo(r.started)}</span> },
            ]}
          />
        </Card>
        <Card as="section" className="ex-card" aria-labelledby="outcomes-h">
          <h2 id="outcomes-h">Run outcomes</h2>
          <DonutChart
            label="Run outcomes"
            centerLabel="runs"
            size={130}
            data={[
              { label: 'Completed', value: 64 },
              { label: 'Waiting for you', value: 5 },
              { label: 'Stopped by you', value: 9 },
              { label: 'Failed', value: 7, tone: 'danger' },
            ]}
          />
          <p className="ex-muted ex-small">
            <StatusDot status="failed">7 failed</StatusDot>, 3 of them today.
          </p>
        </Card>
      </div>
    </Shell>
  );
}
