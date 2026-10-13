// The adapter: the only Creance-specific glue. It reads useChat's messages and returns the Creance events
// that describe the same run, so useAgentRun and every agent component can show it.
// Pure apart from first-seen timestamps, so it is safe to call on every render.
import type { AgentEvent, AgentEventBody, DiffHunk, Risk } from '@creance-ui/react';
import { getToolName, isToolUIPart, type ChatStatus, type UIMessage } from 'ai';

export type Message = UIMessage<{ tokens?: number }>;

interface Options {
  status: ChatStatus;
  /** The person stopped the run with the kill switch. */
  stopped?: boolean;
  error?: Error | undefined;
  agent?: { id: string; name: string };
  /** Token budget shown in the run's meter. */
  budget?: number;
}

/** What each tool looks like in the timeline and, if it needs approval, in the prompt. */
const describe: Record<string, (input: Record<string, string>) => { title: string; action?: string; target?: string; risk?: Risk }> = {
  list_files: () => ({ title: 'List the project files' }),
  read_file: (i) => ({ title: `Read ${i.path}` }),
  run_tests: () => ({ title: 'Run the build and deploy checks' }),
  install_package: (i) => ({ title: `Install ${i.name}`, action: `npm install ${i.name}@${i.version}`, target: 'web/package.json', risk: 'medium' }),
  write_file: (i) => ({ title: `Edit ${i.path}`, target: i.path, risk: 'low' }),
};

// When each event was first seen. The AI SDK's parts carry no timestamps, and durations should be real.
const seen = new Map<string, number>();
const at = (key: string) => {
  if (!seen.has(key)) seen.set(key, Date.now());
  return seen.get(key)!;
};

export function toAgentEvents(messages: Message[], { status, stopped, error, agent = { id: 'claude', name: 'Claude' }, budget = 200_000 }: Options): AgentEvent[] {
  const goal = messages.find((m) => m.role === 'user');
  if (!goal) return [];
  const runId = goal.id;
  const events: AgentEvent[] = [];
  const emit = (key: string, body: AgentEventBody) => events.push({ ...body, runId, ts: at(`${runId}:${key}`) } as AgentEvent);

  emit('start', { type: 'run.started', agent, goal: textOf(goal), budget: { limit: budget, unit: 'tokens' } });
  // The latest contents of each file the agent has read or written, to diff proposed writes against.
  const known: Record<string, string> = {};
  let step: string | undefined;
  let tokens = 0;
  let summary = '';
  let open = false;
  const endStep = () => {
    if (step) emit(`${step}:end`, { type: 'step.completed', stepId: step });
    step = undefined;
  };

  for (const message of messages.filter((m) => m.role === 'assistant')) {
    tokens += message.metadata?.tokens ?? 0;
    for (const part of message.parts) {
      if (part.type === 'step-start') endStep();
      if (part.type === 'text' && part.text.trim()) summary = part.text;
      if (!isToolUIPart(part) || part.state === 'input-streaming') continue;

      const tool = getToolName(part);
      const input = (part.input ?? {}) as Record<string, string>;
      const about = (describe[tool] ?? (() => ({ title: tool })))(input);
      const callId = part.toolCallId;
      if (!step) {
        step = `step:${callId}`;
        emit(step, { type: 'step.started', stepId: step, title: about.title });
      }
      emit(callId, { type: 'tool.call.started', callId, stepId: step, tool, input, attempt: 1 });

      const approval = part.approval;
      if (approval && !approval.isAutomatic) {
        const answered = approval.approved !== undefined;
        if (!answered) open = true;
        if (tool === 'write_file') {
          // A proposed write is reviewed as a diff: applying it approves the call, rejecting it denies it.
          const hunks = lineDiff(known[input.path!] ?? '', input.content ?? '', approval.id);
          emit(`${approval.id}:diff`, { type: 'diff.proposed', diffId: approval.id, stepId: step, file: input.path!, hunks });
          if (answered) {
            const ids = hunks.map((h) => h.id);
            emit(`${approval.id}:diff-end`, { type: 'diff.resolved', diffId: approval.id, accepted: approval.approved ? ids : [], rejected: approval.approved ? [] : ids });
          }
        } else {
          emit(`${approval.id}:ask`, {
            type: 'approval.requested',
            approvalId: approval.id,
            stepId: step,
            action: about.action ?? tool,
            target: about.target,
            risk: about.risk ?? 'medium',
            reason: input.reason ?? approval.requestReason ?? `${agent.name} wants to run ${tool}.`,
          });
          if (answered) emit(`${approval.id}:answer`, { type: 'approval.resolved', approvalId: approval.id, decision: approval.approved ? 'allow-once' : 'deny' });
        }
      }

      if (part.state === 'output-available') {
        emit(`${callId}:end`, { type: 'tool.call.completed', callId, output: part.output });
        if (tool === 'read_file' && typeof part.output === 'string') known[input.path!] = part.output;
        if (tool === 'write_file') known[input.path!] = input.content!;
      }
      if (part.state === 'output-error') emit(`${callId}:end`, { type: 'tool.call.failed', callId, error: part.errorText, retryable: false });
      if (part.state === 'output-denied') emit(`${callId}:end`, { type: 'tool.call.failed', callId, error: 'Denied by you', retryable: false });
    }
  }

  if (tokens) emit(`usage:${tokens}`, { type: 'usage', tokens });
  if (stopped) {
    emit('stopped', { type: 'run.failed', error: 'Stopped by you' });
  } else if (error) {
    emit('error', { type: 'run.failed', error: error.message });
  } else if (status === 'ready' && !open && messages.at(-1)?.role === 'assistant') {
    endStep();
    emit('done', { type: 'run.completed' });
    emit('handoff', { type: 'handoff', summary, nextActions: [{ id: 'again', label: 'Run it again', primary: true }] });
  }
  return events;
}

