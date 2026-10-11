import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  KillSwitch,
  AgentHandoffBanner,
  AgentRunLayout,
  ApprovalPrompt,
  NeedsYouInbox,
  RunTimeline,
  ToolCallCard,
  inboxItems,
  initialRunState,
  reduceRun,
  timelineSteps,
  type RunState,
} from '@creance-ui/react';
import { frozenEvents } from '../../src/frozen';
import { otherAgents } from '../../src/inboxFixtures';

/** The template filled from a frozen run, the way an app would wire it. */
function Screen({ run }: { run: RunState }) {
  const approval = run.approvals.find((a) => !a.decision);
  const call = run.toolCalls['run-tests'];
  const inbox = [...inboxItems(run), ...otherAgents];
  return (
    <AgentRunLayout
      agentName={run.agent?.name ?? 'Agent'}
      goal={run.goal}
      status={run.status}
      startedAt={run.startedAt}
      endedAt={run.endedAt}
      budget={run.budget && { used: run.usage.tokens, limit: run.budget.limit, unit: run.budget.unit }}
      inbox={<NeedsYouInbox items={inbox} />}
      inboxCount={inbox.length}
      actions={
        (run.status === 'running' || run.status === 'waiting') && (
          <KillSwitch compact onStop={() => {}} description={`Stops ${run.agent?.name ?? 'the agent'} after its current call. Press and hold for 1 second.`} />
        )
      }
      banner={
        run.handoff && (
          <AgentHandoffBanner agentName={run.agent?.name ?? 'Agent'} summary={run.handoff.summary} actions={run.handoff.nextActions} focusOnMount={false} />
        )
      }
      timeline={<RunTimeline steps={timelineSteps(run)} selectedToolCallId="run-tests" onSelectToolCall={() => {}} />}
      detail={
        <>
          {approval && (
            <ApprovalPrompt
              autoFocus={false}
              agentName={run.agent?.name}
              action={approval.action}
              target={approval.target}
              risk={approval.risk}
              reason={approval.reason}
              headingLevel={2}
            />
          )}
          {call && (
            <ToolCallCard
              tool={call.tool}
              status={call.status}
              input={call.input}
              output={call.output}
              startedAt={call.startedAt}
              endedAt={call.endedAt}
              attempt={call.attempt}
              headingLevel={2}
            />
          )}
        </>
      }
    />
  );
}

const meta = {
  title: 'Templates/AgentRunLayout',
  component: AgentRunLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AgentRunLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

const state = (until?: Parameters<typeof frozenEvents>[0]) => frozenEvents(until).reduce(reduceRun, initialRunState);

/** Paused on an approval: the step waits in the timeline, the prompt is in the detail panel. */
export const WaitingForApproval: Story = {
  args: { agentName: '', status: 'waiting', timeline: null, detail: null },
  render: () => <Screen run={state('approval.requested')} />,
};

/** Finished: the handoff banner spans the top. */
export const Completed: Story = {
  args: { agentName: '', status: 'completed', timeline: null, detail: null },
  render: () => <Screen run={state()} />,
};
