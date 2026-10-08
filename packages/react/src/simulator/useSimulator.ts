import { useCallback, useEffect, useState } from 'react';
import type { AgentEvent } from '../events';
import { createSimulator, type Scenario, type Simulator, type SimulatorOptions, type SimulatorState } from './createSimulator';

export interface UseSimulatorResult {
  events: AgentEvent[];
  state: SimulatorState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  respond: Simulator['respond'];
}

/** Runs a scenario and collects its events, ready for `useAgentRun(events)`. */
export function useSimulator(
  scenario: Scenario,
  { autoplay = false, ...options }: SimulatorOptions & { autoplay?: boolean } = {},
): UseSimulatorResult {
  // Created once: changing scenario or options later has no effect. Remount (change `key`) to restart with new ones.
  const [sim] = useState(() => createSimulator(scenario, options));
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [state, setState] = useState<SimulatorState>(sim.state);

  useEffect(() => {
    const offEvent = sim.subscribe((e) => setEvents((prev) => [...prev, e]));
    const offState = sim.onStateChange(setState);
    if (autoplay) sim.start();
    return () => {
      offEvent();
      offState();
      sim.reset();
    };
  }, [sim, autoplay]);

  const reset = useCallback(() => {
    sim.reset();
    setEvents([]);
  }, [sim]);

  return { events, state, start: sim.start, pause: sim.pause, reset, respond: sim.respond };
}
