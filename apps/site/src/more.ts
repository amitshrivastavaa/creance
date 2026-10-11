// Further examples for the most-used components: one per variant, state or common composition.
export interface Extra {
  title: string;
  about?: string;
  code: string;
  state?: Record<string, unknown>;
}

const row = `style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}`;
const col = (w: number) => `style={{ display: 'grid', gap: 14, maxWidth: ${w} }}`;
const x = (title: string, about: string, code: string, state?: Record<string, unknown>): Extra => ({
  title,
  about: about || undefined,
  code: code.replace(/^\n/, '').replace(/\n\s*$/, ''),
  state,
});

const tableColumns = `[
    { key: 'title', header: 'Run', rowHeader: true, cell: (r) => r.title },
    { key: 'agent', header: 'Agent', cell: (r) => r.agent },
    { key: 'tokens', header: 'Tokens', align: 'end', cell: (r) => r.tokens },
  ]`;

export const more: Record<string, Extra[]> = {
  Button: [
    x('Sizes', 'The default is 44 pixels tall, a comfortable touch target. Use sm in dense toolbars.', `
<div ${row}>
  <Button>Default</Button>
  <Button size="sm">Small</Button>
</div>`),
    x('With a shortcut hint', 'Show the key that triggers the same action.', `
<div ${row}>
  <Button variant="primary">Allow once <Kbd>A</Kbd></Button>
  <Button variant="danger">Deny <Kbd>D</Kbd></Button>
</div>`),
    x('Disabled', '', `
<div ${row}>
  <Button variant="primary" disabled>Allow once</Button>
  <Button disabled>Always allow</Button>
</div>`),
    x('Full width', '', `
<div style={{ maxWidth: 320 }}>
  <Button variant="primary" style={{ width: '100%' }}>Start with this plan</Button>
</div>`),
  ],
  Input: [
    x('Sizes', '', `
<div ${col(320)}>
  <Input aria-label="Default size" defaultValue="Default" />
  <Input aria-label="Small size" size="sm" defaultValue="Small" />
</div>`),
    x('Types', 'It is a native input, so every type works.', `
<div ${col(320)}>
  <Input aria-label="Email" type="email" placeholder="you@example.com" />
  <Input aria-label="Token budget" type="number" defaultValue={50000} />
  <Input aria-label="API key" type="password" defaultValue="secret" />
</div>`),
    x('Invalid', 'Set aria-invalid, or wrap the input in a Field with an error.', `
<div style={{ maxWidth: 320 }}>
  <Input aria-label="Branch" defaultValue="main main" aria-invalid />
</div>`),
    x('Disabled', '', `
<div style={{ maxWidth: 320 }}>
  <Input aria-label="Workspace" defaultValue="acme/web" disabled />
</div>`),
  ],
  Field: [
    x('With an error', 'The error marks the control invalid and is read out with it.', `
<div style={{ maxWidth: 360 }}>
  <Field label="Branch" error="Branch names can't contain spaces. Try fix-deploy.">
    <Input defaultValue="fix deploy" />
  </Field>
</div>`),
    x('With a select', '', `
<div style={{ maxWidth: 360 }}>
  <Field label="Run speed" hint="Applies to the next run.">
    <Select defaultValue="1">
      <option value="1">Normal</option>
      <option value="2">2×</option>
    </Select>
  </Field>
</div>`),
    x('With a textarea', '', `
<div style={{ maxWidth: 360 }}>
  <Field label="Answer for Data Loader" hint="The agent reads this as its instruction.">
    <Textarea defaultValue="Seed staging-eu." />
  </Field>
</div>`),
    x('With a combobox', 'Field wires its label to any control that accepts an id.', `
<div style={{ maxWidth: 360, minHeight: 220 }}>
  <Field label="Assign to agent">
    <Combobox
      placeholder="Choose an agent"
      options={[
        { value: 'df', label: 'Deploy Fixer' },
        { value: 'dl', label: 'Data Loader' },
      ]}
    />
  </Field>
</div>`),
  ],
  Select: [
    x('Sizes', '', `
<div ${col(240)}>
  <Select aria-label="Default size" defaultValue="1">
    <option value="1">Default</option>
  </Select>
  <Select aria-label="Small size" size="sm" defaultValue="1">
    <option value="1">Small</option>
  </Select>
</div>`),
    x('With groups', 'Native optgroups work as usual.', `
<div style={{ maxWidth: 240 }}>
  <Select aria-label="Agent" defaultValue="df">
    <optgroup label="Running">
      <option value="dl">Data Loader</option>
      <option value="dw">Docs Writer</option>
    </optgroup>
    <optgroup label="Idle">
      <option value="df">Deploy Fixer</option>
    </optgroup>
  </Select>
</div>`),
    x('Disabled', '', `
<div style={{ maxWidth: 240 }}>
  <Select aria-label="Workspace" defaultValue="acme" disabled>
    <option value="acme">acme/web</option>
  </Select>
</div>`),
  ],
  Checkbox: [
    x('With a description', '', `
<Checkbox label="Open a pull request when done" description="As a draft until the checks pass." />`),
    x('Disabled', '', `
<div ${col(360)}>
  <Checkbox label="Deploy automatically" disabled />
  <Checkbox label="Run tests after every change" defaultChecked disabled />
</div>`),
    x('In a group', 'Use a fieldset and legend to name the group.', `
<fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 12 }}>
  <legend style={{ fontWeight: 600, marginBottom: 12 }}>After each run</legend>
  <Checkbox label="Run the tests" defaultChecked />
  <Checkbox label="Open a pull request" />
  <Checkbox label="Notify the team" />
</fieldset>`),
  ],
  Switch: [
    x('With a description', '', `
<div style={{ maxWidth: 380 }}>
  <Switch label="Deploy on merge" description="Only on the main branch." />
</div>`),
    x('Disabled', '', `
<div ${col(380)}>
  <Switch label="Always allow file reads" disabled />
  <Switch label="Ask before shell commands" defaultChecked disabled />
</div>`),
    x('A settings list', '', `
<div ${col(380)}>
  <Switch label="Ask before shell commands" defaultChecked />
  <Separator />
  <Switch label="Ask before installing packages" defaultChecked />
  <Separator />
  <Switch label="Ask before reading files" />
</div>`),
  ],
  Tabs: [
    x('Controlled', 'Hold the selected tab in your own state.', `
<Tabs value={state.tab} onValueChange={set.tab}>
  <TabsList aria-label="Run views">
    <TabsTrigger value="timeline">Timeline</TabsTrigger>
    <TabsTrigger value="changes">Changes</TabsTrigger>
  </TabsList>
  <TabsContent value="timeline">The timeline is selected.</TabsContent>
  <TabsContent value="changes">The changes are selected.</TabsContent>
</Tabs>`, { tab: 'changes' }),
    x('A disabled tab', '', `
<Tabs defaultValue="timeline">
  <TabsList aria-label="Run views">
    <TabsTrigger value="timeline">Timeline</TabsTrigger>
    <TabsTrigger value="changes">Changes</TabsTrigger>
    <TabsTrigger value="deploy" disabled>Deploy</TabsTrigger>
  </TabsList>
  <TabsContent value="timeline">Three steps, one waiting for you.</TabsContent>
  <TabsContent value="changes">Two files changed.</TabsContent>
</Tabs>`),
    x('With components inside', '', `
<Tabs defaultValue="status">
  <TabsList aria-label="Agent">
    <TabsTrigger value="status">Status</TabsTrigger>
    <TabsTrigger value="budget">Budget</TabsTrigger>
  </TabsList>
  <TabsContent value="status"><StatusDot status="waiting" /></TabsContent>
  <TabsContent value="budget">
    <div style={{ maxWidth: 260 }}><BudgetMeter used={9800} limit={50000} unit="tokens" /></div>
  </TabsContent>
</Tabs>`),
  ],
  Dialog: [
    x('Controlled', 'Open it from anywhere by holding the open state yourself.', `
<>
  <Button onClick={() => set.open(true)}>Open the dialog</Button>
  <Dialog open={state.open} onOpenChange={set.open}>
    <DialogContent
      title="Run finished"
      description="Deploy Fixer handed back to you."
      actions={<DialogClose asChild><Button variant="primary">Done</Button></DialogClose>}
    />
  </Dialog>
</>`, { open: false }),
    x('With a form', 'Anything can go between the description and the actions.', `
<Dialog>
  <DialogTrigger asChild>
    <Button>Rename agent</Button>
  </DialogTrigger>
  <DialogContent
    title="Rename agent"
    actions={
      <>
        <DialogClose asChild><Button>Cancel</Button></DialogClose>
        <DialogClose asChild><Button variant="primary" onClick={log}>Save</Button></DialogClose>
      </>
    }
  >
    <Field label="Agent name">
      <Input defaultValue="Deploy Fixer" />
    </Field>
  </DialogContent>
</Dialog>`),
    x('Title only', 'Leave out the description for a short question.', `
<Dialog>
  <DialogTrigger asChild>
    <Button>Pause run</Button>
  </DialogTrigger>
  <DialogContent
    title="Pause Deploy Fixer?"
    actions={
      <>
        <DialogClose asChild><Button>Keep running</Button></DialogClose>
        <DialogClose asChild><Button variant="primary" onClick={log}>Pause</Button></DialogClose>
      </>
    }
  />
</Dialog>`),
  ],
  Menu: [
    x('With descriptions', '', `
<Menu>
  <MenuTrigger asChild>
    <Button size="sm">Hand off</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem description="For review before merging" onSelect={log}>Open pull request</MenuItem>
    <MenuItem description="Nothing is pushed" onSelect={log}>Keep changes local</MenuItem>
  </MenuContent>
</Menu>`),
    x('With a label and groups', '', `
<Menu>
  <MenuTrigger asChild>
    <Button size="sm">Agent</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuLabel>Deploy Fixer</MenuLabel>
    <MenuGroup>
      <MenuItem onSelect={log}>Open run</MenuItem>
      <MenuItem onSelect={log}>Rename</MenuItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuItem tone="danger" onSelect={log}>Stop agent</MenuItem>
  </MenuContent>
</Menu>`),
    x('A disabled item', '', `
<Menu>
  <MenuTrigger asChild>
    <Button size="sm">Run options</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem onSelect={log}>Pause run</MenuItem>
    <MenuItem disabled>Rewind to a checkpoint</MenuItem>
  </MenuContent>
</Menu>`),
    x('Aligned to the end', '', `
<Menu>
  <MenuTrigger asChild>
    <Button size="sm">Aligned end</Button>
  </MenuTrigger>
  <MenuContent align="end">
    <MenuItem onSelect={log}>Open run</MenuItem>
    <MenuItem onSelect={log}>Pause</MenuItem>
  </MenuContent>
</Menu>`),
  ],
  Toast: [
    x('Tones', 'These use the Toaster in the first example. Mount one Toaster per app.', `
<div ${row}>
  <Button onClick={() => toast({ title: 'Plan saved' })}>Default</Button>
  <Button onClick={() => toast({ title: 'Allowed npm install zod@3 once', tone: 'success' })}>Success</Button>
  <Button onClick={() => toast({ title: 'Upgrader failed: 3 tests failing', tone: 'danger' })}>Danger</Button>
</div>`),
    x('With an action', 'One follow-up, such as Undo.', `
<Button onClick={() => toast({ title: 'Revoked git push for Release Bot', action: { label: 'Undo', onClick: log } })}>
  Revoke with undo
</Button>`),
    x('A longer stay', 'The default is five seconds. A toast also stays while it is hovered or focused.', `
<Button onClick={() => toast({ title: 'This one stays for ten seconds', duration: 10000 })}>
  Show for ten seconds
</Button>`),
  ],
  Tooltip: [
    x('Sides', '', `
<div ${row}>
  <Tooltip content="Top" side="top"><Button size="sm">Top</Button></Tooltip>
  <Tooltip content="Right" side="right"><Button size="sm">Right</Button></Tooltip>
  <Tooltip content="Bottom" side="bottom"><Button size="sm">Bottom</Button></Tooltip>
  <Tooltip content="Left" side="left"><Button size="sm">Left</Button></Tooltip>
</div>`),
    x('On an icon button', 'IconButton shows its label as a tooltip by default.', `
<IconButton label="Retry tool call" icon="↻" />`),
  ],
  Table: [
    x('Basic', 'Without sorting or selection.', `
<Table
  caption="Recent runs"
  rows={runs}
  rowKey={(r) => r.id}
  columns={${tableColumns}}
/>`),
    x('With a visible caption', '', `
<Table
  caption="Recent runs"
  showCaption
  rows={runs}
  rowKey={(r) => r.id}
  columns={${tableColumns}}
/>`),
    x('Empty', 'Say what will fill it.', `
<Table
  caption="Recent runs"
  rows={[]}
  rowKey={(r) => r.id}
  emptyMessage="No runs yet. They appear here when an agent starts work."
  columns={${tableColumns}}
/>`),
  ],
  Badge: [
    x('A custom label', 'The words can change; the status sets the tone and icon.', `
<div ${row}>
  <Badge status="waiting">Needs approval</Badge>
  <Badge status="done">Merged</Badge>
  <Badge status="failed">3 tests failing</Badge>
</div>`),
    x('Beside a title', '', `
<div ${row}>
  <strong>Deploy Fixer</strong>
  <Badge status="running" />
</div>`),
  ],
  Alert: [
    x('Title only', '', `
<div style={{ maxWidth: 480 }}>
  <Alert title="Deploy Fixer is paused" />
</div>`),
    x('Danger', 'Announced when it appears, so render it only when something just went wrong.', `
<div style={{ maxWidth: 480 }}>
  <Alert title="The run failed" tone="danger">Migration 042 failed: column "region" already exists.</Alert>
</div>`),
    x('With an action', '', `
<div style={{ maxWidth: 480 }}>
  <Alert title="Budget at 84%">
    Deploy Fixer has used 42K of 50K tokens.
    <div style={{ marginTop: 10 }}><Button size="sm" onClick={log}>Raise budget</Button></div>
  </Alert>
</div>`),
  ],
  Card: [
    x('As a section', 'Pick the element that fits: div, article or section.', `
<Card as="section" aria-label="Waiting on you" style={{ maxWidth: 260 }}>
  <span>Waiting on you</span>
  <strong style={{ fontSize: 30 }}>5</strong>
  <span>2 urgent</span>
</Card>`),
    x('With actions', '', `
<Card style={{ maxWidth: 320 }}>
  <strong>Deploy Fixer</strong>
  <span>Asks for risky actions</span>
  <div ${row}>
    <Button size="sm" onClick={log}>Open</Button>
    <Button size="sm" variant="ghost" onClick={log}>Pause</Button>
  </div>
</Card>`),
  ],
  Combobox: [
    x('With a starting value', '', `
<div style={{ maxWidth: 360, minHeight: 220 }}>
  <Combobox
    aria-label="Assign to agent"
    defaultValue="dl"
    onValueChange={log}
    options={[
      { value: 'df', label: 'Deploy Fixer' },
      { value: 'dl', label: 'Data Loader' },
      { value: 'dw', label: 'Docs Writer' },
    ]}
  />
</div>`),
    x('With avatars', 'Each option can carry something at the start and at the end.', `
<div style={{ maxWidth: 360, minHeight: 220 }}>
  <Combobox
    aria-label="Assign to agent"
    placeholder="Choose an agent"
    options={[
      { value: 'df', label: 'Deploy Fixer', meta: 'idle', leading: <Avatar name="Deploy Fixer" kind="agent" size="sm" decorative /> },
      { value: 'dl', label: 'Data Loader', meta: 'running', leading: <Avatar name="Data Loader" kind="agent" size="sm" decorative /> },
    ]}
  />
</div>`),
    x('Creating a new option', 'With onCreate, typing something new offers to create it.', `
<div style={{ maxWidth: 360, minHeight: 220 }}>
  <Combobox
    aria-label="Label"
    placeholder="Type a new label"
    onCreate={log}
    options={[
      { value: 'bug', label: 'bug' },
      { value: 'deploy', label: 'deploy' },
    ]}
  />
</div>`),
    x('Disabled', '', `
<div style={{ maxWidth: 360 }}>
  <Combobox aria-label="Assign to agent" defaultValue="df" disabled options={[{ value: 'df', label: 'Deploy Fixer' }]} />
</div>`),
  ],
  ApprovalPrompt: [
    x('Low risk', '', `
<ApprovalPrompt
  agentName="Docs Writer"
  action="read_file"
  target="docs/onboarding.md"
  risk="low"
  reason="I need the current guide before I edit it."
  autoFocus={false}
  onAllow={log}
  onDeny={log}
/>`),
    x('High risk', 'A high-risk action hides "Always allow", so it is confirmed every time.', `
<ApprovalPrompt
  agentName="Release Bot"
  action="git push --force origin main"
  target="github.com/acme/web"
  risk="high"
  reason="The release branch has diverged from main."
  autoFocus={false}
  onAllow={log}
  onDeny={log}
/>`),
    x('Already allowed', 'Set decision and the prompt shows the outcome instead of the buttons.', `
<ApprovalPrompt
  agentName="Deploy Fixer"
  action="npm install zod@3"
  target="web/package.json"
  risk="medium"
  reason="server/validate.ts imports zod, but it is missing from dependencies."
  decision="allow-once"
  autoFocus={false}
/>`),
    x('Denied', '', `
<ApprovalPrompt
  agentName="Release Bot"
  action="git push --force origin main"
  target="github.com/acme/web"
  risk="high"
  reason="The release branch has diverged from main."
  decision="deny"
  autoFocus={false}
/>`),
  ],
  ToolCallCard: [
    x('Running', '', `
<ToolCallCard tool="run_tests" status="running" startedAt={secondsAgo(4)} input={{ suite: 'web' }} />`),
    x('Succeeded', 'Input and result fold away until needed.', `
<ToolCallCard
  tool="read_logs"
  status="success"
  startedAt={secondsAgo(20)}
  endedAt={secondsAgo(18)}
  input={{ service: 'web', lines: 200 }}
  output={{ error: "Cannot find module 'zod'", at: 'server/validate.ts:3' }}
  defaultOpen
/>`),
    x('Succeeded after a retry', 'Earlier attempts stay visible.', `
<ToolCallCard
  tool="run_tests"
  status="success"
  attempt={2}
  previousAttempts={[{ attempt: 1, error: 'ECONNRESET: registry.npmjs.org timed out after 10s' }]}
  startedAt={secondsAgo(9)}
  endedAt={secondsAgo(6)}
  output="212 passed, 0 failed"
/>`),
    x('Waiting to start', '', `
<ToolCallCard tool="open_pull_request" status="pending" />`),
  ],
  RunTimeline: [
    x('A finished run', '', `
<div style={{ height: 380 }}>
  <RunTimeline steps={finishedSteps} live={false} />
</div>`),
    x('Empty', '', `
<div style={{ height: 120 }}>
  <RunTimeline steps={[]} emptyText="The run has not started. Steps appear here as the agent works." />
</div>`),
  ],
  AgentHandoffBanner: [
    x('Stopped', 'When you or a limit stopped the run.', `
<AgentHandoffBanner
  agentName="Deploy Fixer"
  outcome="stopped"
  summary="You stopped the run. The dependency is installed; the config change was not applied."
  actions={[{ id: 'resume', label: 'Resume run', primary: true }]}
  focusOnMount={false}
  onAction={log}
/>`),
    x('Failed', '', `
<AgentHandoffBanner
  agentName="Upgrader"
  outcome="failed"
  summary="14 tests broke after the react-router upgrade, and three attempts to fix them failed."
  actions={[
    { id: 'retry', label: 'Retry from step 3', primary: true },
    { id: 'logs', label: 'View run logs' },
  ]}
  focusOnMount={false}
  onAction={log}
/>`),
    x('Without actions', '', `
<AgentHandoffBanner
  agentName="Docs Writer"
  summary="The onboarding guide is updated. Nothing else needs you."
  focusOnMount={false}
/>`),
  ],
};
