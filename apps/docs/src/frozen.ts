import type { AgentEvent, AgentEventBody, AgentEventType } from 'creance';
import { deployFix } from 'creance/simulator';

/**
 * The deploy scenario frozen at a point, for static stories and screenshots. Wait steps are answered
 * (allow once, accept every hunk) unless the run stops first. The last event is stamped "now", so
 * durations are stable under a frozen clock.
 */
export function frozenEvents(until?: AgentEventType): AgentEvent[] {
  const bodies: Array<[number, AgentEventBody]> = [];
  let t = 0;
  for (const step of deployFix) {
    if ('waitFor' in step) {
      t += 1_500;
      const body: AgentEventBody =
        step.waitFor === 'approval.resolved'
          ? { type: 'approval.resolved', approvalId: step.id, decision: 'allow-once' }
          : { type: 'diff.resolved', diffId: step.id, accepted: ['retries', 'install-step'], rejected: [] };
      bodies.push([t, body]);
      continue;
    }
    t += step.after;
    bodies.push([t, step.event]);
    if (step.event.type === until) break;
  }
  const now = Date.now();
  const last = t;
  return bodies.map(([at, body]) => ({ ...body, runId: 'run-1', ts: now - (last - at) }) as AgentEvent);
}
