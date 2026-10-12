import categories from './categories.json';
import { more, type Extra } from './more';

export interface Example {
  name: string;
  /** Sidebar heading. */
  group: string;
  level: 'Atom' | 'Molecule' | 'Organism' | 'Template';
  about: string;
  code: string;
  /** Starting values for `state`; each key also gets a setter under `set`. */
  state?: Record<string, unknown>;
  /** Further examples, shown under the first. */
  more?: Extra[];
}

const ex = (group: string, level: Example['level'], name: string, about: string, code: string, state?: Record<string, unknown>): Example => ({
  group,
  level,
  name,
  about,
  code: code.replace(/^\n/, '').replace(/\n\s*$/, ''),
  state,
});

const row = `style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}`;
const col = (w: number) => `style={{ display: 'grid', gap: 14, maxWidth: ${w} }}`;

const all: Example[] = [
  // ───────────── Agent organisms
  ex('Agent', 'Organism', 'ApprovalPrompt', 'One specific action to allow or deny. A, Shift+A and D work while focus is inside it.', `
<ApprovalPrompt
  agentName="Deploy Fixer"
  action="npm install zod@3"
  target="web/package.json"
  risk="medium"
  reason="server/validate.ts imports zod, but it is missing from dependencies, so the production build fails."
  autoFocus={false}
  onAllow={log}
  onDeny={log}
/>`),
  ex('Agent', 'Organism', 'ToolCallCard', "One tool call's whole life: input, result, errors and retries.", `
<ToolCallCard
  tool="run_tests"
  status="error"
  attempt={2}
  previousAttempts={[{ attempt: 1, error: 'ECONNRESET: registry.npmjs.org timed out after 10s' }]}
  error="14 tests failed after the react-router upgrade"
  input={{ suite: 'web', filter: 'deploy' }}
  retryable
  onRetry={log}
/>`),
  ex('Agent', 'Organism', 'RunTimeline', "The run's steps and tool calls. It follows the newest step until you scroll up.", `
<div style={{ height: 380 }}>
  <RunTimeline steps={steps} selectedToolCallId="run-tests" onSelectToolCall={log} />
</div>`),
  ex('Agent', 'Organism', 'DiffReview', 'A decision per hunk before anything lands. J and K move, Y and N decide.', `
<DiffReview
  file={diff.file}
  hunks={diff.hunks}
  description="Raise deploy retries so a flaky registry does not fail the whole deploy."
  onApply={log}
/>`),
  ex('Agent', 'Organism', 'NeedsYouInbox', 'Everything blocked on a person, across agents, most urgent first.', `
<div style={{ maxWidth: 480 }}>
  <NeedsYouInbox items={inbox} onOpen={log} />
</div>`),
  ex('Agent', 'Organism', 'AgentHandoffBanner', 'The point where the agent hands control back: outcome, summary, next actions.', `
<AgentHandoffBanner
  agentName="Deploy Fixer"
  outcome="completed"
  summary="The deploy is fixed. I added the missing zod dependency. All 42 tests pass. Nothing has been deployed yet."
  actions={[
    { id: 'pr', label: 'Open pull request', primary: true },
    { id: 'logs', label: 'View run logs' },
  ]}
  focusOnMount={false}
  onAction={log}
/>`),
  ex('Agent', 'Organism', 'FleetSky', 'Many agents at once, as birds on lines back to you. The one that needs you flies in on a taut line.', `
<div style={{ height: 360 }}>
  <FleetSky
    onSelect={log}
    agents={[
      { id: 'deploy', name: 'Deploy Fixer', status: 'waiting', detail: 'wants to run npm install zod@3' },
      { id: 'docs', name: 'Docs Writer', status: 'running' },
      { id: 'data', name: 'Data Loader', status: 'running' },
      { id: 'up', name: 'Upgrader', status: 'failed' },
    ]}
  />
</div>`),
  ex('Agent', 'Organism', 'PlanEditor', 'Reorder, edit, remove and add steps before anything runs. Alt+Up and Alt+Down move a step.', `
<PlanEditor
  agentName="Deploy Fixer"
  onStart={log}
  steps={[
    { id: '1', text: 'Read the deploy logs and find the first error' },
    { id: '2', text: 'Run the deploy test suite' },
    { id: '3', text: 'Install any missing dependency, asking first' },
    { id: '4', text: 'Redeploy to production automatically' },
  ]}
/>`),
  ex('Agent', 'Organism', 'QuestionCard', 'When the agent needs information rather than permission.', `
<div style={{ maxWidth: 520 }}>
  <QuestionCard
    agentName="Data Loader"
    question="Which staging database should I seed?"
    optionsLabel="Database"
    options={[
      { value: 'eu', label: 'staging-eu', description: 'Used by the web team. Last seeded 3 days ago.' },
      { value: 'us', label: 'staging-us', description: 'Being migrated this week.' },
    ]}
    timeoutNote="If no one answers in 30 minutes, Data Loader will pause, not guess."
    onAnswer={log}
    onDefer={log}
  />
</div>`),
  ex('Agent', 'Organism', 'KillSwitch', 'Hold for a second to stop the agent. Letting go early does nothing. Space or Enter held does the same.', `
<KillSwitch
  stopped={state.stopped}
  onStop={() => set.stopped(true)}
  onResume={() => set.stopped(false)}
  stoppedLabel="Deploy Fixer stopped"
  description="Stops Deploy Fixer after its current call. Press and hold for 1 second."
/>`, { stopped: false }),
  ex('Agent', 'Organism', 'CheckpointRewind', 'Pick a point to roll back to and see what it undoes before confirming.', `
<CheckpointRewind
  onRewind={log}
  checkpoints={[
    { id: 'now', label: 'After verifying the fix', time: '00:41' },
    { id: 'config', label: 'Config patched', description: 'You reviewed deploy/config.yaml', time: '00:27' },
    {
      id: 'dep',
      label: 'Dependency installed',
      description: 'After npm install zod@3',
      time: '00:18',
      undoes: {
        files: [{ path: 'deploy/config.yaml', added: 3, removed: 2 }],
        steps: ['Patch the deploy config', 'Verify the fix'],
        notes: ['Refund nothing: 7.6K tokens already used stay used'],
      },
    },
    { id: 'start', label: 'Start', description: 'Before the agent changed anything', time: '00:00' },
  ]}
/>`),
  ex('Agent', 'Organism', 'PermissionLedger', 'Everything you said "Always allow" to, how often it has been used, and a way to take it back.', `
<PermissionLedger
  permissions={state.permissions}
  summary="Example grants"
  onRevoke={revoke}
  onRestore={restore}
/>`, {
    permissions: [
      { id: 'p1', tool: 'read_file', agent: 'All agents', scope: 'This repository', granted: '2 weeks ago, by you', uses: 412 },
      { id: 'p2', tool: 'run_tests', agent: 'Deploy Fixer', scope: 'Any suite', granted: '5 days ago, by you', uses: 38 },
      { id: 'p3', tool: 'shell', agent: 'Docs Writer', scope: 'Read-only commands', granted: 'Yesterday, by you', uses: 0 },
      { id: 'p4', tool: 'git push', agent: 'Release Bot', scope: 'main', granted: '3 weeks ago', uses: 14, revoked: true },
    ],
  }),

  // ───────────── Template
  ex('Agent', 'Template', 'AgentRunLayout', 'The run screen. It takes organisms as slots, so your app decides what goes where.', `
<AgentRunLayout
  agentName="Deploy Fixer"
  goal="Fix the failing production deploy for the web service"
  status="waiting"
  budget={{ used: 9800, limit: 50000, unit: 'tokens' }}
  inboxCount={inbox.length}
  inbox={<NeedsYouInbox items={inbox} />}
  actions={<KillSwitch compact onStop={log} />}
  timeline={<RunTimeline steps={steps} />}
  detail={
    <ApprovalPrompt
      agentName="Deploy Fixer"
      action="npm install zod@3"
      target="web/package.json"
      risk="medium"
      reason="server/validate.ts imports zod, but it is missing from dependencies."
      autoFocus={false}
      headingLevel={2}
      onAllow={log}
      onDeny={log}
    />
  }
/>`),

  // ───────────── Agent molecules
  ex('Agent parts', 'Molecule', 'StatusBadge', 'A status with a running clock.', `
<div ${row}>
  <StatusBadge status="running" startedAt={secondsAgo(12)} />
  <StatusBadge status="waiting" label="Waiting for you" />
  <StatusBadge status="done" startedAt={secondsAgo(40)} endedAt={secondsAgo(31)} />
  <StatusBadge status="failed" />
</div>`),
  ex('Agent parts', 'Molecule', 'ToolCallHeader', 'Names a tool call and shows its state and attempt.', `
<ToolCallHeader tool="run_tests" status="success" attempt={2} startedAt={secondsAgo(9)} endedAt={secondsAgo(6)} />`),
  ex('Agent parts', 'Molecule', 'RiskLabel', 'How risky an action is, in words.', `
<div ${row}>
  <RiskLabel level="low" />
  <RiskLabel level="medium" />
  <RiskLabel level="high" />
</div>`),
  ex('Agent parts', 'Molecule', 'BudgetMeter', 'Spend against a limit. It warns at 80% and flags going over.', `
<div ${col(260)}>
  <BudgetMeter used={9800} limit={50000} unit="tokens" />
  <BudgetMeter used={42000} limit={50000} unit="tokens" />
  <BudgetMeter used={5.4} limit={5} unit="usd" />
</div>`),
  ex('Agent parts', 'Molecule', 'ConfidenceMeter', 'How sure the agent is: a range in words with reasons, never a percentage.', `
<div ${col(460)}>
  <ConfidenceMeter
    low="likely"
    high="very-likely"
    title="Fairly sure this fixes the deploy"
    agentName="Deploy Fixer"
    reasons={[
      'All 42 tests pass, including the one that failed in production.',
      "Not checked: the deploy itself, which runs on infrastructure I can't see.",
    ]}
  />
  <ConfidenceMeter variant="compact" low="unsure" />
</div>`),
  ex('Agent parts', 'Molecule', 'DiffLine', 'One line of a diff, with line numbers and screen-reader text.', `
<div>
  <DiffLine type="context" content="build:" oldNumber={12} newNumber={12} />
  <DiffLine type="remove" content="  node: 18" oldNumber={13} />
  <DiffLine type="add" content="  node: 22" newNumber={13} />
</div>`),
  ex('Agent parts', 'Molecule', 'KeyboardHint', 'A shortcut and what it does.', `
<div ${row}>
  <KeyboardHint keys={['A']} label="Allow once" />
  <KeyboardHint keys={['Shift', 'A']} label="Always allow" />
  <KeyboardHint keys={['D']} label="Deny" />
</div>`),

  // ───────────── Forms
  ex('Forms', 'Molecule', 'Field', 'A label, a control, and the hint or error that describes it, wired for screen readers.', `
<div ${col(360)}>
  <Field label="Agent name" hint="Shown in the run header and the inbox.">
    <Input defaultValue="Deploy Fixer" />
  </Field>
  <Field label="Branch" error="Branch names can't contain spaces. Try fix-deploy.">
    <Input defaultValue="fix deploy" />
  </Field>
</div>`),
  ex('Forms', 'Molecule', 'RadioGroup', 'One choice from a short list.', `
<RadioGroup
  legend="When the budget runs out"
  defaultValue="pause"
  onValueChange={log}
  options={[
    { value: 'pause', label: 'Pause and ask me' },
    { value: 'stop', label: 'Stop the run' },
    { value: 'continue', label: 'Keep going', description: 'Spending continues past the limit.' },
  ]}
/>`),
  ex('Forms', 'Molecule', 'Choicebox', 'Card-sized options for a choice that needs a sentence each.', `
<Choicebox
  legend="How much can Deploy Fixer do on its own?"
  defaultValue="risky"
  onValueChange={log}
  options={[
    { value: 'all', title: 'Ask for everything', description: 'Every tool call waits for you.' },
    { value: 'risky', title: 'Ask for risky actions', description: 'Reads run freely; writes ask first.' },
    { value: 'none', title: 'Run on its own', description: 'Only high-risk actions ask.' },
  ]}
/>`),
  ex('Forms', 'Molecule', 'ClearableInput', 'A text field with a clear button that puts focus back in the field.', `
<div style={{ maxWidth: 360 }}>
  <ClearableInput aria-label="Branch" defaultValue="fix/deploy-zod" clearLabel="Clear branch" onClear={log} />
</div>`),
  ex('Forms', 'Molecule', 'SearchInput', 'A search field with a shortcut hint, a spinner and a clear button.', `
<div ${col(360)}>
  <SearchInput aria-label="Search runs" placeholder="Search runs, agents, files" shortcut="⌘K" />
  <SearchInput aria-label="Search runs, loading" defaultValue="deploy" loading />
</div>`),
  ex('Forms', 'Molecule', 'Combobox', 'Type to filter and pick one. Arrow keys move, Enter picks, Escape closes.', `
<div style={{ maxWidth: 360, minHeight: 260 }}>
  <Combobox
    aria-label="Assign to agent"
    placeholder="Choose an agent"
    onValueChange={log}
    onCreate={log}
    options={[
      { value: 'df', label: 'Deploy Fixer', meta: 'idle' },
      { value: 'dl', label: 'Data Loader', meta: 'running' },
      { value: 'dw', label: 'Docs Writer', meta: 'idle' },
      { value: 'rb', label: 'Release Bot', meta: 'paused', disabled: true },
    ]}
  />
</div>`),
  ex('Forms', 'Molecule', 'MultiSelect', 'Pick several. Picks become chips; Backspace removes the last one.', `
<div style={{ maxWidth: 360, minHeight: 280 }}>
  <MultiSelect
    aria-label="Allowed tools"
    placeholder="Add a tool"
    defaultValue={['read_file', 'run_tests']}
    onValueChange={log}
    options={[
      { value: 'read_file', label: 'read_file' },
      { value: 'run_tests', label: 'run_tests' },
      { value: 'shell', label: 'shell' },
      { value: 'write_file', label: 'write_file' },
    ]}
  />
</div>`),
  ex('Forms', 'Molecule', 'Calendar', 'A day or a range. Arrow keys move by day, Page Up and Down by month.', `
<Calendar
  mode="range"
  today={day(2026, 10, 8)}
  defaultValue={{ start: day(2026, 10, 6), end: day(2026, 10, 10) }}
  locale="en-GB"
  onValueChange={log}
/>`),
  ex('Forms', 'Molecule', 'Slider', 'One value, a range, or steps, read out in words.', `
<div ${col(360)}>
  <Slider label="Token budget" defaultValue={[50000]} min={10000} max={200000} step={5000} formatValue={format.k} />
  <Slider label="Retry delay" defaultValue={[2, 30]} min={1} max={60} formatValue={format.seconds} thumbLabels={['Minimum retry delay', 'Maximum retry delay']} />
</div>`),
  ex('Forms', 'Molecule', 'ToggleGroup', 'A segmented control: pick one, or any.', `
<div ${col(360)}>
  <ToggleGroup type="single" defaultValue="unified" aria-label="Diff view" onValueChange={log}>
    <ToggleGroupItem value="unified">Unified</ToggleGroupItem>
    <ToggleGroupItem value="split">Split</ToggleGroupItem>
  </ToggleGroup>
</div>`),
  ex('Forms', 'Molecule', 'ThemeSwitcher', 'Light, dark or match the system. This one really switches this page.', `
<ThemeSwitcher onValueChange={log} />`),
  ex('Forms', 'Molecule', 'Feedback', 'Thumbs up or down, then an optional comment.', `
<div style={{ maxWidth: 420 }}>
  <Feedback question="Was this run useful?" onSubmit={log} />
</div>`),

  // ───────────── Actions
  ex('Actions', 'Molecule', 'SplitButton', 'The common action, with alternatives in a menu.', `
<SplitButton
  menuLabel="More ways to hand off"
  onClick={log}
  menu={
    <>
      <MenuItem description="For review before merging" onSelect={log}>Open pull request</MenuItem>
      <MenuItem description="Not ready for review yet" onSelect={log}>Open draft pull request</MenuItem>
      <MenuItem description="Nothing is pushed" onSelect={log}>Keep changes local</MenuItem>
    </>
  }
>
  Open pull request
</SplitButton>`),
  ex('Actions', 'Molecule', 'CopyButton', 'Copies text, shows a check for two seconds, and tells screen readers.', `
<CopyButton value="run_8f3a91c4b2e7d0a6c21d" label="Copy run ID" onCopy={log} />`),
  ex('Actions', 'Molecule', 'TextWithCopy', 'Text with a copy button beside it.', `
<div ${col(420)}>
  <TextWithCopy value="run_8f3a91c4b2e7d0a6c21d" label="Copy run ID">run_8f3a…c21d</TextWithCopy>
  <TextWithCopy variant="block" value="npm install @creance-ui/react @creance-ui/tokens" label="Copy install command" />
</div>`),
  ex('Actions', 'Molecule', 'LoadMoreButton', 'A full-width button under a list that says when it is loading.', `
<div ${col(360)}>
  <LoadMoreButton loading={state.loading} onClick={() => set.loading(true)}>Load 20 more runs</LoadMoreButton>
  <Button size="sm" variant="ghost" onClick={() => set.loading(false)}>Finish loading</Button>
</div>`, { loading: false }),
  ex('Actions', 'Molecule', 'ShowMore', 'Long content cut to a few lines, with a button to show the rest.', `
<div style={{ maxWidth: 460 }}>
  <ShowMore collapsedHeight={72} moreLabel="Show the full error">
    <Code block>{stackTrace}</Code>
  </ShowMore>
</div>`),

  // ───────────── Charts
  ex('Charts', 'Molecule', 'StatCard', 'One number, what it is, and how it moved.', `
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
  <StatCard label="Runs today" value="20" trend={{ direction: 'up', label: '4' }} note="vs yesterday" chart={<Sparkline variant="bars" width={84} height={34} label="Runs per day, last 7 days" values={[12, 18, 9, 22, 16, 5, 20]} />} />
  <StatCard label="Tokens today" value="184K" trend={{ direction: 'up', label: '12%' }} note="vs last week" />
  <StatCard label="Failed runs" value="3" trend={{ direction: 'up', label: '2', tone: 'bad' }} note="vs yesterday" />
</div>`),
  ex('Charts', 'Atom', 'Sparkline', 'A trend with no axes, for a table cell or a stat card.', `
<div ${row}>
  <Sparkline variant="area" width={160} height={40} label="Tokens per day, with fill" values={[42, 55, 48, 61, 73, 39, 28, 64, 82, 77, 91, 68, 45, 96]} />
  <Sparkline width={160} height={40} label="Tokens per day" values={[42, 55, 48, 61, 73, 39, 28, 64, 82, 77, 91, 68, 45, 96]} />
  <Sparkline variant="bars" width={160} height={40} label="Runs per day" values={[12, 18, 9, 22, 16, 5, 20, 14, 19, 23]} />
</div>`),
  ex('Charts', 'Molecule', 'LineChart', 'A trend over time. Point at it, or focus it and press the arrow keys.', `
<LineChart
  label="Tokens per day"
  axisLabel="Day"
  unit="K"
  labels={['28 Sep', '29 Sep', '30 Sep', '1 Oct', '2 Oct', '3 Oct', '4 Oct', '5 Oct', '6 Oct', '7 Oct', '8 Oct', '9 Oct', '10 Oct', '11 Oct']}
  series={[
    { name: 'This period', values: [42, 55, 48, 61, 73, 39, 28, 64, 82, 77, 91, 68, 45, 96] },
    { name: 'Previous period', values: [38, 44, 51, 47, 58, 35, 30, 52, 60, 66, 70, 62, 41, 74], style: 'dashed' },
  ]}
/>`),
  ex('Charts', 'Molecule', 'BarChart', 'Amounts across categories. More than one series stacks.', `
<div ${col(620)}>
  <BarChart label="Runs per day" axisLabel="Day" highlight={3} labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} series={[{ name: 'Runs', values: [12, 18, 9, 22, 16, 5, 8] }]} />
  <BarChart
    label="Runs per day, by outcome"
    axisLabel="Day"
    height={170}
    labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
    series={[
      { name: 'Completed', values: [11, 16, 9, 19, 15, 5, 7] },
      { name: 'Failed', values: [1, 2, 0, 3, 1, 0, 1], tone: 'danger' },
    ]}
  />
</div>`),
  ex('Charts', 'Molecule', 'DonutChart', 'Parts of a whole, with each slice\u2019s value and share in the legend.', `
<div style={{ maxWidth: 560 }}>
  <DonutChart
    label="Run outcomes"
    centerLabel="runs"
    data={[
      { label: 'Completed', value: 64 },
      { label: 'Waiting for you', value: 5 },
      { label: 'Stopped by you', value: 9 },
      { label: 'Failed', value: 7, tone: 'danger' },
    ]}
  />
</div>`),
  ex('Charts', 'Molecule', 'BarList', 'A ranking: a name, a bar and a value on every row.', `
<div style={{ maxWidth: 520 }}>
  <BarList
    label="Tokens by agent"
    unit="K"
    items={[
      { label: 'Deploy Fixer', value: 84 },
      { label: 'Docs Writer', value: 46 },
      { label: 'Data Loader', value: 31 },
      { label: 'Upgrader', value: 23 },
    ]}
  />
</div>`),

  // ───────────── Chat
  ex('Chat', 'Organism', 'Chat', 'A whole conversation with an agent: messages, suggestions and the input. Type something to try it.', `
<div className="cr-window" style={{ borderRadius: 22, overflow: 'hidden' }}>
  <Chat
    height={520}
    agentName="Deploy Fixer"
    avatar={<Avatar name="Deploy Fixer" kind="agent" size="sm" decorative />}
    messages={state.messages}
    status={state.status}
    onSend={agent.send}
    onStop={agent.stop}
    suggestions={['Why is the deploy failing?', 'What changed last?']}
    placeholder="Ask Deploy Fixer, or tell it what to do"
    empty="Ask anything about this deploy. The agent here is simulated."
  />
</div>`, { messages: [], status: 'ready' }),
  ex('Chat', 'Molecule', 'Message', 'One turn. Yours sit right in a tile; the agent\u2019s are plain text under its name.', `
<div ${col(620)}>
  <Message from="user">The production deploy for web is failing. Can you find out why?</Message>
  <Message from="assistant" name="Deploy Fixer" avatar={<Avatar name="Deploy Fixer" kind="agent" size="sm" decorative />} actions={<CopyButton value="zod is missing from web/package.json" label="Copy answer" />}>
    <p>The build fails because <Code>zod</Code> is missing from <Code>web/package.json</Code>.<Citation index={1} onClick={log} /></p>
  </Message>
  <Message from="assistant" name="Deploy Fixer" status="streaming">
    <p>Installing zod@3 and running the tests again</p>
  </Message>
  <Message from="assistant" name="Deploy Fixer" status="pending" />
</div>`),
  ex('Chat', 'Molecule', 'MessageList', 'A scrolling column that follows new messages until you scroll up.', `
<div style={{ height: 320 }}>
  <MessageList label="Conversation with Deploy Fixer">
    <Message from="user">Why is the deploy failing?</Message>
    <Message from="assistant" name="Deploy Fixer"><p>The build cannot find the zod package.</p></Message>
    <Message from="user">Which file needs it?</Message>
    <Message from="assistant" name="Deploy Fixer"><p>server/validate.ts imports it on line 3.</p></Message>
    <Message from="user">Add it and run the tests.</Message>
    <Message from="assistant" name="Deploy Fixer" status="streaming"><p>Installing zod@3</p></Message>
  </MessageList>
</div>`),
  ex('Chat', 'Molecule', 'PromptInput', 'Where you write to an agent. Enter sends; Send becomes Stop while it works.', `
<div ${col(620)}>
  <PromptInput
    label="Message Deploy Fixer"
    placeholder="Ask Deploy Fixer, or tell it what to do"
    onSubmit={log}
    onAttach={log}
    attachments={[{ id: 'log', name: 'deploy.log', detail: '48 KB' }]}
    onRemoveAttachment={log}
    tools={<ModelPicker models={[{ value: 'large', label: 'Large' }, { value: 'small', label: 'Small' }]} />}
  />
  <PromptInput label="Message Deploy Fixer, working" placeholder="Reply while it works, or stop it" status="working" onStop={log} hint="Deploy Fixer is working" />
</div>`),
  ex('Chat', 'Molecule', 'Reasoning', 'The agent\u2019s thinking, folded away behind how long it took.', `
<div ${col(560)}>
  <Reasoning seconds={8}>
    <p>The log stops at the build step with "Cannot find module zod". That is a missing dependency, not a code error.</p>
    <p>Check which file imports it, then compare with package.json.</p>
  </Reasoning>
  <Reasoning thinking defaultOpen>
    <p>Reading the deploy log.</p>
  </Reasoning>
</div>`),
  ex('Chat', 'Molecule', 'Sources', 'What an answer is based on, with numbered markers in the text.', `
<div ${col(560)}>
  <p style={{ margin: 0 }}>The import arrived after the last deploy that passed.<Citation index={2} onClick={log} label="Source 2, Commit a41c9e2" /></p>
  <Sources
    items={[
      { title: 'Build 482 log', detail: 'deploys/web/482', href: '#Sources' },
      { title: 'Commit a41c9e2', detail: 'acme/web · 2 days ago', href: '#Sources' },
    ]}
  />
</div>`),
  ex('Chat', 'Molecule', 'Suggestions', 'Starting points above the input. Choosing one sends it.', `
<Suggestions items={['Explain the failure', 'Show the diff', 'Retry the deploy']} onSelect={log} />`),
  ex('Chat', 'Molecule', 'ModelPicker', 'Chooses which model answers.', `
<ModelPicker
  onValueChange={log}
  defaultValue="medium"
  models={[
    { value: 'large', label: 'Large', description: 'Most capable, for hard problems' },
    { value: 'medium', label: 'Medium', description: 'Balanced, for everyday work' },
    { value: 'small', label: 'Small', description: 'Fastest, for quick answers' },
  ]}
/>`),

  // ───────────── Navigation
  ex('Navigation', 'Molecule', 'Tabs', 'A segmented control and its panels. Arrow keys move between tabs.', `
<Tabs defaultValue="timeline">
  <TabsList aria-label="Run views">
    <TabsTrigger value="timeline">Timeline</TabsTrigger>
    <TabsTrigger value="changes">Changes</TabsTrigger>
    <TabsTrigger value="permissions">Permissions</TabsTrigger>
  </TabsList>
  <TabsContent value="timeline">Three steps, one waiting for you.</TabsContent>
  <TabsContent value="changes">Two files changed.</TabsContent>
  <TabsContent value="permissions">Reads run freely; writes ask first.</TabsContent>
</Tabs>`),
  ex('Navigation', 'Molecule', 'Menu', 'Actions behind a button. Put destructive ones last, after a separator.', `
<Menu>
  <MenuTrigger asChild>
    <Button size="sm">Run options</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem shortcut={<Kbd>P</Kbd>} onSelect={log}>Pause run</MenuItem>
    <MenuItem onSelect={log}>Rewind to a checkpoint</MenuItem>
    <MenuSeparator />
    <MenuItem tone="danger" onSelect={log}>Stop agent</MenuItem>
  </MenuContent>
</Menu>`),
  ex('Navigation', 'Molecule', 'ContextMenu', 'Opens on right-click, long-press, or Shift+F10.', `
<ContextMenu>
  <ContextMenuTrigger asChild>
    <Card tabIndex={0} style={{ maxWidth: 320 }} aria-label="run_tests, attempt 2. Right-click for actions">
      <Code>run_tests</Code> attempt 2. Right-click me.
    </Card>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={log}>Show input and result</ContextMenuItem>
    <ContextMenuItem onSelect={log}>Copy call ID</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem onSelect={log}>Always allow run_tests</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`),
  ex('Navigation', 'Molecule', 'DotsMenu', 'A "…" button with secondary actions for one row.', `
<DotsMenu label="More actions for Docs Writer">
  <MenuItem onSelect={log}>Open run</MenuItem>
  <MenuItem onSelect={log}>Pause</MenuItem>
  <MenuSeparator />
  <MenuItem tone="danger" onSelect={log}>Stop agent</MenuItem>
</DotsMenu>`),
  ex('Navigation', 'Molecule', 'CommandMenu', 'Search everything and act from the keyboard. Press ⌘K or Ctrl+K to see it in use: the search on this site is a CommandMenu.', `
<>
  <Button onClick={() => set.open(true)}>Open command menu</Button>
  <CommandMenu
    open={state.open}
    onOpenChange={set.open}
    hotkey={false}
    commands={[
      { id: 'df', group: 'Agents', label: 'Deploy Fixer', meta: 'Open agent', onSelect: log },
      { id: 'r41', group: 'Runs', label: 'Fix the failing deploy', meta: 'Waiting for you', keywords: ['zod'], onSelect: log },
      { id: 'new', group: 'Actions', label: 'Start a new run', onSelect: log },
      { id: 'stop', group: 'Actions', label: 'Stop all running agents', tone: 'danger', onSelect: log },
    ]}
  />
</>`, { open: false }),
  ex('Navigation', 'Molecule', 'Navbar', 'The bar across the top. When it gets narrow, the links move into a menu.', `
<div ${col(900)}>
  <Navbar
    brand={<a href="#Navbar">Acme</a>}
    items={[
      { label: 'Overview', href: '#Navbar' },
      { label: 'Runs', href: '#Navbar', current: true },
      { label: 'Agents', href: '#Navbar' },
      { label: 'Inbox', href: '#Navbar', count: 5 },
    ]}
    actions={<Button size="sm">Sign in</Button>}
  />
  <div style={{ maxWidth: 360 }}>
    <Navbar
      label="Main, narrow"
      brand={<a href="#Navbar">Acme</a>}
      items={[{ label: 'Overview', href: '#Navbar' }, { label: 'Runs', href: '#Navbar', current: true }, { label: 'Inbox', href: '#Navbar', count: 5 }]}
    />
  </div>
</div>`),
  ex('Navigation', 'Molecule', 'Sidebar', 'Links down the side, in groups. Collapses to icons that keep their names.', `
<div style={{ height: 420, display: 'flex' }}>
  <Sidebar
    variant="card"
    label="Workspace"
    collapsible
    onCollapsedChange={log}
    groups={[
      { items: [
        { label: 'Overview', href: '#Sidebar', icon: icons.home },
        { label: 'Runs', href: '#Sidebar', icon: icons.runs, current: true },
        { label: 'Agents', href: '#Sidebar', icon: icons.agents },
        { label: 'Inbox', href: '#Sidebar', icon: icons.inbox, count: 5 },
      ] },
      { title: 'Manage', items: [{ label: 'Settings', href: '#Sidebar', icon: icons.settings }] },
    ]}
    footer={(s) => <Avatar name="Sam Rivera" decorative />}
  />
</div>`),
  ex('Navigation', 'Molecule', 'Steps', 'Where someone is in a fixed sequence. Each status has a shape and a spoken label.', `
<div ${col(720)}>
  <Steps
    label="Set up"
    current={2}
    steps={[
      { title: 'Connect a repository', description: 'acme/web' },
      { title: 'Choose an agent', description: 'Deploy Fixer' },
      { title: 'Set permissions', description: 'Step 3 of 4' },
      { title: 'Review and start', description: 'Not started' },
    ]}
  />
</div>`),
  ex('Navigation', 'Molecule', 'Footer', 'The end of a page: brand, groups of links, and a line for copyright.', `
<Footer
  brand={<a href="#Footer">Acme</a>}
  description="Agents that ask before they act, and hand back when they are done."
  columns={[
    { title: 'Product', links: [{ label: 'Runs', href: '#Footer' }, { label: 'Agents', href: '#Footer' }] },
    { title: 'Developers', links: [{ label: 'Docs', href: '#Footer' }, { label: 'Changelog', href: '#Footer' }] },
  ]}
  legal="© 2026 Acme. MIT licence."
  links={[{ label: 'GitHub', href: '#Footer' }, { label: 'npm', href: '#Footer' }]}
/>`),
  ex('Navigation', 'Template', 'AppShell', 'The frame of an app: sidebar, header, content and an optional aside.', `
<div className="cr-window" style={{ borderRadius: 22, overflow: 'hidden' }}>
<AppShell
  height={460}
  sidebar={
    <Sidebar
      label="Workspace"
      groups={[{ items: [
        { label: 'Overview', href: '#AppShell', icon: icons.home },
        { label: 'Runs', href: '#AppShell', icon: icons.runs, current: true },
        { label: 'Inbox', href: '#AppShell', icon: icons.inbox, count: 5 },
      ] }]}
    />
  }
  header={<Breadcrumbs items={[{ label: 'Acme', href: '#AppShell' }, { label: 'Runs', href: '#AppShell' }]} />}
  aside={<p style={{ margin: 0 }}>Three runs are waiting for you.</p>}
  asideLabel="Needs you"
>
  <h2 style={{ margin: 0 }}>Runs</h2>
  <p>Everything your agents are doing, newest first.</p>
</AppShell>
</div>`),
  ex('Navigation', 'Molecule', 'Breadcrumbs', 'Where you are. Long trails fold the middle.', `
<Breadcrumbs
  maxItems={4}
  items={[
    { label: 'Acme', href: '#components' },
    { label: 'Agents', href: '#components' },
    { label: 'Deploy Fixer', href: '#components' },
    { label: 'Run 41', href: '#components' },
    { label: 'Tool call run_tests', href: '#components' },
  ]}
/>`),
  ex('Navigation', 'Molecule', 'Pagination', 'Page numbers, or a compact previous and next.', `
<div ${col(520)}>
  <Pagination page={state.page} pageCount={12} onPageChange={set.page} label="Runs pages" />
  <Pagination variant="compact" page={state.page} pageCount={12} onPageChange={set.page} label="Runs pages, compact" />
</div>`, { page: 3 }),
  ex('Navigation', 'Molecule', 'Scroller', 'A horizontal strip that fades where there is more.', `
<div style={{ maxWidth: 520 }}>
  <Scroller label="Recent runs">
    <Card style={{ width: 190 }}><strong>Run 41</strong>Fix the failing deploy</Card>
    <Card style={{ width: 190 }}><strong>Run 40</strong>Upgrade react-router</Card>
    <Card style={{ width: 190 }}><strong>Run 39</strong>Seed staging</Card>
    <Card style={{ width: 190 }}><strong>Run 38</strong>Write onboarding docs</Card>
  </Scroller>
</div>`),
  ex('Navigation', 'Molecule', 'Collapse', 'Sections that open and close.', `
<Collapse type="multiple" defaultValue={['auto']}>
  <CollapseItem value="auto" title="What can Deploy Fixer do on its own?">
    Read files and logs and run tests without asking. Anything that installs or touches production waits for you.
  </CollapseItem>
  <CollapseItem value="tokens" title="How are tokens counted?">
    Input and output tokens both count toward the run's budget.
  </CollapseItem>
</Collapse>`),

  // ───────────── Overlays
  ex('Overlays', 'Molecule', 'Dialog', 'A question over a dimmed page. It traps focus and returns it when closed.', `
<Dialog>
  <DialogTrigger asChild>
    <Button variant="danger">Stop agent</Button>
  </DialogTrigger>
  <DialogContent
    title="Stop Deploy Fixer?"
    description="The agent stops after its current tool call. Changes it already made stay."
    actions={
      <>
        <DialogClose asChild><Button>Keep running</Button></DialogClose>
        <DialogClose asChild><Button variant="danger" onClick={log}>Stop agent</Button></DialogClose>
      </>
    }
  />
</Dialog>`),
  ex('Overlays', 'Molecule', 'Sheet', 'A panel that slides in from an edge.', `
<Sheet>
  <SheetTrigger asChild>
    <Button>Show tool call details</Button>
  </SheetTrigger>
  <SheetContent side="right" title="Tool call details" actions={<SheetClose asChild><Button>Done</Button></SheetClose>}>
    <Description
      items={[
        { term: 'Tool', details: 'run_tests' },
        { term: 'Status', details: 'Succeeded on attempt 2' },
        { term: 'Duration', details: '2.6s' },
      ]}
    />
  </SheetContent>
</Sheet>`),
  ex('Overlays', 'Molecule', 'DestructiveActionModal', 'For actions that cannot be undone. The red button stays off until the name is typed.', `
<DestructiveActionModal
  trigger={<Button variant="danger">Delete agent</Button>}
  title="Delete Deploy Fixer?"
  description="This deletes the agent, its runs and its permission rules. This can't be undone."
  confirmLabel="Delete agent"
  confirmText="deploy-fixer"
  onConfirm={log}
/>`),
  ex('Overlays', 'Molecule', 'ContextCard', 'A preview on hover or keyboard focus. Focus never moves into it.', `
<p>
  <ContextCard
    content={
      <>
        <strong>Deploy Fixer</strong>
        <span>Fixes failing deploys in web</span>
        <StatusDot status="waiting" />
      </>
    }
  >
    <a href="#components">Deploy Fixer</a>
  </ContextCard>
  {' '}asked for approval.
</p>`),
  ex('Overlays', 'Molecule', 'RelativeTimeCard', '"2 hours ago", with the exact local and UTC time on hover or focus.', `
<p>
  Run 40 failed <RelativeTimeCard date={hoursAgo(2)} />.
</p>`),
  ex('Overlays', 'Molecule', 'Toast', 'A short message that rises from the bottom. Call toast() from anywhere.', `
<>
  <Button onClick={() => toast({ title: 'Allowed npm install zod@3 once', tone: 'success', action: { label: 'Undo', onClick: log } })}>
    Show a toast
  </Button>
  <Toaster />
</>`),

  // ───────────── Data
  ex('Data', 'Molecule', 'Table', 'Sortable columns, row selection with Shift-click ranges, and bulk actions.', `
<Table
  caption="Recent runs"
  rows={runs}
  rowKey={(r) => r.id}
  rowLabel={(r) => r.title}
  selectable
  defaultSort={{ key: 'tokens', direction: 'descending' }}
  bulkActions={() => <Button size="sm" onClick={log}>Archive</Button>}
  columns={[
    { key: 'title', header: 'Run', rowHeader: true, cell: (r) => r.title, sortValue: (r) => r.title },
    { key: 'agent', header: 'Agent', cell: (r) => r.agent },
    { key: 'status', header: 'Status', cell: (r) => <StatusDot status={r.status} /> },
    { key: 'tokens', header: 'Tokens', align: 'end', cell: (r) => r.tokens, sortValue: (r) => r.tokens },
  ]}
/>`),
  ex('Data', 'Molecule', 'FileTree', 'Files and folders with change markers. Arrow keys walk the tree.', `
<div style={{ maxWidth: 380 }}>
  <FileTree
    label="Changed files"
    defaultExpanded={['web', 'server']}
    onSelect={log}
    nodes={[
      {
        id: 'web',
        name: 'web',
        children: [
          { id: 'server', name: 'server', children: [{ id: 'validate', name: 'validate.ts', status: 'M' }] },
          { id: 'pkg', name: 'package.json', status: 'M' },
          { id: 'deploy', name: 'deploy.config.ts', status: 'A' },
        ],
      },
    ]}
  />
</div>`),
  ex('Data', 'Molecule', 'JsonView', 'JSON as a tree you can fold.', `
<div style={{ maxWidth: 460 }}>
  <JsonView
    label="Tool result"
    expandDepth={1}
    value={{ tool: 'run_tests', attempt: 2, ok: true, input: { suite: 'web', filter: 'deploy' }, output: ['212 passed', '0 failed'] }}
  />
</div>`),
  ex('Data', 'Molecule', 'Snippet', 'Shell commands with a copy button. The prompt sign is never copied.', `
<div ${col(460)}>
  <Snippet commands="pnpm add @creance-ui/react @creance-ui/tokens" />
  <Snippet tone="light" commands={['pnpm install', 'pnpm build']} />
</div>`),
  ex('Data', 'Molecule', 'Entity', 'An agent or a person as a row.', `
<div ${col(420)}>
  <Entity name="Deploy Fixer" description="Asks for risky actions" actions={<Button size="sm" onClick={log}>Open</Button>} />
  <Entity name="Sam Rivera" kind="human" description="Approver" />
</div>`),
  ex('Data', 'Molecule', 'Description', 'Terms and their values.', `
<Description
  items={[
    { term: 'Goal', details: 'Fix the failing production deploy' },
    { term: 'Budget', details: '50K tokens' },
    { term: 'Started by', details: 'You, from the inbox' },
  ]}
/>`),
  ex('Data', 'Molecule', 'EmptyState', 'An empty list as an invitation to act.', `
<EmptyState
  title="No runs yet"
  description="Runs appear here when an agent starts work. Give Deploy Fixer a goal to start the first one."
  action={<Button variant="primary" onClick={log}>Start a run</Button>}
/>`),
  ex('Data', 'Molecule', 'Card', 'A glass tile for grouping related content.', `
<div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
  <Card>
    <span>Waiting on you</span>
    <strong style={{ fontSize: 30 }}>5</strong>
  </Card>
  <Card>
    <strong>Deploy Fixer</strong>
    <span>Asks for risky actions</span>
  </Card>
</div>`),

  // ───────────── Feedback and media
  ex('Feedback and media', 'Molecule', 'Alert', 'A message in the page: what happened and what to do.', `
<div ${col(480)}>
  <Alert title="Budget at 84%">Deploy Fixer has used 42K of 50K tokens.</Alert>
  <Alert title="The run failed" tone="danger">Migration 042 failed: column "region" already exists.</Alert>
</div>`),
  ex('Feedback and media', 'Molecule', 'Banner', 'A full-width notice in three tones.', `
<div ${col(620)}>
  <Banner onDismiss={log}>Scheduled maintenance on Sunday, 02:00 to 03:00 UTC.</Banner>
  <Banner tone="ink" action={<a href="#components">Open inbox</a>}>3 agents are waiting for you.</Banner>
  <Banner tone="danger">The model provider is returning errors. New runs are paused.</Banner>
</div>`),
  ex('Feedback and media', 'Molecule', 'ProjectBanner', 'A project-wide notice with one action.', `
<ProjectBanner
  name="web"
  message="This project's token budget is 92% used for October."
  progress={{ value: 92, max: 100, label: 'web token budget, 92% used' }}
  action={<Button onClick={log}>Raise budget</Button>}
/>`),
  ex('Feedback and media', 'Molecule', 'ErrorCard', 'A failure that needs a decision: what broke, the error, and what you can do.', `
<div style={{ maxWidth: 520 }}>
  <ErrorCard
    title="Run 40 failed at step 3"
    description="run_tests failed 3 times: 14 tests broke after the react-router upgrade."
    details="TypeError: useHistory is not a function"
    actions={
      <>
        <Button variant="primary" onClick={log}>Retry from step 3</Button>
        <Button onClick={log}>View logs</Button>
      </>
    }
  />
</div>`),
  ex('Feedback and media', 'Molecule', 'BrowserFrame', 'A browser window drawn around a preview.', `
<div style={{ maxWidth: 520 }}>
  <BrowserFrame url="preview-run-41.example.dev" caption="The preview deploy Deploy Fixer opened">
    <div style={{ display: 'grid', gap: 12, padding: 24 }}>
      <Skeleton width="40%" height={20} />
      <Skeleton width="70%" />
      <Skeleton shape="block" />
    </div>
  </BrowserFrame>
</div>`),
  ex('Feedback and media', 'Molecule', 'PhoneFrame', 'A phone drawn around content, to show a component at phone size.', `
<PhoneFrame width={250} caption="A question at phone size">
  <QuestionCard agentName="Data Loader" question="Seed staging-eu?" options={[{ value: 'y', label: 'Yes' }, { value: 'n', label: 'No' }]} allowOther={false} onAnswer={log} />
</PhoneFrame>`),
  ex('Feedback and media', 'Molecule', 'Video', 'A player with glass controls. It starts muted and never autoplays.', `
<div style={{ maxWidth: 560 }}>
  <Video label="Run 41 recording" src={emptyVideo} poster={poster} caption="No recording is loaded in this example." />
</div>`),

  // ───────────── Atoms
  ex('Atoms', 'Atom', 'Button', 'A glass capsule. Blue is for the one primary action; red text marks refusal.', `
<div ${row}>
  <Button variant="primary" onClick={log}>Allow once</Button>
  <Button onClick={log}>Always allow</Button>
  <Button variant="danger">Deny</Button>
  <Button variant="ghost">Cancel</Button>
  <Button size="sm">Small</Button>
  <Button disabled>Disabled</Button>
</div>`),
  ex('Atoms', 'Atom', 'IconButton', 'A button with only an icon. Its label is required and shows as a tooltip.', `
<div ${row}>
  <IconButton label="Retry tool call" icon="↻" onClick={log} />
  <IconButton label="Close" icon="✕" size="sm" />
</div>`),
  ex('Atoms', 'Atom', 'Toggle', 'A button that stays on or off.', `
<div ${row}>
  <Toggle defaultPressed onPressedChange={log}>Wrap lines</Toggle>
  <Toggle onPressedChange={log}>Show whitespace</Toggle>
</div>`),
  ex('Atoms', 'Atom', 'Badge', 'A status as tone, icon and word.', `
<div ${row}>
  <Badge status="running" />
  <Badge status="waiting" />
  <Badge status="blocked" />
  <Badge status="done" />
  <Badge status="failed" />
</div>`),
  ex('Atoms', 'Atom', 'StatusDot', 'A small mark and a word. Each status has its own shape as well as tone.', `
<div ${row}>
  <StatusDot status="running" />
  <StatusDot status="waiting" />
  <StatusDot status="done" />
  <StatusDot status="failed" />
  <StatusDot status="queued" />
</div>`),
  ex('Atoms', 'Atom', 'Spinner', 'Something is happening, with no known end.', `
<div ${row}>
  <Spinner label="Loading runs" />
  <Spinner size="sm" />
</div>`),
  ex('Atoms', 'Atom', 'LoadingDots', 'Three dots beside what is happening.', `
<div ${col(360)}>
  <LoadingDots>Deploy Fixer is thinking</LoadingDots>
  <LoadingDots tone="muted">Waiting for the registry</LoadingDots>
</div>`),
  ex('Atoms', 'Atom', 'Skeleton', 'A placeholder while content loads.', `
<div ${col(320)}>
  <Skeleton shape="circle" />
  <Skeleton width="80%" />
  <Skeleton width="55%" />
  <Skeleton shape="block" />
</div>`),
  ex('Atoms', 'Atom', 'Kbd', 'A keyboard key.', `
<span><Kbd>⌘</Kbd> <Kbd>K</Kbd></span>`),
  ex('Atoms', 'Atom', 'Code', 'Inline code, or a scrollable block.', `
<div ${col(420)}>
  <span>Run <Code>npm install zod@3</Code> first.</span>
  <Code block>{'{ "suite": "web", "filter": "deploy" }'}</Code>
</div>`),
  ex('Atoms', 'Atom', 'ProgressBar', 'Progress toward a known total.', `
<div ${col(320)}>
  <ProgressBar label="Token budget" value={20} max={100} />
  <ProgressBar label="Token budget, near the limit" value={86} max={100} tone="warning" />
  <ProgressBar label="Token budget, over" value={100} max={100} tone="danger" />
</div>`),
  ex('Atoms', 'Atom', 'Gauge', 'A ring that fills to a percentage. Red only past a limit you set.', `
<div ${row}>
  <Gauge label="Token budget used" value={20} />
  <Gauge label="Error rate" value={86} limit={50} />
</div>`),
  ex('Atoms', 'Atom', 'Avatar', 'Agents are rounded squares; people are circles.', `
<div ${row}>
  <Avatar name="Deploy Fixer" kind="agent" />
  <Avatar name="Sam Rivera" kind="human" />
  <Avatar name="Data Loader" kind="agent" size="sm" />
</div>`),
  ex('Atoms', 'Atom', 'Tooltip', 'Extra text on hover and keyboard focus.', `
<Tooltip content="Stops after the current tool call">
  <Button>Hover or focus me</Button>
</Tooltip>`),
  ex('Atoms', 'Atom', 'Input', 'A text field.', `
<div ${col(320)}>
  <Input aria-label="Agent name" defaultValue="Deploy Fixer" />
  <Input aria-label="Search runs" placeholder="Search runs" />
  <Input aria-label="Branch" defaultValue="main main" aria-invalid />
  <Input aria-label="Workspace" defaultValue="acme/web" disabled />
</div>`),
  ex('Atoms', 'Atom', 'Textarea', 'A multi-line text field.', `
<div style={{ maxWidth: 360 }}>
  <Textarea aria-label="Answer for Data Loader" defaultValue="Seed staging-eu. staging-us is being migrated this week." />
</div>`),
  ex('Atoms', 'Atom', 'Select', 'The native select, styled. The operating system draws the menu.', `
<div style={{ maxWidth: 240 }}>
  <Select aria-label="Run speed" defaultValue="1">
    <option value="1">Normal</option>
    <option value="2">2×</option>
    <option value="4">4×</option>
  </Select>
</div>`),
  ex('Atoms', 'Atom', 'Checkbox', 'A native checkbox with its label.', `
<div ${col(360)}>
  <Checkbox label="Run tests after every change" defaultChecked />
  <Checkbox label="Open a pull request when done" description="As a draft until the checks pass." />
  <Checkbox label="Deploy automatically" disabled />
</div>`),
  ex('Atoms', 'Atom', 'Radio', 'A native radio with its label.', `
<div ${col(360)}>
  <Radio name="when" label="Pause and ask me" defaultChecked />
  <Radio name="when" label="Stop the run" />
</div>`),
  ex('Atoms', 'Atom', 'Switch', 'An on/off setting that applies immediately.', `
<div ${col(360)}>
  <Switch label="Ask before shell commands" defaultChecked />
  <Switch label="Always allow file reads" />
</div>`),
  ex('Atoms', 'Atom', 'Separator', 'A hairline between groups.', `
<div ${col(320)}>
  <span>Above</span>
  <Separator />
  <span>Below</span>
</div>`),
  ex('Atoms', 'Atom', 'MiddleTruncate', 'Shortens the middle of a path or ID and keeps both ends.', `
<div ${col(420)}>
  <MiddleTruncate text="web/server/routes/api/v2/deployments/validate-config.ts" />
  <MiddleTruncate text="run_8f3a91c4b2e7d0a6c21d" start={8} end={4} />
</div>`),
  ex('Atoms', 'Atom', 'ErrorMessage', 'What went wrong and what to do next.', `
<ErrorMessage>Couldn't save the plan. Check your connection and try again.</ErrorMessage>`),
];

/** Sidebar sections, basics first and the agent-specific set last. */
export const groups = Object.keys(categories);
const groupOf = new Map(Object.entries(categories as Record<string, string[]>).flatMap(([g, names]) => names.map((n) => [n, g] as const)));
/** Every example in sidebar order: by section, then A to Z. */
export const examples: Example[] = all
  .map((e) => ({ ...e, group: groupOf.get(e.name) ?? e.group, more: more[e.name] }))
  .sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group) || a.name.localeCompare(b.name));
