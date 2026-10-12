// An assistant chat: past chats, a new-chat screen with suggestions, and replies that stream in.
// The assistant is a stand-in with a few fixed answers; nothing is sent anywhere.
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';
import './app.css';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AppShell,
  Citation,
  Code,
  CopyButton,
  Entity,
  IconButton,
  ModelPicker,
  Sidebar,
  ThemeSwitcher,
  Toaster,
  toast,
  Chat,
  type ChatMessage,
  type PromptAttachment,
} from '@creance-ui/react';
import { SampleNote } from '../SampleNote';

const glyph = (d: string) => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const icons = {
  plus: glyph('M8 3v10M3 8h10'),
  retry: glyph('M13 8a5 5 0 1 1-1.5-3.6M13 2.8v2.8h-2.8'),
  chat: glyph('M3 4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5v5a1.5 1.5 0 0 1-1.5 1.5H7l-3 2.5V11h-.5A.5.5 0 0 1 3 10.5z'),
};

const models = [
  { value: 'small', label: 'Small', description: 'Fastest, for short questions.' },
  { value: 'medium', label: 'Medium', description: 'Balanced. The default.' },
  { value: 'large', label: 'Large', description: 'Slower, most careful with long work.' },
];

/** A message whose text is known, so it can be streamed and copied. */
type Turn = ChatMessage & { text?: string };
interface Thread {
  id: string;
  title: string;
  group: 'Today' | 'Previous 7 days' | 'Older';
  turns: Turn[];
}

const you = (id: string, text: string): Turn => ({ id, from: 'user', content: text, text });
const said = (id: string, text: string, extra: Partial<Turn> = {}): Turn => ({ id, from: 'assistant', content: <p>{text}</p>, text, ...extra });

// ── Past chats. Acme and its builds are made up. ─────────────────────────────────────────────
const buildAnswer = (
  <>
    <p>
      Build 482 stops at the build step: <Code>server/validate.ts</Code> imports <Code>zod</Code>, but <Code>web/package.json</Code> does not list it.
      <Citation index={1} label="Source 1, deploy.log" /> The import arrived in commit <Code>a41c9e2</Code>, two days after the last deploy that passed.
      <Citation index={2} label="Source 2, commit a41c9e2" />
    </p>
    <p>To fix it, add the dependency and commit the lockfile with it:</p>
    <pre className="ex-code">
      <code>{'// web/package.json\n"dependencies": {\n  "react": "^19.3.0",\n  "zod": "^3.23.8",\n  "react-dom": "^19.3.0"\n}'}</code>
    </pre>
    <ol>
      <li>
        Run <Code>npm install zod@3</Code> in <Code>web/</Code>.
      </li>
      <li>Commit package.json and the lockfile together.</li>
      <li>Redeploy. The build step should pass in under a minute.</li>
    </ol>
  </>
);
const initial: Thread[] = [
  {
    id: 'build-482',
    title: 'Why did build 482 fail?',
    group: 'Today',
    turns: [
      { ...you('b1', 'Why did build 482 fail? The log is attached.'), content: <><span className="ex-attached">deploy.log · 48 KB</span>Why did build 482 fail? The log is attached.</> },
      {
        ...said('b2', 'Build 482 stops at the build step: server/validate.ts imports zod, but web/package.json does not list it. Run npm install zod@3 in web/, commit the lockfile with it, and redeploy.'),
        content: buildAnswer,
        reasoning: { seconds: 6, content: 'The log ends with "Cannot find module zod" during the build. Check which file imports it, then compare with package.json and the commit history.' },
        sources: [
          { title: 'deploy.log', detail: 'Attached · line 212' },
          { title: 'Commit a41c9e2', detail: 'acme/web · 2 days ago' },
        ],
      },
      you('b3', 'Write that as a short note for the team channel.'),
      said('b4', 'Build 482 failed on a missing dependency: zod was imported in a41c9e2 but never added to web. The fix is one line plus the lockfile; I can open the pull request if you want.'),
    ],
  },
  {
    id: 'postmortem',
    title: 'Draft a postmortem',
    group: 'Today',
    turns: [you('p1', 'Draft a short postmortem for yesterday’s failed deploy.'), said('p2', 'What happened: a new import was merged without its dependency, so the production build failed for 40 minutes. Why it was missed: the preview build used a cached install. What changes: installs now run from the lockfile, and the build fails if an import has no dependency.')],
  },
  {
    id: 'retries',
    title: 'Compare two retry policies',
    group: 'Previous 7 days',
    turns: [you('r1', 'Three retries with no delay, or two with a 10 second delay?'), said('r2', 'Two with a delay. Registry timeouts usually clear within seconds, so retrying at once tends to hit the same failure three times. A short delay gives the registry time to recover and costs less in total.')],
  },
  {
    id: 'lockfile',
    title: 'Explain the lockfile diff',
    group: 'Previous 7 days',
    turns: [you('l1', 'Why did the lockfile change by 14 lines for one package?'), said('l2', 'zod has no dependencies of its own, so most of those lines are the entry for zod itself: its version, where it was downloaded from and a checksum, plus the line that links it to web.')],
  },
  {
    id: 'week',
    title: 'How did last week go?',
    group: 'Previous 7 days',
    turns: [you('w1', 'How did last week go?'), said('w2', '46 runs: 41 finished, 3 failed and 2 were stopped by you. All three failures were Upgrader’s react-router upgrade. Deploy Fixer used the most tokens, 412K of its 600K limit.')],
  },
  {
    id: 'sql',
    title: 'SQL for slow checkouts',
    group: 'Previous 7 days',
    turns: [you('s1', 'Which checkouts took longer than 5 seconds yesterday?'), said('s2', 'Select from checkouts where the duration is over 5000 ms and the start is yesterday, ordered by duration. Add an index on started_at if this runs often; the table has no index on it today.')],
  },
  {
    id: 'onboarding',
    title: 'Onboarding checklist',
    group: 'Older',
    turns: [you('o1', 'What should a new engineer set up on day one?'), said('o2', 'Access to the repository and the team channel, a local build that passes, and one small change merged by the end of the day. Pair them with someone for the first deploy.')],
  },
];

