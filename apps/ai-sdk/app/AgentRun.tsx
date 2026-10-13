'use client';
// useChat drives a real agent; toAgentEvents and useAgentRun turn its messages into a run the kit can show.
// Every answer goes back through the AI SDK: approvals with addToolApprovalResponse, the kill switch with stop().
import { useChat } from '@ai-sdk/react';
import {
  AgentHandoffBanner,
  AgentRunLayout,
  ApprovalPrompt,
  Button,
  DiffReview,
  KillSwitch,
  RunTimeline,
  ToolCallCard,
  timelineSteps,
  useAgentRun,
} from '@creance-ui/react';
import { DefaultChatTransport, isToolUIPart, lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai';
import { useMemo, useState } from 'react';
import { task } from './task';
import { toAgentEvents, type Message } from './toAgentEvents';

export function AgentRun({ ready, model }: { ready: boolean; model: string }) {
  const [stopped, setStopped] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string>();
  const { messages, sendMessage, addToolApprovalResponse, stop, status, error, setMessages } = useChat<Message>({
    transport: new DefaultChatTransport({ api: '/api/agent' }),
    // Once every approval in the last message has an answer, send them so the agent carries on.
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
  const events = useMemo(() => toAgentEvents(messages, { status, stopped, error }), [messages, status, stopped, error]);
  const run = useAgentRun(events);

  const start = () => {
    setStopped(false);
    setSelectedCallId(undefined);
    setMessages([]);
    void sendMessage({ text: task });
  };
  const approval = run.approvals.find((a) => !a.decision);
  const diff = run.diffs.find((d) => !d.resolution);
  const calls = Object.values(run.toolCalls);
  const call = (selectedCallId && run.toolCalls[selectedCallId]) || calls.at(-1);
  const reasonFor = (approvalId: string) => {
    const part = messages.flatMap((m) => m.parts).find((p) => isToolUIPart(p) && p.approval?.id === approvalId);
    return part && isToolUIPart(part) ? (part.input as { reason?: string }).reason : undefined;
  };

  const note = (
    <aside className="ai-note" aria-label="About this example">
      A real model ({model}) works on a small sample project held in memory. Nothing on your disk changes. Built with the Vercel AI SDK and{' '}
      <code>@creance-ui/react</code>.
    </aside>
  );

  if (!run.runId) {
    return (
      <main className="ai-start">
        {note}
        <h1>Fix a failing build, with a real agent</h1>
        <p>
          The agent is asked: “{task}” It can read files and run checks on its own. It asks you before it installs a package, and shows
          you a diff before it changes a file. You can stop it at any time.
        </p>
        {ready ? (
          <Button variant="primary" onClick={start}>
            Start the agent
          </Button>
        ) : (
          <div className="ai-setup" role="alert">
            <h2>Add an API key to start</h2>
            <p>
              Create <code>apps/ai-sdk/.env.local</code> with <code>ANTHROPIC_API_KEY=…</code>, then restart <code>pnpm dev</code>.
            </p>
          </div>
        )}
      </main>
    );
  }

  return (
    <>
      {note}
      <AgentRunLayout
        agentName={run.agent?.name ?? 'Claude'}
        goal={run.goal}
        status={run.status}
        startedAt={run.startedAt}
        endedAt={run.endedAt}
        budget={run.budget && { used: run.usage.tokens, limit: run.budget.limit, unit: run.budget.unit }}
        actions={
          run.status === 'running' || run.status === 'waiting' ? (
            <KillSwitch
              compact
              onStop={() => {
                setStopped(true);
                void stop();
              }}
              description="It stops before the next step."
            />
          ) : (
            <Button size="sm" onClick={start}>
              Run again
            </Button>
          )
        }
        banner={
          run.handoff ? (
            <AgentHandoffBanner
              agentName={run.agent?.name ?? 'Claude'}
              summary={run.handoff.summary}
              actions={run.handoff.nextActions}
              outcome="completed"
              onAction={start}
            />
          ) : run.status === 'failed' ? (
            <p className="ai-failed" role="alert">
              {stopped ? 'You stopped the agent. Nothing more will run.' : `The run failed: ${error?.message ?? 'unknown error'}`}
            </p>
          ) : undefined
        }
        timeline={<RunTimeline steps={timelineSteps(run)} onSelectToolCall={setSelectedCallId} selectedToolCallId={call?.id} emptyText="Starting the agent…" />}
        detail={
          <>
            {approval && !stopped && (
              <ApprovalPrompt
                key={approval.id}
                agentName={run.agent?.name}
                action={approval.action}
                target={approval.target}
                risk={approval.risk}
                reason={approval.reason}
                allowAlways={false}
                headingLevel={2}
                onAllow={() => void addToolApprovalResponse({ id: approval.id, approved: true })}
                onDeny={() => void addToolApprovalResponse({ id: approval.id, approved: false, reason: 'The person denied it.' })}
              />
            )}
            {diff && !approval && !stopped && (
              <DiffReview
                key={diff.id}
                file={diff.file}
                hunks={diff.hunks}
                description={reasonFor(diff.id)}
                headingLevel={2}
                onApply={({ rejected }) =>
                  void addToolApprovalResponse(
                    rejected.length ? { id: diff.id, approved: false, reason: 'The person rejected this change.' } : { id: diff.id, approved: true },
                  )
                }
              />
            )}
            {call ? (
              <ToolCallCard
                key={call.id}
                tool={call.tool}
                status={call.status}
                input={call.input}
                output={call.output}
                error={call.error}
                startedAt={call.startedAt}
                endedAt={call.endedAt}
                attempt={call.attempt}
                headingLevel={2}
                announce={false}
                defaultOpen
              />
            ) : (
              <p className="ai-empty">Tool calls appear here as the agent makes them.</p>
            )}
          </>
        }
      />
    </>
  );
}
