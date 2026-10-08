import { useMemo } from 'react';
import type { AgentEvent } from '../events';
import { initialRunState, reduceRun, type RunState } from './reduceRun';

/**
 * Reduces an event stream into `RunState`. Pass the events you have received so far; append new ones
 * by passing a new array. Works with any source: SSE, WebSocket, a log replay or the simulator.
 */
export function useAgentRun(events: readonly AgentEvent[]): RunState {
  // ponytail: re-reduces the whole stream on each change. Fine for hundreds of events;
  // switch to an incremental reducer (reduce only the new tail) if runs reach tens of thousands.
  return useMemo(() => events.reduce(reduceRun, initialRunState), [events]);
}