// ── The stand-in assistant: fixed answers to the suggestions, and an honest reply to anything else. ──
const suggestions = ['Explain a failing build', 'Summarise this week’s runs', 'Draft release notes', 'Review a pull request'];
const answers: Record<string, string> = {
  'Explain a failing build': 'Paste the build log or give me the build number, and I will find the first error, the commit that caused it, and the smallest fix.',
  'Summarise this week’s runs': '46 runs this week: 41 finished, 3 failed and 2 were stopped by you. All three failures came from Upgrader’s react-router upgrade. Deploy Fixer used the most tokens, 412K of its 600K limit.',
  'Draft release notes': 'Fixed: production deploys no longer fail when a dependency is missing from the lockfile. Changed: deploys retry three times when the registry times out. Added: zod for request validation in web.',
  'Review a pull request': 'Which pull request? Paste its link or number. I will read the changes, point out risky ones first, and say what I could not check.',
};
const fallback = 'This is a sample assistant with a few fixed answers, so it cannot answer that. In a real app your message would go to a model, and its reply would stream in here, word by word, like this one.';

const read = () => window.location.hash.slice(1) || 'new';
const go = (route: string) => (window.location.hash = route);
let count = 0;
const uid = (prefix: string) => `${prefix}${Date.now()}-${count++}`;

/** The stand-in assistant: it thinks for a moment, then streams its answer word by word. */
function standIn(setThreads: (change: (all: Thread[]) => Thread[]) => void, setWorking: (working: boolean) => void) {
  let timers: ReturnType<typeof setTimeout>[] = [];
  const update = (threadId: string, id: string, patch: Partial<Turn>) =>
    setThreads((all) => all.map((t) => (t.id === threadId ? { ...t, turns: t.turns.map((m) => (m.id === id ? { ...m, ...patch } : m)) } : t)));
  const stop = () => {
    timers.forEach(clearTimeout);
    timers = [];
    setWorking(false);
  };
  return {
    stop,
    reply(threadId: string, prompt: string) {
      stop();
      const text = answers[prompt] ?? fallback;
      const id = uid('a');
      const words = text.split(' ');
      setWorking(true);
      setThreads((all) => all.map((t) => (t.id === threadId ? { ...t, turns: [...t.turns, { id, from: 'assistant', status: 'pending' }] } : t)));
      words.forEach((_, i) => timers.push(setTimeout(() => update(threadId, id, { status: 'streaming', content: words.slice(0, i + 1).join(' ') }), 700 + i * 45)));
      timers.push(
        setTimeout(() => {
          update(threadId, id, { status: 'done', content: <p>{text}</p>, text, reasoning: { seconds: 1, content: answers[prompt] ? 'A starting suggestion; answer from the sample data.' : 'Not one of the fixed answers; say so plainly.' } });
          setWorking(false);
        }, 800 + words.length * 45),
      );
    },
  };
}

