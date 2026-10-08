import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { AgentEvent } from '../events';
import { initialRunState, reduceRun } from '../run/reduceRun';
import { createSimulator, scenarioEvents, type Scenario } from './createSimulator';
import { deployFix } from './scenarios/deployFix';

beforeEach(() => vi.useFakeTimers({ now: 0 }));
afterEach(() => vi.useRealTimers());

const script: Scenario = [
  { after: 0, event: { type: 'run.started', agent: { id: 'a', name: 'A' }, goal: 'g' } },
  { after: 100, event: { type: 'approval.requested', approvalId: 'x', action: 'rm -rf', risk: 'high', reason: 'r' } },
  { waitFor: 'approval.resolved', id: 'x', ifDenied: [{ after: 50, event: { type: 'run.failed', error: 'denied' } }] },
  { after: 100, event: { type: 'run.completed' } },
];

function record(scenario: Scenario, speed = 1) {
  const sim = createSimulator(scenario, { speed });
  const events: AgentEvent[] = [];
  sim.subscribe((e) => events.push(e));
  return { sim, events, types: () => events.map((e) => e.type) };
}

test('plays with timing, blocks on a wait step, and continues after the answer', () => {
  const { sim, types } = record(script);
  sim.start();
  vi.advanceTimersByTime(100);
  expect(types()).toEqual(['run.started', 'approval.requested']);
  expect(sim.state).toBe('waiting');

  vi.advanceTimersByTime(10_000);
  expect(types()).toHaveLength(2);

  sim.respond({ type: 'approval.resolved', approvalId: 'x', decision: 'allow-once' });
  vi.advanceTimersByTime(100);
  expect(types()).toEqual(['run.started', 'approval.requested', 'approval.resolved', 'run.completed']);
  expect(sim.state).toBe('done');
});

test('a denial plays the ifDenied branch', () => {
  const { sim, types } = record(script);
  sim.start();
  vi.advanceTimersByTime(100);
  sim.respond({ type: 'approval.resolved', approvalId: 'x', decision: 'deny' });
  vi.advanceTimersByTime(1_000);
  expect(types().at(-1)).toBe('run.failed');
});

test('pause keeps the remaining delay; speed scales it', () => {
  const { sim, types } = record(script, 2);
  sim.start();
  vi.advanceTimersByTime(20);
  sim.pause();
  vi.advanceTimersByTime(1_000);
  expect(types()).toEqual(['run.started']);
  sim.start();
  vi.advanceTimersByTime(29);
  expect(types()).toHaveLength(1);
  vi.advanceTimersByTime(1);
  expect(types()).toHaveLength(2);
});

test('an early answer releases the wait step when it is reached', () => {
  const { sim, types } = record(script);
  sim.respond({ type: 'approval.resolved', approvalId: 'x', decision: 'allow-once' });
  sim.start();
  vi.advanceTimersByTime(1_000);
  expect(types().at(-1)).toBe('run.completed');
});

test('the deploy scenario plays end to end into a completed run with a handoff', () => {
  const { sim, events } = record(deployFix, 100);
  sim.start();
  vi.advanceTimersByTime(60_000);
  sim.respond({ type: 'approval.resolved', approvalId: 'install-zod', decision: 'allow-once' });
  vi.advanceTimersByTime(60_000);
  sim.respond({ type: 'diff.resolved', diffId: 'config-diff', accepted: ['retries', 'install-step'], rejected: [] });
  vi.advanceTimersByTime(60_000);

  const state = events.reduce(reduceRun, initialRunState);
  expect(state.status).toBe('completed');
  expect(state.handoff?.nextActions[0]?.id).toBe('open-pr');
  expect(state.toolCalls['run-tests']).toMatchObject({ status: 'success', attempt: 2 });
  expect(state.steps.verify?.childIds).toEqual(['verify-tests', 'verify-build']);
});

test('scenarioEvents stamps deterministic timestamps and skips waits', () => {
  const events = scenarioEvents(script, { start: 1_000 });
  expect(events.map((e) => [e.type, e.ts])).toEqual([
    ['run.started', 1_000],
    ['approval.requested', 1_100],
    ['run.completed', 1_200],
  ]);
});
