// Budgets: how many tokens agents may use, and what happens at the limit.
import { BudgetMeter, Card, LineChart, ProgressBar, Select, StatCard, Switch } from '@creance-ui/react';
import { limits, tokenSeries } from '../data';
import { PageHead, Shell, type App } from '../shell';

export function Budgets({ app }: { app: App }) {
  const series = tokenSeries(14);
  return (
    <Shell app={app} route="budgets" crumbs={[{ label: 'Budgets' }]}>
      <PageHead
        title="Budgets"
        sub="How many tokens agents may use, and what happens at the limit."
        actions={
          <Select aria-label="Month" defaultValue="2026-10">
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
          </Select>
        }
      />
      <div className="ex-grid ex-grid--side">
        <div className="ex-stack">
          <Card as="section" className="ex-card" aria-labelledby="month-h">
            <h2 id="month-h" className="ex-sr">This month</h2>
            <BudgetMeter label="Tokens this month" used={1_200_000} limit={3_000_000} unit="tokens" />
            <p className="ex-muted ex-small">Resets 1 November. You are warned at 80%.</p>
          </Card>
          <div className="ex-grid ex-grid--4">
            <StatCard label="Average per day" value="98K" trend={{ direction: 'up', label: '9%' }} note="vs September" />
            <StatCard label="Projected by 31 Oct" value="3.0M" note="right at the limit" />
            <StatCard label="Largest share" value="34%" note="Deploy Fixer" />
          </div>
          <Card as="section" className="ex-card" aria-labelledby="daily-h">
            <h2 id="daily-h">Tokens per day</h2>
            <LineChart
              label="Tokens per day, this period against the previous one"
              axisLabel="Day"
              labels={series.labels}
              series={[
                { name: 'This period', values: series.current },
                { name: 'Previous period', values: series.previous, style: 'dashed' },
              ]}
              unit="K"
              height={200}
            />
          </Card>
        </div>
        <div className="ex-stack">
          <Card as="section" className="ex-card" aria-labelledby="limits-h">
            <h2 id="limits-h">Limit per agent</h2>
            <ul className="ex-limits">
              {limits.map((l) => {
                const share = l.used / l.limit;
                return (
                  <li key={l.agent}>
                    <span className="ex-limits__row">
                      <strong>{l.agent}</strong>
                      <span>
                        {l.used}K of {l.limit}K
                      </span>
                    </span>
                    <ProgressBar label={`${l.agent}: ${l.used}K of ${l.limit}K tokens`} value={l.used} max={l.limit} tone={share > 0.85 ? 'danger' : share > 0.65 ? 'warning' : 'default'} />
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card as="section" className="ex-card" aria-labelledby="limit-h">
            <h2 id="limit-h">When a limit is reached</h2>
            <div className="ex-switches">
              <Switch label="Warn me at 80%" description="In the inbox and by email." defaultChecked />
              <Switch label="Pause runs at 100%" description="They wait in the inbox until you raise the limit." defaultChecked />
              <Switch label="Weekly summary" description="Every Monday, by email." />
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