const textOf = (m: Message) => m.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');

/** A line diff as Creance hunks: longest common subsequence over lines, with three lines of context. */
export function lineDiff(before: string, after: string, id = 'diff'): DiffHunk[] {
  const a = before === '' ? [] : before.replace(/\n$/, '').split('\n');
  const b = after.replace(/\n$/, '').split('\n');
  // ponytail: O(n·m) table, fine for the small files an agent proposes; use a Myers diff for large files.
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) lcs[i]![j] = a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);

  type Line = DiffHunk['lines'][number];
  const lines: Line[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) lines.push({ type: 'context', content: a[i++]!, oldNumber: i, newNumber: ++j });
    // Removals before additions, as diffs are usually read.
    else if (i < a.length && (j >= b.length || lcs[i + 1]![j]! >= lcs[i]![j + 1]!)) lines.push({ type: 'remove', content: a[i++]!, oldNumber: i });
    else lines.push({ type: 'add', content: b[j++]!, newNumber: j });
  }

  // Group changes, with up to three unchanged lines around each, into hunks.
  const hunks: DiffHunk[] = [];
  const changed = lines.map((l, k) => (l.type === 'context' ? -1 : k)).filter((k) => k >= 0);
  let k = 0;
  while (k < changed.length) {
    let end = k;
    while (end + 1 < changed.length && changed[end + 1]! - changed[end]! <= 7) end++;
    const from = Math.max(0, changed[k]! - 3);
    const to = Math.min(lines.length, changed[end]! + 4);
    const slice = lines.slice(from, to);
    const oldStart = slice.find((l) => l.oldNumber)?.oldNumber ?? 0;
    const newStart = slice.find((l) => l.newNumber)?.newNumber ?? 0;
    const oldCount = slice.filter((l) => l.type !== 'add').length;
    const newCount = slice.filter((l) => l.type !== 'remove').length;
    hunks.push({ id: `${id}:${hunks.length}`, header: `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`, lines: slice });
    k = end + 1;
  }
  return hunks;
}
