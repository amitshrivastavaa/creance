import { Badge, Button, useAgentRun, type RunState } from 'creance';
import { deployFix, useSimulator, type UseSimulatorResult } from 'creance/simulator';
import type { ReactNode } from 'react';

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
