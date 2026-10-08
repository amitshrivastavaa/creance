import {
  AgentHandoffBanner,
  AgentRunLayout,
  ApprovalPrompt,
  Button,
  DiffReview,
  FleetSky,
  NeedsYouInbox,
  RunTimeline,
  ToolCallCard,
  inboxItems,
  skyAgent,
  timelineSteps,
  useAgentRun,
  type InboxItem,
} from 'creance';
import { deployFix, useSimulator } from 'creance/simulator';
import { useState } from 'react';
import { otherAgents, otherSkyAgents } from './otherAgents';

const speeds = [1, 2, 4] as const;

export function App() {
  const [speed, setSpeed] = useState<number>(1);
  const [runKey, setRunKey] = useState(0);
  return (
    <Run
      key={`${runKey}:${speed}`}
      speed={speed}
      onSpeedChange={setSpeed}
      onRestart={() => setRunKey((k) => k + 1)}
    />
  );
}

function Run({ speed, onSpeedChange, onRestart }: { speed: number; onSpeedChange: (s: number) => void; onRestart: () => void }) {
  const sim = useSimulator(deployFix, { speed, autoplay: true });
  const run = useAgentRun(sim.events);
  const [selectedCallId, setSelectedCallId] = useState<string>();
  const [inboxOpen, setInboxOpen] = useState(false);
  const [note, setNote] = useState('');
  const [openedAt] = useState(Date.now);

  const approval = run.approvals.find((a) => !a.decision);
  const diff = run.diffs.find((d) => !d.resolution);
  const calls = Object.values(run.toolCalls);
  const latestCall = calls.reduce<(typeof calls)[number] | undefined>((a, c) => (!a || c.startedAt >= a.startedAt ? c : a), undefined);
  const call = (selectedCallId && run.toolCalls[selectedCallId]) || latestCall;
  const denied = run.approvals.some((a) => a.decision === 'deny');
  const inbox = [...inboxItems(run), ...otherAgents(openedAt)];

  function openInboxItem(item: InboxItem) {
    setInboxOpen(false);
    if (!item.id.startsWith(`${run.runId}:`)) {
      setNote(`In a real app, "${item.title}" would open ${item.agentName}'s run. This demo only simulates Deploy Fixer.`);
    }
  }

  return (
    <>
      <aside className="demo-note" aria-label="About this demo">
        A simulated agent run. Nothing is installed, edited or deployed. Built only from <code>creance</code> components.
      </aside>
      <div className="demo-sky">
        <FleetSky
          agents={[...(run.runId ? [skyAgent(run)] : []), ...otherSkyAgents]}
          onSelect={(id) => {
            if (id !== run.runId) setNote('In a real app, this would open that agent\'s run. This demo only simulates Deploy Fixer.');
          }}
        />
      </div>
      <AgentRunLayout
        agentName={run.agent?.name ?? 'Deploy Fixer'}
        goal={run.goal}
        status={run.status}
        startedAt={run.startedAt}
        endedAt={run.endedAt}
        budget={run.budget && { used: run.usage.tokens, limit: run.budget.limit, unit: run.budget.unit }}
        inbox={<NeedsYouInbox items={inbox} onOpen={openInboxItem} headingLevel={2} />}
        inboxCount={inbox.length}
        inboxOpen={inboxOpen}
        onInboxOpenChange={setInboxOpen}
        actions={
          <div className="demo-sim" role="group" aria-label="Simulation">
            {sim.state === 'paused' ? (
              <Button size="sm" onClick={sim.start}>Resume</Button>
            ) : (
              <Button size="sm" onClick={sim.pause} disabled={sim.state !== 'playing'}>Pause</Button>
            )}
            <Button size="sm" onClick={onRestart}>Restart</Button>
            <label className="demo-speed">
              Speed
              <select value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}>
                {speeds.map((s) => (
                  <option key={s} value={s}>{s}×</option>
                ))}
              </select>
            </label>
          </div>
        }
        banner={
          run.handoff && (
            <AgentHandoffBanner
              agentName={run.agent?.name ?? 'Agent'}
              summary={run.handoff.summary}
              actions={run.handoff.nextActions}
              outcome={denied ? 'stopped' : 'completed'}
              onAction={(id) => {
                const action = run.handoff?.nextActions.find((a) => a.id === id);
                setNote(`In a real app, "${action?.label}" would continue from here. Restart to watch the run again.`);
              }}
            />
          )
        }
        timeline={
          <RunTimeline
            steps={timelineSteps(run)}
            onSelectToolCall={setSelectedCallId}
            selectedToolCallId={call?.id}
            emptyText="Starting the agent…"
          />
        }
        detail={
          <>
            {approval && (
              <ApprovalPrompt
                key={approval.id}
                agentName={run.agent?.name}
                action={approval.action}
                target={approval.target}
                risk={approval.risk}
                reason={approval.reason}
                headingLevel={2}
                onAllow={(scope) =>
                  sim.respond({ type: 'approval.resolved', approvalId: approval.id, decision: scope === 'once' ? 'allow-once' : 'always-allow' })
                }
                onDeny={() => sim.respond({ type: 'approval.resolved', approvalId: approval.id, decision: 'deny' })}
              />
            )}
            {diff && !approval && (
              <DiffReview
                key={diff.id}
                file={diff.file}
                hunks={diff.hunks}
                headingLevel={2}
                description="Raise deploy retries so a flaky registry does not fail the whole deploy, and install from the lockfile."
                onApply={({ accepted, rejected }) => sim.respond({ type: 'diff.resolved', diffId: diff.id, accepted, rejected })}
              />
            )}
            {call ? (
              <ToolCallCard
                key={call.id}
                tool={call.tool}
                status={call.status}
                input={call.input}
                output={call.output}
                error={call.error}
                startedAt={call.startedAt}
                endedAt={call.endedAt}
                attempt={call.attempt}
                previousAttempts={call.attempts.slice(0, -1)}
                headingLevel={2}
                announce={false}
                defaultOpen
              />
            ) : (
              <p className="demo-empty">Tool calls appear here as the agent makes them. Select one in the timeline to inspect it.</p>
            )}
          </>
        }
      />
      <footer className="demo-status">
        <p role="status">{note}</p>
      </footer>
    </>
  );
}
