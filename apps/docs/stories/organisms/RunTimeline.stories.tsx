import type { Meta, StoryObj } from '@storybook/react-vite';
import { RunTimeline, reduceRun, initialRunState, timelineSteps } from '@creance-ui/react';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { frozenEvents } from '../../src/frozen';
import { LiveRun, WaitingControls } from '../../src/LiveRun';

const stateAt = (until?: Parameters<typeof frozenEvents>[0]) => frozenEvents(until).reduce(reduceRun, initialRunState);

const meta = {
  title: 'Organisms/RunTimeline',
  component: RunTimeline,
  args: { steps: [] },
  decorators: [(Story) => <div style={{ height: 420, maxWidth: 560, border: '1px solid var(--cr-color-border-default)', borderRadius: 8 }}><Story /></div>],
} satisfies Meta<typeof RunTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

/** Frozen just after the agent asked for approval: one retried tool call, one step waiting for you. */
export const WaitingForApproval: Story = {
  render: (args) => <RunTimeline {...args} steps={timelineSteps(stateAt('approval.requested'))} />,
};

/** The whole run, with nested verification steps. */
export const Completed: Story = {
  render: (args) => <RunTimeline {...args} steps={timelineSteps(stateAt())} />,
};

export const WithFailure: Story = {
  args: {
    steps: [
      { id: 'a', title: 'Investigate the failed deploy', status: 'done', startedAt: 0, endedAt: 9_400 },
      {
        id: 'b',
        title: 'Run database migration',
        status: 'failed',
        startedAt: 9_400,
        endedAt: 12_000,
        error: 'Migration 042 failed: column "region" already exists',
        toolCalls: [{ id: 'm', tool: 'migrate', status: 'error', startedAt: 9_500, endedAt: 12_000, error: 'exit code 1' }],
      },
    ],
  },
};

/** Tool calls become buttons when you pass onSelectToolCall, for a detail panel. */
export const Selectable: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<string>('run-tests');
    return (
      <RunTimeline
        {...args}
        steps={timelineSteps(stateAt('approval.requested'))}
        selectedToolCallId={selected}
        onSelectToolCall={(id) => {
          setSelected(id);
          args.onSelectToolCall?.(id);
        }}
      />
    );
  },
  args: { onSelectToolCall: fn() },
};

/** Live: steps stream in and the timeline follows. Scroll up to stop following; "Jump to latest" brings you back. */
export const Live: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <LiveRun>
      {(run, sim) => (
        <>
          <div style={{ height: 320, border: '1px solid var(--cr-color-border-default)', borderRadius: 8 }}>
            <RunTimeline steps={timelineSteps(run)} />
          </div>
          <WaitingControls run={run} sim={sim} />
        </>
      )}
    </LiveRun>
  ),
};
