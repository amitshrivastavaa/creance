// A server component: no "use client" here. Everything on this page is rendered on the server
// first. Components that are not client modules run only on the server; the rest hydrate.
import {
  AgentHandoffBanner,
  AgentRunLayout,
  AppShell,
  Alert,
  ApprovalPrompt,
  Avatar,
  Badge,
  Banner,
  BarChart,
  BarList,
  Breadcrumbs,
  BrowserFrame,
  BudgetMeter,
  Button,
  Calendar,
  Card,
  Chat,
  Checkbox,
  Citation,
  Choicebox,
  ClearableInput,
  Code,
  Collapse,
  CollapseItem,
  Combobox,
  ConfidenceMeter,
  ContextCard,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  CopyButton,
  Description,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  DiffLine,
  DiffReview,
  DotsMenu,
  EmptyState,
  DonutChart,
  Entity,
  ErrorCard,
  ErrorMessage,
  Field,
  FileTree,
  FleetSky,
  Footer,
  Gauge,
  IconButton,
  Input,
  JsonView,
  Kbd,
  KeyboardHint,
  LoadMoreButton,
  LoadingDots,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  MiddleTruncate,
  LineChart,
  Message,
  MessageList,
  ModelPicker,
  MultiSelect,
  Navbar,
  NeedsYouInbox,
  PhoneFrame,
  ProgressBar,
  ProjectBanner,
  PromptInput,
  Radio,
  RadioGroup,
  Reasoning,
  RelativeTimeCard,
  RiskLabel,
  RunTimeline,
  Scroller,
  SearchInput,
  Select,
  Separator,
  Sheet,
  SheetContent,
  SheetTrigger,
  ShowMore,
  Sidebar,
  Skeleton,
  Slider,
  Snippet,
  Sources,
  Sparkline,
  Spinner,
  SplitButton,
  StatCard,
  StatusBadge,
  Suggestions,
  StatusDot,
  Steps,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextWithCopy,
  Textarea,
  ThemeSwitcher,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  ToolCallCard,
  ToolCallHeader,
  Tooltip,
  Video,
  initialRunState,
  reduceRun,
  timelineSteps,
} from '@creance-ui/react';
import { deployFix, scenarioEvents } from '@creance-ui/react/simulator';
import Link from 'next/link';
import { Cell } from './Cell';

// The run is reduced on the server: the event model has no client-only code.
const run = scenarioEvents(deployFix).reduce(reduceRun, initialRunState);
const steps = timelineSteps(run);
const diff = run.diffs[0];
const agents = [
  { value: 'df', label: 'Deploy Fixer' },
  { value: 'dl', label: 'Data Loader' },
];
const NOW = Date.UTC(2026, 9, 8, 12);

