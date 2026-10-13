import { afterEach, describe, expect, it, vi } from 'vitest';
import { lineDiff, toAgentEvents, type Message } from './toAgentEvents';

let n = 0;
const user = (): Message => ({ id: `u${++n}`, role: 'user', parts: [{ type: 'text', text: 'Fix the build.' }] });
const assistant = (parts: unknown[], tokens?: number): Message => ({ id: `a${n}`, role: 'assistant', parts: parts as Message['parts'], metadata: { tokens } });
const tool = (name: string, id: string, state: string, extra: Record<string, unknown> = {}) => ({ type: `tool-${name}`, toolCallId: id, state, input: {}, ...extra });
const types = (messages: Message[], opts: Parameters<typeof toAgentEvents>[1] = { status: 'ready' }) => toAgentEvents(messages, opts).map((e) => e.type);

afterEach(() => vi.useRealTimers());

describe('toAgentEvents', () => {
  it('returns nothing before the first message', () => {
    expect(toAgentEvents([], { status: 'ready' })).toEqual([]);
  });

  it('turns a finished run into a run with steps, tool calls, usage and a handoff', () => {
    const messages = [
      user(),
      assistant(
        [
          { type: 'step-start' },
          tool('run_tests', 'c1', 'output-available', { output: { passed: false } }),
          { type: 'step-start' },
          tool('read_file', 'c2', 'output-available', { input: { path: 'a.txt' }, output: 'x\n' }),
          { type: 'step-start' },
          { type: 'text', text: 'Fixed it.' },
        ],
        900,
      ),
    ];
    expect(types(messages)).toEqual([
      'run.started',
      'step.started',
      'tool.call.started',
      'tool.call.completed',
      'step.completed',
      'step.started',
      'tool.call.started',
      'tool.call.completed',
      'step.completed',
      'usage',
      'run.completed',
      'handoff',
    ]);
    const events = toAgentEvents(messages, { status: 'ready' });
    expect(events.find((e) => e.type === 'handoff')).toMatchObject({ summary: 'Fixed it.' });
    expect(events.find((e) => e.type === 'usage')).toMatchObject({ tokens: 900 });
    expect(events.find((e) => e.type === 'step.started')).toMatchObject({ title: 'Run the build and deploy checks' });
  });

  it('asks for approval, and resolves it once answered', () => {
    const input = { name: 'zod', version: '^3', reason: 'It is imported.' };
    const asking = [user(), assistant([{ type: 'step-start' }, tool('install_package', 'c1', 'approval-requested', { input, approval: { id: 'ap1' } })])];
    const events = toAgentEvents(asking, { status: 'ready' });
    expect(events.find((e) => e.type === 'approval.requested')).toMatchObject({ approvalId: 'ap1', action: 'npm install zod@^3', risk: 'medium', reason: 'It is imported.' });
    // Waiting on a person: neither completed nor resolved.
    expect(events.map((e) => e.type)).not.toContain('run.completed');

    const denied = [asking[0]!, assistant([{ type: 'step-start' }, tool('install_package', 'c1', 'output-denied', { input, approval: { id: 'ap1', approved: false } })])];
    const after = toAgentEvents(denied, { status: 'streaming' });
    expect(after.find((e) => e.type === 'approval.resolved')).toMatchObject({ decision: 'deny' });
    expect(after.find((e) => e.type === 'tool.call.failed')).toMatchObject({ error: 'Denied by you' });
  });

  it('shows a proposed write as a diff against what the agent read', () => {
    const messages = [
      user(),
      assistant([
        { type: 'step-start' },
        tool('read_file', 'c1', 'output-available', { input: { path: 'cfg' }, output: 'a\nretries: 1\nb\n' }),
        { type: 'step-start' },
        tool('write_file', 'c2', 'approval-requested', { input: { path: 'cfg', content: 'a\nretries: 3\nb\n' }, approval: { id: 'ap2' } }),
      ]),
    ];
    const events = toAgentEvents(messages, { status: 'ready' });
    const diff = events.find((e) => e.type === 'diff.proposed');
    expect(diff).toMatchObject({ diffId: 'ap2', file: 'cfg' });
    expect(diff && 'hunks' in diff && diff.hunks[0]!.lines.map((l) => `${l.type}:${l.content}`)).toEqual(['context:a', 'remove:retries: 1', 'add:retries: 3', 'context:b']);
    expect(events.map((e) => e.type)).not.toContain('approval.requested');
  });

  it('ends the run when the person stops it, or when it fails', () => {
    const messages = [user(), assistant([{ type: 'step-start' }, tool('run_tests', 'c1', 'input-available')])];
    expect(toAgentEvents(messages, { status: 'ready', stopped: true }).at(-1)).toMatchObject({ type: 'run.failed', error: 'Stopped by you' });
    expect(toAgentEvents(messages, { status: 'error', error: new Error('Overloaded') }).at(-1)).toMatchObject({ type: 'run.failed', error: 'Overloaded' });
  });

  it('keeps the time each event was first seen, so durations are real and re-renders change nothing', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const start = [user()];
    const first = toAgentEvents(start, { status: 'streaming' });
    vi.setSystemTime(5_000);
    const done = [...start, assistant([{ type: 'step-start' }, { type: 'text', text: 'Done.' }])];
    const events = toAgentEvents(done, { status: 'ready' });
    expect(events[0]).toEqual(first[0]);
    expect(events.find((e) => e.type === 'run.completed')!.ts - events[0]!.ts).toBe(4_000);
  });
});

describe('lineDiff', () => {
  it('numbers lines and groups changes into hunks with context', () => {
    const before = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n');
    const after = before.replace('line 2\n', 'line two\n').replace('line 18', 'line eighteen');
    const hunks = lineDiff(before, after);
    expect(hunks).toHaveLength(2);
    expect(hunks[0]!.header).toBe('@@ -1,5 +1,5 @@');
    expect(hunks[0]!.lines.filter((l) => l.type !== 'context').map((l) => l.content)).toEqual(['line 2', 'line two']);
  });

  it('treats a new file as all additions', () => {
    expect(lineDiff('', 'a\nb\n')[0]!.lines.map((l) => l.type)).toEqual(['add', 'add']);
  });
});
