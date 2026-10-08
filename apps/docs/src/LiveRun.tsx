import { Badge, Button, useAgentRun, type RunState } from 'creance';
import { deployFix, useSimulator, type UseSimulatorResult } from 'creance/simulator';
import type { ReactNode } from 'react';

/** Quick answers for whatever the run is waiting on, for stories that show something else. */
export function WaitingControls({ run, sim }: { run: RunState; sim: UseSimulatorResult }) {
  const approval = run.approvals.find((a) => !a.decision);
  const diff = run.diffs.find((d) => !d.resolution);
  if (!approval && !diff) return null;
  return (
    <p className="live__empty">
      {approval ? 'The run is waiting for an approval. ' : 'The run is waiting for a diff review. '}
      {approval && (
        <Button size="sm" onClick={() => sim.respond({ type: 'approval.resolved', approvalId: approval.id, decision: 'allow-once' })}>
          Allow
        </Button>
      )}
      {diff && !approval && (
        <Button
          size="sm"
          onClick={() => sim.respond({ type: 'diff.resolved', diffId: diff.id, accepted: diff.hunks.map((h) => h.id), rejected: [] })}
        >
          Accept all
        </Button>
      )}
    </p>
  );
}

/** Plays the "Fix the failing deploy" scenario and hands the reduced state to `children`. */
export function LiveRun({
  speed = 4,
  children,
}: {
  speed?: number;
  children: (run: RunState, sim: UseSimulatorResult) => ReactNode;
}) {
  const sim = useSimulator(deployFix, { speed, autoplay: true });
  const run = useAgentRun(sim.events);
  return (
    <div className="live">
      <div className="live__bar">
        <span>
          Simulated run <Badge status={sim.state === 'waiting' ? 'waiting' : sim.state === 'done' ? 'done' : 'running'}>{sim.state}</Badge>
        </span>
        <span className="live__controls">
          {sim.state === 'playing' ? (
            <Button size="sm" onClick={sim.pause}>Pause</Button>
          ) : (
            <Button size="sm" onClick={sim.start} disabled={sim.state === 'done' || sim.state === 'waiting'}>Play</Button>
          )}
          <Button size="sm" onClick={() => { sim.reset(); sim.start(); }}>Restart</Button>
        </span>
      </div>
      {children(run, sim)}
    </div>
  );
}
