'use client';
// Uses only what `shadcn add` installed: three components and the agent event model.
import { useState } from 'react';
import { ApprovalPrompt } from '~/components/creance/approval-prompt/ApprovalPrompt';
import { Chat, type ChatMessage } from '~/components/creance/chat/Chat';
import { RunTimeline } from '~/components/creance/run-timeline/RunTimeline';
import type { AgentEvent } from '~/lib/creance/events';
import { timelineSteps, useAgentRun } from '~/lib/creance/run';

const events: AgentEvent[] = [
  { type: 'run.started', runId: 'r1', ts: 0, agent: { id: 'a1', name: 'Deploy Fixer' }, goal: 'Fix the failing deploy' },
  { type: 'step.started', runId: 'r1', ts: 1000, stepId: 's1', title: 'Read the build log' },
  { type: 'tool.call.started', runId: 'r1', ts: 1000, callId: 'c1', stepId: 's1', tool: 'read_logs', input: {}, attempt: 1 },
  { type: 'tool.call.completed', runId: 'r1', ts: 2000, callId: 'c1', output: 'Cannot find module zod' },
  { type: 'step.completed', runId: 'r1', ts: 2000, stepId: 's1' },
];

export default function Page() {
  const run = useAgentRun(events);
  const [decision, setDecision] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'm1', from: 'assistant', content: 'The build needs zod. May I install it?' }]);
  return (
    <main style={{ display: 'grid', gap: 24, maxWidth: 760, margin: '0 auto', padding: 32 }}>
      <h1>Installed from the registry</h1>
      <RunTimeline steps={timelineSteps(run)} />
      <ApprovalPrompt
        agentName="Deploy Fixer"
        action="npm install zod@3"
        target="web/package.json"
        risk="medium"
        reason="zod is imported but missing, so the deploy fails."
        headingLevel={2}
        autoFocus={false}
        onAllow={() => setDecision('Allowed')}
        onDeny={() => setDecision('Denied')}
      />
      <p role="status" aria-label="Decision">
        {decision}
      </p>
      <Chat agentName="Deploy Fixer" messages={messages} onSend={(text) => setMessages((m) => [...m, { id: `m${m.length + 1}`, from: 'user', content: text }])} height={320} />
    </main>
  );
}