function App() {
  const [threads, setThreads] = useState(initial);
  const [route, setRoute] = useState(read);
  const [working, setWorking] = useState(false);
  const [model, setModel] = useState('medium');
  const [files, setFiles] = useState<PromptAttachment[]>([]);
  const [bot] = useState(() => standIn(setThreads, setWorking));

  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => () => bot.stop(), [bot]);

  const thread = threads.find((t) => t.id === route);
  useEffect(() => {
    document.title = `${thread?.title ?? 'New chat'} · Assistant · Creance examples`;
  }, [thread]);

  const update = (id: string, change: (turns: Turn[]) => Turn[]) => setThreads((all) => all.map((t) => (t.id === id ? { ...t, turns: change(t.turns) } : t)));
  const stop = () => bot.stop();
  const reply = (threadId: string, prompt: string) => bot.reply(threadId, prompt);

  const send = (text: string) => {
    const attached = files;
    setFiles([]);
    const turn: Turn = {
      ...you(uid('u'), text),
      content: attached.length ? <>{attached.map((f) => <span key={f.id} className="ex-attached">{f.name} · {f.detail}</span>)}{text}</> : text,
    };
    let id = thread?.id;
    if (!id) {
      // The first message of a new chat names it.
      id = uid('c');
      const title = text.length > 40 ? `${text.slice(0, 38)}…` : text;
      const created: Thread = { id, title, group: 'Today', turns: [turn] };
      setThreads((all) => [created, ...all]);
      go(id);
    } else {
      update(id, (turns) => [...turns, turn]);
    }
    reply(id, text);
  };

  // Every finished answer can be copied or asked again.
  const withActions = (turns: Turn[]): ChatMessage[] =>
    turns.map((m) =>
      m.from === 'assistant' && (m.status ?? 'done') === 'done' && m.text
        ? {
            ...m,
            actions: (
              <>
                <CopyButton value={m.text} label="Copy answer" size="sm" />
                <IconButton
                  size="sm"
                  label="Try again"
                  icon={icons.retry}
                  disabled={working}
                  onClick={() => {
                    const index = turns.indexOf(m);
                    const asked = turns.slice(0, index).reverse().find((t) => t.from === 'user')?.text ?? '';
                    update(thread!.id, (all) => all.filter((t) => t.id !== m.id));
                    reply(thread!.id, asked);
                  }}
                />
              </>
            ),
          }
        : m,
    );

  const groups = (['Today', 'Previous 7 days', 'Older'] as const)
    .map((g) => ({ title: g, items: threads.filter((t) => t.group === g).map((t) => ({ label: t.title, href: `#${t.id}`, icon: icons.chat, current: t.id === route })) }))
    .filter((g) => g.items.length);

  const sidebar = (
    <Sidebar
      variant="flush"
      label="Chats"
      header={
        <div className="ex-brand">
          <strong>Assistant</strong>
          <IconButton label="New chat" icon={icons.plus} onClick={() => go('new')} />
        </div>
      }
      groups={groups}
      footer={<Entity name="Sam Rivera" kind="human" description="Acme" />}
    />
  );
  const header = (
    <div className="ex-header">
      <h1 className="ex-title">{thread?.title ?? 'New chat'}</h1>
      <ThemeSwitcher />
      {thread && <CopyButton value={() => window.location.href} label="Copy link to this chat" onCopy={() => toast({ title: 'Link copied. It only works in this sample, on this device.' })} />}
    </div>
  );

  return (
    <AppShell sidebar={sidebar} header={header} sidebarLabel="Chats" menuLabel="Open chats">
      <SampleNote source="assistant/main.tsx" />
      <Chat
        key={thread?.id ?? 'new'}
        className="ex-chat"
        agentName="Assistant"
        messages={withActions(thread?.turns ?? [])}
        status={working ? 'working' : 'ready'}
        onStop={() => {
          stop();
          if (thread) update(thread.id, (turns) => turns.filter((t) => t.status !== 'pending').map((t) => (t.status === 'streaming' ? { ...t, status: 'done' } : t)));
        }}
        onSend={send}
        suggestions={thread ? undefined : suggestions}
        empty={
          <div className="ex-empty">
            <h2>What can I help with?</h2>
            <p>Pick a starting point below, or write your own. Answers can be wrong; check anything important.</p>
          </div>
        }
        placeholder={thread ? 'Message Assistant' : 'Ask anything, or attach a file'}
        tools={<ModelPicker models={models} value={model} onValueChange={setModel} />}
        attachments={files}
        onAttach={(picked) => setFiles((f) => [...f, ...picked.map((file) => ({ id: `${file.name}-${file.size}`, name: file.name, detail: `${Math.max(1, Math.round(file.size / 1024))} KB` }))])}
        onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
      />
      <Toaster />
    </AppShell>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

