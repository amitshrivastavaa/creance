// The kit at phone size: what needs you, a request opened as a sheet, and a run you can stop.
// Three phones run the same small app, each starting somewhere different.
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';
import './app.css';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ApprovalPrompt,
  BudgetMeter,
  IconButton,
  KillSwitch,
  NeedsYouInbox,
  PhoneFrame,
  QuestionCard,
  StatusDot,
  Steps,
  ThemeSwitcher,
  Toaster,
  toast,
  type InboxItem,
  type StepItem,
} from '@creance-ui/react';
import { SampleNote } from '../SampleNote';
import { savedTheme } from '../theme';

const minute = 60_000;
const openedAt = Date.now();
const requests: InboxItem[] = [
  { id: 'a1', kind: 'approval', title: 'Run npm install zod@3 in web/', agentName: 'Deploy Fixer', createdAt: openedAt - 3 * minute, urgency: 'high', detail: 'Fix the failing deploy' },
  { id: 'q1', kind: 'question', title: 'Which region should I seed first?', agentName: 'Data Loader', createdAt: openedAt - 31 * minute, urgency: 'normal', detail: 'Seed staging' },
  { id: 'a2', kind: 'approval', title: 'Publish onboarding docs to the wiki', agentName: 'Docs Writer', createdAt: openedAt - 60 * minute, urgency: 'low', detail: 'Write onboarding docs' },
];

const glyph = (d: string) => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const close = glyph('M4 4l8 8M12 4l-8 8');

type Tab = 'inbox' | 'run';

function Phone({ tab: startTab, open: startOpen, name }: { tab: Tab; open?: string; name: string }) {
  const [tab, setTab] = useState<Tab>(startTab);
  const [items, setItems] = useState(requests);
  const [open, setOpen] = useState(startOpen);
  const [installed, setInstalled] = useState(false);
  const [stopped, setStopped] = useState(false);
  const item = items.find((i) => i.id === open);

  const answer = (id: string, title: string) => {
    setItems((all) => all.filter((i) => i.id !== id));
    setOpen(undefined);
    toast({ title: `${name}: ${title}` });
  };
  const steps: StepItem[] = [
    { title: 'Read the build log', status: 'done' },
    { title: 'Find the cause', status: 'done' },
    { title: 'Install zod', status: installed ? 'done' : 'current', description: installed ? 'You allowed it' : 'Waiting for you' },
    { title: 'Run the tests', status: stopped ? 'error' : installed ? 'current' : 'upcoming', description: stopped ? 'Stopped by you' : installed ? '31 of 48 passed' : undefined },
    { title: 'Open a pull request', status: 'upcoming' },
  ];

  return (
    <div className="ex-phone">
      {/* While a sheet is open, the page behind it can't be reached. */}
      <div className="ex-phone__page" inert={!!item}>
        {tab === 'inbox' ? (
          <NeedsYouInbox items={items} title="Needs you" headingLevel={2} onOpen={(i) => setOpen(i.id)} emptyText="Nothing is waiting for you." />
        ) : (
          <div className="ex-phone__run">
            <h2>Fix the failing deploy</h2>
            <StatusDot status={stopped ? 'failed' : installed ? 'running' : 'waiting'}>{stopped ? 'Stopped' : installed ? 'Running' : 'Waiting for you'} · Deploy Fixer</StatusDot>
            <Steps orientation="vertical" label="Plan" steps={steps} />
            <BudgetMeter label="Tokens" used={installed ? 12_400 : 9_800} limit={50_000} unit="tokens" />
            <KillSwitch
              compact
              stopped={stopped}
              onStop={() => setStopped(true)}
              onResume={() => setStopped(false)}
              description="It stops before the next step."
            />
          </div>
        )}
      </div>
      <nav className="ex-phone__tabs" aria-label={`${name}, sections`} inert={!!item}>
        <button type="button" aria-current={tab === 'inbox' ? 'page' : undefined} onClick={() => setTab('inbox')}>
          Needs you {items.length}
        </button>
        <button type="button" aria-current={tab === 'run' ? 'page' : undefined} onClick={() => setTab('run')}>
          Run
        </button>
      </nav>
      {item && (
        <div className="ex-sheet">
          <button type="button" className="ex-sheet__scrim" aria-label="Close" tabIndex={-1} onClick={() => setOpen(undefined)} />
          <section className="ex-sheet__panel" aria-label={item.title}>
            <div className="ex-sheet__close">
              <IconButton size="sm" label="Close" icon={close} onClick={() => setOpen(undefined)} />
            </div>
            {item.kind === 'approval' ? (
              <ApprovalPrompt
                agentName={item.agentName}
                action={item.id === 'a1' ? 'npm install zod@3' : 'Publish docs/onboarding.md'}
                target={item.id === 'a1' ? 'web/' : 'the wiki'}
                risk={item.id === 'a1' ? 'medium' : 'low'}
                reason={item.id === 'a1' ? 'zod is imported but missing, so the deploy fails.' : 'The guide is written and reviewed.'}
                autoFocus={!startOpen}
                headingLevel={3}
                onAllow={() => {
                  if (item.id === 'a1') setInstalled(true);
                  answer(item.id, 'allowed.');
                }}
                onDeny={() => answer(item.id, 'denied.')}
              />
            ) : (
              <QuestionCard
                agentName={item.agentName}
                question={item.title}
                headingLevel={3}
                options={[
                  { value: 'staging-eu', label: 'staging-eu' },
                  { value: 'staging-us', label: 'staging-us' },
                ]}
                onAnswer={(a) => answer(item.id, `answered ${a}.`)}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <main className="ex-page">
      <div className="ex-top">
        <SampleNote source="mobile/main.tsx" />
        <ThemeSwitcher defaultValue={savedTheme} />
      </div>
      <header className="ex-intro">
        <h1>Approvals on the go</h1>
        <p>The same components at phone size. Each phone works on its own: open a request, answer it, or hold to stop the run.</p>
      </header>
      <div className="ex-phones">
        <PhoneFrame width={320} caption="What needs you">
          <Phone tab="inbox" name="First phone" />
        </PhoneFrame>
        <PhoneFrame width={320} caption="A request, as a sheet">
          <Phone tab="inbox" open="a1" name="Second phone" />
        </PhoneFrame>
        <PhoneFrame width={320} caption="A run you can stop">
          <Phone tab="run" name="Third phone" />
        </PhoneFrame>
      </div>
      <Toaster />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