export default function Page() {
  return (
    <main>
      <header>
        <h1>Creance in Next.js</h1>
        <p>
          This page is a server component. <Link href="/client">The client page</Link> holds the components that take callback functions.
        </p>
      </header>

      <h2>Rendered on the server only</h2>
      <div className="grid" id="server-only">
        <Cell name="Button">
          <form>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </form>
        </Cell>
        <Cell name="IconButton">
          <IconButton label="Retry tool call" icon="↻" />
        </Cell>
        <Cell name="Badge">
          <Badge status="running" />
        </Cell>
        <Cell name="StatusDot">
          <StatusDot status="waiting" />
        </Cell>
        <Cell name="Avatar">
          <Avatar name="Deploy Fixer" kind="agent" />
        </Cell>
        <Cell name="Spinner">
          <Spinner label="Loading runs" />
        </Cell>
        <Cell name="LoadingDots">
          <LoadingDots>Deploy Fixer is thinking</LoadingDots>
        </Cell>
        <Cell name="Skeleton">
          <Skeleton width="60%" />
        </Cell>
        <Cell name="Kbd">
          <Kbd>K</Kbd>
        </Cell>
        <Cell name="Code">
          <Code>npm install zod@3</Code>
        </Cell>
        <Cell name="ProgressBar">
          <ProgressBar label="Token budget" value={20} />
        </Cell>
        <Cell name="Gauge">
          <Gauge label="Token budget used" value={20} />
        </Cell>
        <Cell name="Input">
          <Input aria-label="Agent name" defaultValue="Deploy Fixer" />
        </Cell>
        <Cell name="Textarea">
          <Textarea aria-label="Answer" defaultValue="Seed staging-eu." rows={2} />
        </Cell>
        <Cell name="Select">
          <Select aria-label="Run speed" defaultValue="1">
            <option value="1">Normal</option>
            <option value="2">2×</option>
          </Select>
        </Cell>
        <Cell name="Checkbox">
          <Checkbox label="Run tests after every change" defaultChecked />
        </Cell>
        <Cell name="Radio">
          <Radio name="when" label="Pause and ask me" defaultChecked />
        </Cell>
        <Cell name="Switch">
          <Switch label="Ask before shell commands" defaultChecked />
        </Cell>
        <Cell name="Separator">
          <Separator />
        </Cell>
        <Cell name="MiddleTruncate">
          <MiddleTruncate text="web/server/routes/api/v2/deployments/validate-config.ts" />
        </Cell>
        <Cell name="ErrorMessage">
          <ErrorMessage>Couldn&apos;t save the plan. Try again.</ErrorMessage>
        </Cell>
        <Cell name="Field">
          <Field label="Branch" hint="Lowercase, no spaces.">
            <Input defaultValue="fix-deploy" />
          </Field>
        </Cell>
        <Cell name="SearchInput">
          <SearchInput aria-label="Search runs" placeholder="Search runs" shortcut="⌘K" />
        </Cell>
        <Cell name="SplitButton">
          <SplitButton menuLabel="More ways to hand off" menu={<MenuItem>Open draft pull request</MenuItem>}>
            Open pull request
          </SplitButton>
        </Cell>
        <Cell name="DotsMenu">
          <DotsMenu label="More actions for Docs Writer">
            <MenuItem>Open run</MenuItem>
          </DotsMenu>
        </Cell>
        <Cell name="TextWithCopy">
          <TextWithCopy value="run_8f3a91c4b2e7d0a6c21d" label="Copy run ID" />
        </Cell>
        <Cell name="Snippet">
          <Snippet commands="pnpm add @creance-ui/react" />
        </Cell>
        <Cell name="Entity">
          <Entity name="Deploy Fixer" description="Asks for risky actions" />
        </Cell>
        <Cell name="Description">
          <Description items={[{ term: 'Budget', details: '50K tokens' }]} />
        </Cell>
        <Cell name="EmptyState">
          <EmptyState title="No runs yet" description="Runs appear here when an agent starts work." headingLevel={3} />
        </Cell>
        <Cell name="Card">
          <Card>Waiting on you: 5</Card>
        </Cell>
        <Cell name="Alert">
          <Alert title="Budget at 84%">42K of 50K tokens used.</Alert>
        </Cell>
        <Cell name="ProjectBanner">
          <ProjectBanner name="web" message="92% of October's budget used." progress={{ value: 92, max: 100, label: 'web token budget' }} />
        </Cell>
        <Cell name="ErrorCard">
          <ErrorCard title="Run 40 failed at step 3" details="TypeError: useHistory is not a function" headingLevel={3} />
        </Cell>
        <Cell name="BrowserFrame">
          <BrowserFrame url="preview.example.dev" caption="The preview deploy">
            <p style={{ padding: 16, margin: 0 }}>Preview</p>
          </BrowserFrame>
        </Cell>
        <Cell name="PhoneFrame">
          <PhoneFrame width={160} caption="At phone size">
            <Badge status="waiting" />
          </PhoneFrame>
        </Cell>
        <Cell name="ToolCallHeader">
          <ToolCallHeader tool="run_tests" status="success" attempt={2} headingLevel={4} />
        </Cell>
        <Cell name="RiskLabel">
          <RiskLabel level="medium" />
        </Cell>
        <Cell name="BudgetMeter">
          <BudgetMeter used={9800} limit={50000} unit="tokens" />
        </Cell>
        <Cell name="ConfidenceMeter">
          <ConfidenceMeter variant="compact" low="likely" high="very-likely" />
        </Cell>
        <Cell name="DiffLine">
          <DiffLine type="add" content="  node: 22" newNumber={13} />
        </Cell>
        <Cell name="KeyboardHint">
          <KeyboardHint keys={['A']} label="Allow once" />
        </Cell>
      </div>

      <h2>Client components, used from this server page</h2>
      <div className="grid" id="hydrated">
        <Cell name="Toggle">
          <Toggle>Wrap lines</Toggle>
        </Cell>
        <Cell name="ToggleGroup">
          <ToggleGroup type="single" defaultValue="unified" aria-label="Diff view">
            <ToggleGroupItem value="unified">Unified</ToggleGroupItem>
            <ToggleGroupItem value="split">Split</ToggleGroupItem>
          </ToggleGroup>
        </Cell>
        <Cell name="Tooltip">
          <Tooltip content="Stops after the current call">
            <Button>Hover or focus</Button>
          </Tooltip>
        </Cell>
        <Cell name="Tabs">
          <Tabs defaultValue="timeline">
            <TabsList aria-label="Run views">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="changes">Changes</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline">Three steps.</TabsContent>
            <TabsContent value="changes">Two files changed.</TabsContent>
          </Tabs>
        </Cell>
        <Cell name="Menu">
          <Menu>
            <MenuTrigger asChild>
              <Button size="sm">Run options</Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Pause run</MenuItem>
            </MenuContent>
          </Menu>
        </Cell>
        <Cell name="ContextMenu">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <Card tabIndex={0}>Right-click me</Card>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Copy call ID</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Cell>
        <Cell name="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Stop agent</Button>
            </DialogTrigger>
            <DialogContent
              title="Stop Deploy Fixer?"
              description="The agent stops after its current tool call."
              actions={
                <DialogClose asChild>
                  <Button>Keep running</Button>
                </DialogClose>
              }
            />
          </Dialog>
        </Cell>
        <Cell name="Sheet">
          <Sheet>
            <SheetTrigger asChild>
              <Button>Show details</Button>
            </SheetTrigger>
            <SheetContent title="Tool call details">run_tests succeeded on attempt 2.</SheetContent>
          </Sheet>
        </Cell>
        <Cell name="ContextCard">
          <ContextCard content={<strong>Deploy Fixer</strong>}>
            <a href="#hydrated">Deploy Fixer</a>
          </ContextCard>
        </Cell>
        <Cell name="RelativeTimeCard">
          <RelativeTimeCard date={new Date(NOW - 2 * 3_600_000)} now={new Date(NOW)} locale="en-GB" />
        </Cell>
        <Cell name="Collapse">
          <Collapse type="multiple" defaultValue={['a']}>
            <CollapseItem value="a" title="How are tokens counted?" headingLevel={4}>
              Input and output tokens both count.
            </CollapseItem>
          </Collapse>
        </Cell>
        <Cell name="StatCard">
          <StatCard label="Runs today" value="20" trend={{ direction: 'up', label: '4' }} note="vs yesterday" chart={<Sparkline label="Runs, last 5 days" values={[3, 5, 4, 8, 6]} width={80} />} />
        </Cell>
        <Cell name="Sparkline">
          <Sparkline variant="area" label="Tokens per day" values={[42, 55, 48, 61, 73]} />
        </Cell>
        <Cell name="LineChart" wide>
          <LineChart label="Tokens per day" height={160} labels={['Mon', 'Tue', 'Wed']} series={[{ name: 'Tokens', values: [42, 55, 48] }]} />
        </Cell>
        <Cell name="BarChart" wide>
          <BarChart label="Runs per day" height={140} labels={['Mon', 'Tue', 'Wed']} series={[{ name: 'Runs', values: [12, 18, 9] }]} />
        </Cell>
        <Cell name="DonutChart" wide>
          <DonutChart label="Run outcomes" size={120} data={[{ label: 'Completed', value: 64 }, { label: 'Failed', value: 7, tone: 'danger' }]} />
        </Cell>
        <Cell name="BarList">
          <BarList label="Tokens by agent" items={[{ label: 'Deploy Fixer', value: 84 }, { label: 'Docs Writer', value: 46 }]} />
        </Cell>
        <Cell name="Chat" wide>
          <Chat height={320} agentName="Deploy Fixer" messages={[{ id: '1', from: 'user', content: 'Why is the deploy failing?' }, { id: '2', from: 'assistant', content: 'The build cannot find zod.' }]} />
        </Cell>
        <Cell name="Message" wide>
          <Message from="assistant" name="Deploy Fixer">
            <p>
              The build cannot find zod.
              <Citation index={1} href="/" />
            </p>
          </Message>
        </Cell>
        <Cell name="MessageList" wide>
          <div style={{ height: 160 }}>
            <MessageList>
              <Message from="user">Why is the deploy failing?</Message>
            </MessageList>
          </div>
        </Cell>
        <Cell name="PromptInput" wide>
          <PromptInput label="Message Deploy Fixer" placeholder="Ask Deploy Fixer" />
        </Cell>
        <Cell name="Reasoning">
          <Reasoning seconds={8}>The log stops at the build step.</Reasoning>
        </Cell>
        <Cell name="Sources">
          <Sources items={[{ title: 'Build 482 log', detail: 'deploys/web/482', href: '/' }]} />
        </Cell>
        <Cell name="Suggestions">
          <Suggestions items={['Explain the failure', 'Show the diff']} />
        </Cell>
        <Cell name="ModelPicker">
          <ModelPicker models={[{ value: 'large', label: 'Large' }, { value: 'small', label: 'Small' }]} />
        </Cell>
        <Cell name="Navbar" wide>
          <Navbar brand={<Link href="/">Acme</Link>} items={[{ label: 'Runs', href: '/', current: true }, { label: 'Inbox', href: '/', count: 5 }]} />
        </Cell>
        <Cell name="Sidebar">
          <Sidebar label="Workspace" variant="card" collapsible groups={[{ title: 'Manage', items: [{ label: 'Runs', href: '/', current: true }, { label: 'Settings', href: '/' }] }]} />
        </Cell>
        <Cell name="Steps" wide>
          <Steps label="Set up" current={1} steps={[{ title: 'Connect a repository' }, { title: 'Choose an agent' }, { title: 'Review and start' }]} />
        </Cell>
        <Cell name="Footer" wide>
          <Footer legal="© 2026 Acme. MIT licence." links={[{ label: 'Docs', href: '/' }]} />
        </Cell>
        <Cell name="AppShell" wide>
          <AppShell height={240} header="Runs" sidebar={<Sidebar label="App" groups={[{ items: [{ label: 'Runs', href: '/', current: true }] }]} />}>
            Content
          </AppShell>
        </Cell>
        <Cell name="Breadcrumbs">
          <Breadcrumbs items={[{ label: 'Acme', href: '/' }, { label: 'Run 41' }]} />
        </Cell>
        <Cell name="Scroller">
          <Scroller label="Recent runs">
            <Card style={{ width: 160 }}>Run 41</Card>
            <Card style={{ width: 160 }}>Run 40</Card>
            <Card style={{ width: 160 }}>Run 39</Card>
          </Scroller>
        </Cell>
        <Cell name="ClearableInput">
          <ClearableInput aria-label="Branch" defaultValue="fix/deploy-zod" />
        </Cell>
        <Cell name="Combobox">
          <Combobox aria-label="Assign to agent" options={agents} defaultValue="df" />
        </Cell>
        <Cell name="MultiSelect">
          <MultiSelect aria-label="Agents" options={agents} defaultValue={['df']} />
        </Cell>
        <Cell name="RadioGroup">
          <RadioGroup legend="When the budget runs out" defaultValue="pause" options={[{ value: 'pause', label: 'Pause and ask me' }, { value: 'stop', label: 'Stop the run' }]} />
        </Cell>
        <Cell name="Choicebox">
          <Choicebox legend="Autonomy" defaultValue="risky" options={[{ value: 'all', title: 'Ask for everything' }, { value: 'risky', title: 'Ask for risky actions' }]} />
        </Cell>
        <Cell name="Slider">
          <Slider label="Token budget" defaultValue={[50]} />
        </Cell>
        <Cell name="Calendar">
          <Calendar today={new Date(2026, 9, 8)} defaultValue={new Date(2026, 9, 8)} locale="en-GB" />
        </Cell>
        <Cell name="ThemeSwitcher">
          <ThemeSwitcher />
        </Cell>
        <Cell name="CopyButton">
          <CopyButton value="run_8f3a" label="Copy run ID" />
        </Cell>
        <Cell name="LoadMoreButton">
          <LoadMoreButton>Load 20 more runs</LoadMoreButton>
        </Cell>
        <Cell name="ShowMore">
          <ShowMore collapsedHeight={40}>
            <p style={{ margin: 0 }}>Line one. Line two. Line three. Line four. Line five. Line six. Line seven. Line eight. Line nine. Line ten. Line eleven. Line twelve.</p>
          </ShowMore>
        </Cell>
        <Cell name="Banner">
          <Banner tone="ink">3 agents are waiting for you.</Banner>
        </Cell>
        <Cell name="StatusBadge">
          <StatusBadge status="done" startedAt={NOW - 9000} endedAt={NOW} />
        </Cell>
        <Cell name="JsonView">
          <JsonView label="Tool result" value={{ tool: 'run_tests', ok: true }} />
        </Cell>
        <Cell name="FileTree">
          <FileTree label="Changed files" defaultExpanded={['web']} nodes={[{ id: 'web', name: 'web', children: [{ id: 'pkg', name: 'package.json', status: 'M' }] }]} />
        </Cell>
        <Cell name="Video">
          <Video label="Run 41 recording" src="data:video/mp4;base64," />
        </Cell>
        <Cell name="ToolCallCard" wide>
          <ToolCallCard tool="run_tests" status="success" attempt={2} input={{ suite: 'web' }} headingLevel={4} />
        </Cell>
        <Cell name="ApprovalPrompt" wide>
          <ApprovalPrompt action="npm install zod@3" target="web/package.json" risk="medium" reason="A runtime dependency is missing." decision="allow-once" autoFocus={false} headingLevel={4} />
        </Cell>
        <Cell name="AgentHandoffBanner" wide>
          <AgentHandoffBanner agentName="Deploy Fixer" summary="The deploy is fixed." focusOnMount={false} />
        </Cell>
        <Cell name="RunTimeline" wide>
          <div style={{ height: 320 }}>
            <RunTimeline steps={steps} live={false} />
          </div>
        </Cell>
        {diff && (
          <Cell name="DiffReview" wide>
            <DiffReview file={diff.file} hunks={diff.hunks} headingLevel={4} />
          </Cell>
        )}
        <Cell name="NeedsYouInbox" wide>
          <NeedsYouInbox now={NOW} headingLevel={4} items={[{ id: 'q1', kind: 'question', title: 'Which staging database should I seed?', agentName: 'Data Loader', createdAt: NOW - 840_000, urgency: 'normal' }]} />
        </Cell>
        <Cell name="FleetSky" wide>
          <div style={{ height: 300 }}>
            <FleetSky agents={[{ id: 'deploy', name: 'Deploy Fixer', status: 'waiting', detail: 'wants to run npm install zod@3' }, { id: 'docs', name: 'Docs Writer', status: 'running' }]} />
          </div>
        </Cell>
        <Cell name="AgentRunLayout" wide>
          <AgentRunLayout agentName="Deploy Fixer" status="completed" timeline={<RunTimeline steps={steps} live={false} />} detail={<Alert title="Run finished" />} />
        </Cell>
      </div>
    </main>
  );
}
