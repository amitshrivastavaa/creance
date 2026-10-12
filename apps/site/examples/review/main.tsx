// A code review of an agent's pull request: the changed files, each reviewed change by change,
// the run that produced them and checkpoints to rewind to. The run is the kit's sample deploy scenario.
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';
import './app.css';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AppShell,
  Breadcrumbs,
  Button,
  Card,
  CheckpointRewind,
  Code,
  Dialog,
  DialogContent,
  DiffReview,
  Entity,
  Field,
  FileTree,
  ProgressBar,
  RunTimeline,
  StatusDot,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ThemeSwitcher,
  Toaster,
  initialRunState,
  reduceRun,
  timelineSteps,
  toast,
  type AgentEvent,
  type AgentEventBody,
  type DiffHunk,
  type FileNode,
} from '@creance-ui/react';
import { deployFix } from '@creance-ui/react/simulator';
import { SampleNote } from '../SampleNote';
import { savedTheme } from '../theme';

/** The sample deploy run, played to the end with every wait answered. */
function finishedRun() {
  const bodies: [number, AgentEventBody][] = [];
  let t = 0;
  for (const step of deployFix) {
    t += 'waitFor' in step ? 1500 : step.after;
    if ('waitFor' in step) {
      bodies.push([t, step.waitFor === 'approval.resolved' ? { type: 'approval.resolved', approvalId: step.id, decision: 'allow-once' } : { type: 'diff.resolved', diffId: step.id, accepted: [], rejected: [] }]);
    } else bodies.push([t, step.event]);
  }
  const start = Date.now() - t - 120_000;
  return bodies.map(([at, body]) => ({ ...body, runId: 'run-41', ts: start + at }) as AgentEvent).reduce(reduceRun, initialRunState);
}
const run = finishedRun();
const configDiff = run.diffs[0]!;

interface ChangedFile {
  id: string;
  path: string;
  why: string;
  hunks: DiffHunk[];
}
const files: ChangedFile[] = [
  {
    id: 'web/package.json',
    path: 'web/package.json',
    why: 'server/validate.ts imports zod, which was missing, so the production build failed.',
    hunks: [
      {
        id: 'pkg-1',
        header: '@@ -8,6 +8,7 @@ "dependencies"',
        lines: [
          { type: 'context', content: '  "dependencies": {', oldNumber: 8, newNumber: 8 },
          { type: 'context', content: '    "react": "^19.3.0",', oldNumber: 9, newNumber: 9 },
          { type: 'add', content: '    "zod": "^3.23.8",', newNumber: 10 },
          { type: 'context', content: '    "react-dom": "^19.3.0"', oldNumber: 10, newNumber: 11 },
        ],
      },
    ],
  },
  { id: configDiff.file, path: configDiff.file, why: 'Raise deploy retries so a flaky registry does not fail the whole deploy, and install from the lockfile.', hunks: configDiff.hunks },
];
const tree: FileNode[] = [
  { id: 'deploy', name: 'deploy', children: [{ id: configDiff.file, name: configDiff.file.split('/').pop()!, status: 'M' }] },
  { id: 'web', name: 'web', children: [{ id: 'web/package.json', name: 'package.json', status: 'M' }] },
];

const checkpoints = [
  { id: 'now', label: 'Now: pull request opened', time: '03:05' },
  {
    id: 'before-config',
    label: 'Before editing the deploy config',
    time: '02:12',
    undoes: { files: [{ path: configDiff.file, added: 2, removed: 1 }], steps: ['Edit deploy config', 'Open pull request'] },
  },
  {
    id: 'before-install',
    label: 'Before installing zod',
    time: '01:10',
    undoes: { files: [{ path: 'web/package.json', added: 1, removed: 0 }, { path: 'pnpm-lock.yaml', added: 14, removed: 0 }], steps: ['Install zod', 'Run tests', 'Edit deploy config', 'Open pull request'], notes: ['Tokens already used are not refunded.'] },
  },
];

type Result = { accepted: string[]; rejected: string[] };

