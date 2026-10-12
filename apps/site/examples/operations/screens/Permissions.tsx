// Permissions: what agents may do without asking, and what they asked for lately.
import { useState } from 'react';
import { Card, PermissionLedger, Switch, Table, toast } from '@creance-ui/react';
import { decisions, permissions as initial } from '../data';
import { PageHead, Shell, type App } from '../shell';

type Decision = (typeof decisions)[number];

export function Permissions({ app }: { app: App }) {
  const [permissions, setPermissions] = useState(initial);
  const set = (id: string, revoked: boolean) => setPermissions((ps) => ps.map((p) => (p.id === id ? { ...p, revoked } : p)));
  const revoked = permissions.filter((p) => p.revoked).length;

  return (
    <Shell app={app} route="permissions" crumbs={[{ label: 'Permissions' }]}>
      <PageHead title="Permissions" sub="What agents may do without asking, and what they asked for lately." />
      <PermissionLedger
        permissions={permissions}
        summary={`${permissions.length - revoked} granted${revoked ? `, ${revoked} revoked just now` : ''}`}
        headingLevel={2}
        onRevoke={(id) => set(id, true)}
        onRestore={(id) => set(id, false)}
      />
      <div className="ex-grid ex-grid--side">
        <Card as="section" className="ex-card ex-card--flush" aria-labelledby="decisions-h">
          <div className="ex-card__head">
            <h2 id="decisions-h">Recent decisions</h2>
            <a href="#audit-log">Audit log</a>
          </div>
          <Table<Decision>
            caption="Recent decisions"
            rows={decisions}
            rowKey={(d) => d.id}
            columns={[
              { key: 'what', header: 'Request', rowHeader: true, cell: (d) => <code>{d.what}</code> },
              { key: 'agent', header: 'Agent', cell: (d) => d.agent },
              { key: 'when', header: 'When', cell: (d) => <span className="ex-muted">{d.when}</span> },
              { key: 'result', header: 'Decision', align: 'end', cell: (d) => <span className={d.result === 'Denied' ? 'ex-danger' : undefined}>{d.result}</span> },
            ]}
          />
        </Card>
        <Card as="section" className="ex-card" aria-labelledby="ask-h">
          <h2 id="ask-h">Always ask for</h2>
          <p className="ex-muted ex-small">These win over any standing permission.</p>
          <div className="ex-switches">
            <Switch label="Anything high risk" description="Pushes, deletes, writes to production." defaultChecked onChange={(e) => toast({ title: e.target.checked ? 'Agents will ask before high-risk actions.' : 'High-risk actions follow standing permissions.' })} />
            <Switch label="Spending money" description="Paid APIs and cloud resources." defaultChecked />
            <Switch label="Network outside the allowlist" description="Any host not listed in Integrations." defaultChecked />
          </div>
        </Card>
      </div>
    </Shell>
  );
}
