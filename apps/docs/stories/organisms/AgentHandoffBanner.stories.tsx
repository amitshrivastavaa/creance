import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentHandoffBanner } from 'creance';
import { fn } from 'storybook/test';
import { LiveRun, WaitingControls } from '../../src/LiveRun';

const meta = {
  title: 'Organisms/AgentHandoffBanner',
  component: AgentHandoffBanner,
  args: {
    agentName: 'Deploy Fixer',
    summary:
      'The deploy is fixed. I added the missing zod dependency and updated deploy/config.yaml as you reviewed it. All 42 tests pass and the production build succeeds. Nothing has been deployed yet.',
    actions: [
      { id: 'open-pr', label: 'Open pull request', primary: true },
      { id: 'redeploy', label: 'Re-run deploy' },
      { id: 'view-logs', label: 'View run logs' },
    ],
    onAction: fn(),
    focusOnMount: false,
  },
  decorators: [(Story) => <div style={{ maxWidth: 720 }}><Story /></div>],
} satisfies Meta<typeof AgentHandoffBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Completed: Story = {};
export const Stopped: Story = {
  args: {
    outcome: 'stopped',
    summary: 'Stopped before installing zod. The deploy is still failing: server/validate.ts imports zod, which is not in dependencies.',
    actions: [
      { id: 'install-manually', label: 'Install it myself', primary: true },
      { id: 'view-logs', label: 'View run logs' },
    ],
  },
};
export const Failed: Story = {
  args: { outcome: 'failed', summary: 'Ran out of token budget while verifying. Tests were passing at the last checkpoint.', actions: [{ id: 'resume', label: 'Resume with more budget', primary: true }] },
};

/** Live: the banner appears when the run hands back. Deny the approval to see the "stopped" version. */
export const Live: Story = {
  render: () => (
    <LiveRun speed={8}>
      {(run, sim) =>
        run.handoff ? (
          <AgentHandoffBanner
            agentName={run.agent?.name ?? 'Agent'}
            summary={run.handoff.summary}
            actions={run.handoff.nextActions}
            outcome={run.steps.install?.status === 'failed' ? 'stopped' : 'completed'}
            focusOnMount={false}
          />
        ) : (
          <>
            <p className="live__empty">The agent is working. The banner appears when it hands back.</p>
            <WaitingControls run={run} sim={sim} />
          </>
        )
      }
    </LiveRun>
  ),
};
