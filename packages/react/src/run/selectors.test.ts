import { expect, test } from 'vitest';
import { scenarioEvents } from '../simulator/createSimulator';
import { deployFix } from '../simulator/scenarios/deployFix';
import { initialRunState, reduceRun } from './reduceRun';
import { inboxItems, timelineSteps } from './selectors';

const events = scenarioEvents(deployFix);
const upTo = (type: string) => events.slice(0, events.findIndex((e) => e.type === type) + 1).reduce(reduceRun, initialRunState);

test('a step with an open approval shows as waiting, and the approval is an inbox item', () => {
  const state = upTo('approval.requested');
  const install = timelineSteps(state).find((s) => s.id === 'install');
  expect(install?.status).toBe('waiting');
  expect(inboxItems(state)).toMatchObject([{ kind: 'approval', title: 'Allow npm install zod@3?', urgency: 'normal' }]);
});

test('nested steps and tool calls map into the timeline', () => {
  const state = events.reduce(reduceRun, initialRunState);
  const verify = timelineSteps(state).find((s) => s.id === 'verify');
  expect(verify?.children?.map((c) => c.id)).toEqual(['verify-tests', 'verify-build']);
  const investigate = timelineSteps(state)[0];
  expect(investigate?.toolCalls?.map((c) => [c.tool, c.status, c.attempt])).toEqual([
    ['read_logs', 'success', 1],
    ['run_tests', 'success', 2],
  ]);
});
