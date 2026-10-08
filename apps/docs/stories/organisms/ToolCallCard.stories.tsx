import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToolCallCard } from 'creance';
import { fn } from 'storybook/test';
import { LiveRun, WaitingControls } from '../../src/LiveRun';

const meta = {
  title: 'Organisms/ToolCallCard',
  component: ToolCallCard,
  args: {
    tool: 'run_tests',
    status: 'success',
    input: { suite: 'deploy', ci: true },
    output: { passed: 41, failed: 1, failing: ['build > resolves runtime dependencies'] },
    startedAt: 0,
    endedAt: 2_600,
  },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
} satisfies Meta<typeof ToolCallCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
export const Pending: Story = { args: { status: 'pending', startedAt: undefined, endedAt: undefined } };
export const Running: Story = {
  render: (args) => <ToolCallCard {...args} status="running" startedAt={Date.now() - 4_000} endedAt={undefined} />,
};
export const Error: Story = {
  args: {
    status: 'error',
    endedAt: 2_200,
    error: 'ECONNRESET: request to registry.npmjs.org timed out after 10s',
    onRetry: fn(),
  },
};
/** The second attempt after a failure. */
export const Retried: Story = { args: { attempt: 2 } };
export const InputOpen: Story = { args: { defaultOpen: true } };

/** Live: every tool call of the simulated run, including a failure and the agent's automatic retry. */
export const Live: Story = {
  render: () => (
    <LiveRun>
      {(run, sim) => {
        const calls = Object.values(run.toolCalls);
        if (!calls.length) return <p className="live__empty">No tool calls yet.</p>;
        return (
          <div className="stack">
            {calls.map((c) => (
              <ToolCallCard
                key={c.id}
                tool={c.tool}
                status={c.status}
                input={c.input}
                output={c.output}
                error={c.error}
                startedAt={c.startedAt}
                endedAt={c.endedAt}
                attempt={c.attempt}
              />
            ))}
            <WaitingControls run={run} sim={sim} />
          </div>
        );
      }}
    </LiveRun>
  ),
};
