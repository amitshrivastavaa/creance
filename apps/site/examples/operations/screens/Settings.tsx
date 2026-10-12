// Settings: the workspace, how agents behave by default, who is in it, and the plan.
import { useState } from 'react';
import { Avatar, Button, Card, Description, Field, Input, Select, Switch, Table, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@creance-ui/react';
import { agents, members } from '../data';
import { PageHead, Shell, type App } from '../shell';

type Member = (typeof members)[number];

export function Settings({ app }: { app: App }) {
  const [budget, setBudget] = useState('500000');
  const invalid = !/^\d+$/.test(budget.replaceAll(',', ''));

  return (
    <Shell app={app} route="settings" crumbs={[{ label: 'Settings' }]}>
      <PageHead title="Settings" sub="How the Acme workspace and its agents behave." />
      <Tabs defaultValue="agents">
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <form className="cr-card cr-surface ex-card ex-form" onSubmit={(e) => (e.preventDefault(), toast({ title: 'Saved.', tone: 'success' }))}>
            <Field label="Workspace name">
              <Input defaultValue="Acme" />
            </Field>
            <Field label="Region" hint="Where runs and their logs are stored.">
              <Select defaultValue="eu">
                <option value="eu">Europe</option>
                <option value="us">United States</option>
              </Select>
            </Field>
            <div className="ex-form__actions">
              <Button type="submit" variant="primary">Save changes</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="agents">
          <form className="cr-card cr-surface ex-card ex-form" onSubmit={(e) => (e.preventDefault(), !invalid && toast({ title: 'Agent defaults saved.', tone: 'success' }))}>
            <h2>Defaults for new runs</h2>
            <div className="ex-grid ex-grid--2">
              <Field label="Default agent">
                <Select defaultValue="Deploy Fixer">
                  {agents.map((a) => (
                    <option key={a.id}>{a.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Default model">
                <Select defaultValue="medium">
                  <option value="small">Small, fastest</option>
                  <option value="medium">Medium, balanced</option>
                  <option value="large">Large, most careful</option>
                </Select>
              </Field>
            </div>
            <Field label="Daily token budget" hint="Runs pause and ask you once the team reaches it." error={invalid ? 'Enter a whole number of tokens, like 500000.' : undefined}>
              <Input inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </Field>
            <div className="ex-switches">
              <Switch label="Ask before installing packages" description="Shows an approval for every install." defaultChecked />
              <Switch label="Ask before writing outside the repository" description="Covers home folders, system paths and other repositories." defaultChecked />
              <Switch label="Let agents open pull requests" description="They still cannot merge." />
            </div>
            <div className="ex-form__actions">
              <Button type="reset" onClick={() => setBudget('500000')}>Cancel</Button>
              <Button type="submit" variant="primary">Save changes</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="members">
          <Card className="ex-card ex-card--flush">
            <Table<Member>
              caption="Members"
              rows={members}
              rowKey={(m) => m.id}
              columns={[
                { key: 'name', header: 'Name', rowHeader: true, cell: (m) => <span className="ex-actor"><Avatar name={m.name} kind="human" size="sm" decorative />{m.name}</span> },
                { key: 'email', header: 'Email', cell: (m) => <span className="ex-muted">{m.email}</span> },
                {
                  key: 'role',
                  header: 'Role',
                  cell: (m) =>
                    m.role === 'Owner' ? (
                      'Owner'
                    ) : (
                      <Select size="sm" aria-label={`Role for ${m.name}`} defaultValue={m.role}>
                        <option>Admin</option>
                        <option>Member</option>
                      </Select>
                    ),
                },
              ]}
            />
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="ex-card">
            <Description
              items={[
                { term: 'Plan', details: 'Team, 3 seats' },
                { term: 'Tokens included', details: '3M a month' },
                { term: 'Next invoice', details: '1 November' },
              ]}
            />
            <p className="ex-muted ex-small">A sample workspace: there is no real plan or invoice.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
