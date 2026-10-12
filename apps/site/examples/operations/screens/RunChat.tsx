// One run as a conversation: the agent explains, asks before it acts, and carries on once you answer.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ApprovalPrompt, Avatar, BudgetMeter, Button, Card, Chat, Citation, Code, EmptyState, Steps, ToolCallCard, toast, type ApprovalDecision, type ChatMessage, type StepItem } from '@creance-ui/react';
import { deployRunId } from '../data';
import { PageHead, Shell, icons, type App } from '../shell';

const opening: ChatMessage[] = [
  { id: 'm1', from: 'user', content: 'The production deploy for web is failing. Can you find out why and fix it?' },
  {
    id: 'm2',
    from: 'assistant',
    reasoning: { seconds: 8, content: 'The log stops at the build step with "Cannot find module zod". That is a missing dependency, not a code error. Check which file imports it and when.' },
    content: (
      <>
        <ToolCallCard tool="read_logs" status="success" input={{ path: 'deploys/web/482' }} output="Error: Cannot find module 'zod'" headingLevel={2} announce={false} />
        <p>
          The build fails because <Code>server/validate.ts</Code> imports <Code>zod</Code>, which is missing from <Code>web/package.json</Code>.
          <Citation index={1} label="Source 1, Build 482 log" /> The import arrived in commit <Code>a41c9e2</Code>, after the last deploy that passed.
          <Citation index={2} label="Source 2, Commit a41c9e2" />
        </p>
        <p>I can add the dependency and run the tests again. Installing a package changes the lockfile, so I will ask before I do it.</p>
      </>
    ),
    sources: [
      { title: 'Build 482 log', detail: 'deploys/web/482' },
      { title: 'Commit a41c9e2', detail: 'acme/web · 2 days ago' },
    ],
  },
];

const after: Record<ApprovalDecision, ReactNode> = {
  'allow-once': (
    <p>
      Installed <Code>zod@3</Code> and ran the tests: 48 of 48 pass. Next I will open a pull request with the change, for you to merge.
    </p>
  ),
  'always-allow': (
    <p>
      Installed <Code>zod@3</Code> and ran the tests: 48 of 48 pass. I will not ask again before installing packages in <Code>web/</Code>. Next I will open a pull request.
    </p>
  ),
  deny: (
    <p>
      Understood, I installed nothing. The deploy will keep failing until <Code>zod</Code> is in <Code>web/package.json</Code>. You can add it with <Code>npm install zod@3</Code>.
    </p>
  ),
};

function plan(decision: ApprovalDecision | undefined, stopped: boolean): StepItem[] {
  const denied = decision === 'deny';
  return [
    { title: 'Read the build log', description: 'Missing module: zod.', status: 'done' },
    { title: 'Find the cause', description: 'Import added in a41c9e2.', status: 'done' },
    { title: 'Install zod', description: decision ? (denied ? 'You denied it.' : 'Installed.') : 'Waiting for your approval.', status: decision ? (denied ? 'error' : 'done') : 'current' },
    { title: 'Run the tests', description: decision && !denied ? '48 of 48 pass.' : undefined, status: decision && !denied ? 'done' : 'upcoming' },
    { title: 'Open a pull request', status: decision && !denied && !stopped ? 'current' : 'upcoming' },
  ];
}

export function RunChat({ app, runId }: { app: App; runId?: string }) {
  if (runId !== deployRunId) {
    return (
      <Shell app={app} route="runs" crumbs={[{ label: 'Runs', href: '#runs' }, { label: 'Run' }]}>
        <PageHead title="Run" sub="A run from the sample data." />
        <Card className="ex-card">
          <EmptyState
            icon={icons.runs}
            title="This sample has one run to open"
            description="In a real app every run opens like this. Here only Fix the failing deploy has a conversation behind it."
            action={<Button onClick={() => app.go(`run/${deployRunId}`)}>Open Fix the failing deploy</Button>}
            headingLevel={2}
          />
        </Card>
      </Shell>
    );
  }
  return <Conversation app={app} />;
}

function Conversation({ app }: { app: App }) {
  const decision = app.deployDecision;
  // If you answered from the inbox, the run has already moved on when you open it.
  const [messages, setMessages] = useState<ChatMessage[]>(() => (decision ? [...opening, { id: 'm3', from: 'assistant', content: after[decision] }] : opening));
  const [working, setWorking] = useState(false);
  const [stopped, setStopped] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /** The agent thinks for a moment, then answers. */
  const say = (content: ReactNode) => {
    const id = `m${Date.now()}`;
    setWorking(true);
    setMessages((m) => [...m, { id, from: 'assistant', status: 'pending' }]);
    timers.current.push(
      setTimeout(() => {
        setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: 'done', content } : x)));
        setWorking(false);
      }, 1100),
    );
  };

  const decide = (d: ApprovalDecision) => {
    app.decideDeploy(d);
    say(after[d]);
  };

  const aside = (
    <div className="ex-stack ex-run-aside">
      <h2>This run</h2>
      <Steps orientation="vertical" label="Plan" steps={plan(decision, stopped)} />
      <BudgetMeter label="Tokens" used={decision && decision !== 'deny' ? 14200 : 9800} limit={50000} unit="tokens" />
      <div>
        <h3 className="ex-label">Files it will change</h3>
        <ul className="ex-files">
          <li><Code>web/package.json</Code><span>{decision && decision !== 'deny' ? 'Changed' : 'Pending'}</span></li>
          <li><Code>pnpm-lock.yaml</Code><span>{decision && decision !== 'deny' ? 'Changed' : 'Pending'}</span></li>
        </ul>
      </div>
      <Button
        variant="danger"
        disabled={stopped}
        onClick={() => {
          setStopped(true);
          timers.current.forEach(clearTimeout);
          setWorking(false);
          toast({ title: 'Run stopped. Deploy Fixer will not take another step.', tone: 'danger' });
        }}
      >
        {stopped ? 'Stopped' : 'Stop the run'}
      </Button>
    </div>
  );

  return (
    <Shell app={app} route="runs" crumbs={[{ label: 'Runs', href: '#runs' }, { label: 'Fix the failing deploy' }]} aside={aside}>
      <h1 className="ex-sr">Fix the failing deploy</h1>
      <Chat
        className="ex-chat"
        agentName="Deploy Fixer"
        avatar={<Avatar name="Deploy Fixer" kind="agent" size="sm" decorative />}
        messages={messages}
        status={working ? 'working' : 'ready'}
        onStop={() => {
          timers.current.forEach(clearTimeout);
          setMessages((m) => m.filter((x) => x.status !== 'pending'));
          setWorking(false);
        }}
        disabled={stopped}
        placeholder={stopped ? 'This run is stopped' : 'Reply to Deploy Fixer'}
        onSend={(text) => {
          setMessages((m) => [...m, { id: `u${Date.now()}`, from: 'user', content: text }]);
          say(<p>This is a sample agent, so it cannot act on that. In a real app your message would go to Deploy Fixer, which would answer here.</p>);
        }}
      >
        {!decision && !stopped && (
          <ApprovalPrompt
            agentName="Deploy Fixer"
            action="npm install zod@3"
            target="web/package.json"
            risk="medium"
            reason="Adds one runtime package and changes the lockfile."
            headingLevel={2}
            onAllow={(scope) => decide(scope === 'once' ? 'allow-once' : 'always-allow')}
            onDeny={() => decide('deny')}
          />
        )}
      </Chat>
    </Shell>
  );
}
