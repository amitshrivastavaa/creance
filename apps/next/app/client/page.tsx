'use client';

// Components that take callback functions have to be used from a client file, because a server
// component cannot pass a function as a prop. This page also drives a screen from the simulator.
import {
  ApprovalPrompt,
  Button,
  CheckpointRewind,
  CommandMenu,
  DestructiveActionModal,
  Feedback,
  KillSwitch,
  Pagination,
  PermissionLedger,
  PlanEditor,
  QuestionCard,
  RunTimeline,
  StatusDot,
  Table,
  Toaster,
  timelineSteps,
  toast,
  useAgentRun,
  type StandingPermission,
  type TableColumn,
} from '@creance-ui/react';
import { deployFix, useSimulator } from '@creance-ui/react/simulator';
import { useState } from 'react';
import { Cell } from '../Cell';

interface Run {
  id: string;
  title: string;
  tokens: number;
}
const runs: Run[] = [
  { id: 'r41', title: 'Fix the failing deploy', tokens: 9800 },
  { id: 'r40', title: 'Upgrade react-router', tokens: 31200 },
];
const columns: TableColumn<Run>[] = [
  { key: 'title', header: 'Run', rowHeader: true, cell: (r) => r.title, sortValue: (r) => r.title },
  { key: 'tokens', header: 'Tokens', align: 'end', cell: (r) => r.tokens, sortValue: (r) => r.tokens },
];
const grants: StandingPermission[] = [{ id: 'p1', tool: 'run_tests', agent: 'Deploy Fixer', scope: 'Any suite', granted: '5 days ago, by you', uses: 38 }];

export default function ClientPage() {
  const [log, setLog] = useState('nothing yet');
  const [page, setPage] = useState(3);
  const [stopped, setStopped] = useState(false);
  const [menu, setMenu] = useState(false);
  const [permissions, setPermissions] = useState(grants);

  // A whole screen driven by events, with the scripted run standing in for a backend.
  const sim = useSimulator(deployFix, { autoplay: true, speed: 20 });
  const run = useAgentRun(sim.events);
  const approval = run.approvals.find((a) => !a.decision);

  return (
    <main>
      <header>
        <h1>Creance in Next.js: client page</h1>
        <p>
          Last callback: <output id="log">{log}</output>
        </p>
      </header>

      <div className="grid">
        <Cell name="Table" wide>
          <Table caption="Recent runs" columns={columns} rows={runs} rowKey={(r) => r.id} />
        </Cell>
        <Cell name="Pagination">
          <Pagination page={page} pageCount={12} onPageChange={setPage} label="Runs pages" />
        </Cell>
        <Cell name="KillSwitch">
          <KillSwitch stopped={stopped} holdMs={300} onStop={() => setStopped(true)} onResume={() => setStopped(false)} />
        </Cell>
        <Cell name="Toast">
          <Button onClick={() => toast({ title: 'Plan saved', tone: 'success' })}>Show a toast</Button>
          <Toaster />
        </Cell>
        <Cell name="CommandMenu">
          <Button onClick={() => setMenu(true)}>Open command menu</Button>
          <CommandMenu open={menu} onOpenChange={setMenu} hotkey={false} commands={[{ id: 'df', label: 'Deploy Fixer', onSelect: () => setLog('command: Deploy Fixer') }]} />
        </Cell>
        <Cell name="DestructiveActionModal">
          <DestructiveActionModal trigger={<Button variant="danger">Delete agent</Button>} title="Delete Deploy Fixer?" description="This can't be undone." confirmLabel="Delete agent" onConfirm={() => setLog('deleted')} />
        </Cell>
        <Cell name="Feedback">
          <Feedback onSubmit={(f) => setLog(`feedback: ${f.rating}`)} />
        </Cell>
        <Cell name="QuestionCard" wide>
          <QuestionCard agentName="Data Loader" question="Which staging database should I seed?" options={[{ value: 'eu', label: 'staging-eu' }, { value: 'us', label: 'staging-us' }]} headingLevel={4} onAnswer={(a) => setLog(`answer: ${a}`)} />
        </Cell>
        <Cell name="PlanEditor" wide>
          <PlanEditor agentName="Deploy Fixer" headingLevel={4} steps={[{ id: '1', text: 'Read the deploy logs' }, { id: '2', text: 'Run the tests' }]} onStart={(s) => setLog(`plan: ${s.length} steps`)} />
        </Cell>
        <Cell name="CheckpointRewind" wide>
          <CheckpointRewind headingLevel={4} onRewind={(id) => setLog(`rewind: ${id}`)} checkpoints={[{ id: 'now', label: 'Now' }, { id: 'start', label: 'Start', time: '00:00', undoes: { steps: ['Patch the deploy config'] } }]} />
        </Cell>
        <Cell name="PermissionLedger" wide>
          <PermissionLedger headingLevel={4} permissions={permissions} onRevoke={(id) => setPermissions((p) => p.map((x) => (x.id === id ? { ...x, revoked: true } : x)))} />
        </Cell>
        <Cell name="Simulated run" wide>
          <StatusDot status={run.status === 'completed' ? 'done' : run.status === 'waiting' ? 'waiting' : 'running'}>Run is {run.status}</StatusDot>
          <div style={{ height: 300 }}>
            <RunTimeline steps={timelineSteps(run)} />
          </div>
          {approval && (
            <ApprovalPrompt
              action={approval.action}
              target={approval.target}
              risk={approval.risk}
              reason={approval.reason}
              autoFocus={false}
              headingLevel={4}
              onAllow={(scope) => sim.respond({ type: 'approval.resolved', approvalId: approval.id, decision: scope === 'once' ? 'allow-once' : 'always-allow' })}
              onDeny={() => sim.respond({ type: 'approval.resolved', approvalId: approval.id, decision: 'deny' })}
            />
          )}
        </Cell>
      </div>
    </main>
  );
}