function App() {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [selected, setSelected] = useState<string | null>(files[0]!.id);
  const [state, setState] = useState<'open' | 'merged' | 'changes'>('open');
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState('');
  const reviewed = Object.keys(results).length;
  const rejected = Object.values(results).some((r) => r.rejected.length > 0);

  const show = (id: string) => {
    setSelected(id);
    document.getElementById(`file-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sidebar = (
    <nav className="ex-files" aria-label="Files">
      <FileTree nodes={tree} label="Changed files" defaultExpanded={['deploy', 'web']} selected={selected} onSelect={(n) => !n.children && show(n.id)} />
      <p className="ex-muted ex-small">pnpm-lock.yaml changed too: 14 generated lines, not shown.</p>
      <div className="ex-progress">
        <ProgressBar label={`Reviewed ${reviewed} of ${files.length} files`} value={reviewed} max={files.length} />
      </div>
    </nav>
  );
  const header = (
    <div className="ex-header">
      <Breadcrumbs items={[{ label: 'acme/web', href: '#' }, { label: 'Pull requests', href: '#' }, { label: '#212' }]} />
      <span className="ex-space" />
      <ThemeSwitcher defaultValue={savedTheme} />
    </div>
  );
  const aside = (
    <div className="ex-stack">
      <h2 className="ex-aside-title">The run behind it</h2>
      <RunTimeline steps={timelineSteps(run)} live={false} label="Deploy Fixer’s run" />
      <CheckpointRewind
        checkpoints={checkpoints}
        headingLevel={2}
        limits="Rewinding resets the branch. It cannot undo a deploy that already went out."
        onRewind={(id) => toast({ title: `Rewound to “${checkpoints.find((c) => c.id === id)?.label}”. In this sample, nothing changes.` })}
      />
    </div>
  );

  return (
    <AppShell sidebar={sidebar} header={header} aside={aside} sidebarLabel="Changed files" menuLabel="Open changed files" asideLabel="The run behind it">
      <SampleNote source="review/main.tsx" />
      <div className="ex-pr">
        <div className="ex-pr__title">
          <h1>Add zod to web dependencies</h1>
          <StatusDot status={state === 'merged' ? 'done' : state === 'changes' ? 'failed' : 'waiting'}>{state === 'merged' ? 'Merged' : state === 'changes' ? 'Changes requested' : 'Open'}</StatusDot>
        </div>
        <p className="ex-muted">
          Deploy Fixer wants to merge 1 commit from <Code>fix/missing-zod</Code> into <Code>main</Code>.
        </p>
        {state === 'open' && (
          <div className="ex-pr__actions">
            <Button onClick={() => setAsking(true)}>Request changes</Button>
            <Button
              variant="primary"
              disabled={reviewed < files.length || rejected}
              onClick={() => {
                setState('merged');
                toast({ title: 'Merged into main. In a real app, the deploy would start now.', tone: 'success' });
              }}
            >
              Approve and merge
            </Button>
            <span className="ex-muted ex-small" aria-live="polite">
              {rejected ? 'You rejected a change: request changes instead.' : reviewed < files.length ? `Review all ${files.length} files to merge.` : 'Every change is accepted.'}
            </span>
          </div>
        )}
      </div>
      <Tabs defaultValue="files">
        <TabsList aria-label="Pull request">
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="files">Files changed {files.length + 1}</TabsTrigger>
          <TabsTrigger value="checks">Checks 4</TabsTrigger>
        </TabsList>
        <TabsContent value="conversation">
          <Card className="ex-card">
            <Entity name="Deploy Fixer" kind="agent" description="Opened this pull request 3 minutes ago" />
            <p>The production deploy for web failed because zod was imported but never added to its dependencies. This adds it, and raises deploy retries so a slow registry does not fail the deploy.</p>
            <p>You allowed the install. The tests pass: 48 of 48.</p>
          </Card>
        </TabsContent>
        <TabsContent value="files">
          <div className="ex-stack">
            {files.map((f) => (
              <section key={f.id} id={`file-${f.id}`} className="ex-file" aria-label={f.path}>
                <DiffReview
                  file={f.path}
                  hunks={f.hunks}
                  description={f.why}
                  headingLevel={2}
                  applied={results[f.id]}
                  onApply={(r) => {
                    setResults((all) => ({ ...all, [f.id]: r }));
                    const next = files.find((x) => x.id !== f.id && !results[x.id]);
                    if (next) show(next.id);
                  }}
                />
              </section>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="checks">
          <Card className="ex-card">
            <ul className="ex-checks">
              {['Build', 'Unit tests, 48 passed', 'Type check', 'Preview deploy'].map((c) => (
                <li key={c}>
                  <StatusDot status="done">{c}</StatusDot>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={asking} onOpenChange={setAsking}>
        <DialogContent
          title="Request changes"
          description="Deploy Fixer will read this and update the pull request."
          actions={
            <>
              <Button onClick={() => setAsking(false)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!note.trim()}
                onClick={() => {
                  setAsking(false);
                  setState('changes');
                  toast({ title: 'Sent to Deploy Fixer. In this sample, it does not reply.' });
                }}
              >
                Send
              </Button>
            </>
          }
        >
          <Field label="What should change?">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
          </Field>
        </DialogContent>
      </Dialog>
      <Toaster />
    </AppShell>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
