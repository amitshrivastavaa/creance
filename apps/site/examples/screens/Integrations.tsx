// Integrations: the services and tool servers agents can reach. Nothing else is allowed.
import { useState } from 'react';
import { Avatar, Button, Card, StatusDot, Table, toast } from '@creance-ui/react';
import { services, toolServers as initialServers } from '../data';
import { PageHead, Shell, icons, type App } from '../shell';

type Server = (typeof initialServers)[number];

export function Integrations({ app }: { app: App }) {
  const [connected, setConnected] = useState(() => new Set(services.filter((s) => s.scope).map((s) => s.id)));
  const [servers, setServers] = useState(initialServers);
  const toggle = (id: string, name: string) => {
    const on = !connected.has(id);
    setConnected((c) => {
      const next = new Set(c);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    toast({ title: on ? `${name} connected. In a real app this would open its sign-in.` : `${name} disconnected.` });
  };

  return (
    <Shell app={app} route="integrations" crumbs={[{ label: 'Integrations' }]}>
      <PageHead
        title="Integrations"
        sub="The services and tools agents can reach. Nothing else is allowed."
        actions={
          <Button onClick={() => toast({ title: 'Add a tool server. This is a sample app: nothing connects.' })}>
            {icons.plus}Add tool server
          </Button>
        }
      />
      <div className="ex-grid ex-grid--3">
        {services.map((s) => {
          const on = connected.has(s.id);
          return (
            <Card as="article" key={s.id} className="ex-card ex-service" aria-labelledby={`${s.id}-h`}>
              <div className="ex-service__head">
                <Avatar name={s.name} decorative />
                <div>
                  <h2 id={`${s.id}-h`}>{s.name}</h2>
                  {on ? <StatusDot status="waiting">Connected{s.scope ? ` · ${s.scope}` : ''}</StatusDot> : <span className="ex-muted ex-small">Not connected</span>}
                </div>
              </div>
              <p>{s.about}</p>
              <div>
                <Button size="sm" variant={on ? 'ghost' : 'secondary'} onClick={() => toggle(s.id, s.name)}>
                  {on ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      <Card as="section" className="ex-card ex-card--flush" aria-labelledby="servers-h">
        <div className="ex-card__head">
          <h2 id="servers-h">Tool servers</h2>
          <span className="ex-muted ex-small">MCP servers agents can call</span>
        </div>
        <Table<Server>
          caption="Tool servers"
          rows={servers}
          rowKey={(s) => s.id}
          columns={[
            { key: 'id', header: 'Server', rowHeader: true, cell: (s) => <code>{s.id}</code> },
            { key: 'tools', header: 'Tools', align: 'end', cell: (s) => s.tools },
            { key: 'usedBy', header: 'Used by', cell: (s) => s.usedBy },
            { key: 'status', header: 'Status', cell: (s) => (s.ok ? <StatusDot status="done">Connected</StatusDot> : <StatusDot status="failed">Token expired</StatusDot>) },
            { key: 'latency', header: 'Latency', align: 'end', cell: (s) => s.latency },
            {
              key: 'action',
              header: <span className="ex-sr">Actions</span>,
              align: 'end',
              cell: (s) =>
                s.ok ? null : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setServers((all) => all.map((x) => (x.id === s.id ? { ...x, ok: true, latency: '85 ms' } : x)));
                      toast({ title: `${s.id} reconnected.`, tone: 'success' });
                    }}
                  >
                    Reconnect {s.id}
                  </Button>
                ),
            },
          ]}
        />
      </Card>
    </Shell>
  );
}
