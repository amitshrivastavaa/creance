import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiffReview, type DiffHunk } from '@creance-ui/react';
import { deployFix } from '@creance-ui/react/simulator';
import { fn } from 'storybook/test';
import { LiveRun, WaitingControls } from '../../src/LiveRun';

const proposed = deployFix.flatMap((s) => ('event' in s && s.event.type === 'diff.proposed' ? [s.event] : []))[0]!;
const hunks: DiffHunk[] = proposed.hunks;

const meta = {
  title: 'Organisms/DiffReview',
  component: DiffReview,
  args: {
    file: proposed.file,
    hunks,
    description: 'Raise deploy retries so a flaky registry does not fail the whole deploy, and install from the lockfile.',
    onApply: fn(),
  },
  decorators: [(Story) => <div style={{ maxWidth: 720 }}><Story /></div>],
} satisfies Meta<typeof DiffReview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Accept or reject each hunk, or use J / K to move and Y / N to decide. */
export const Default: Story = {};
export const Applied: Story = { args: { applied: { accepted: ['retries'], rejected: ['install-step'] } } };
export const SingleHunk: Story = { args: { hunks: hunks.slice(0, 1) } };

/** Live: the agent proposes a config change and waits. Applying lets the run continue. */
export const Live: Story = {
  render: () => (
    <LiveRun>
      {(run, sim) => {
        const diff = run.diffs.at(-1);
        if (!diff) {
          return (
            <>
              <p className="live__empty">The agent will propose a config change after it installs the dependency.</p>
              <WaitingControls run={run} sim={sim} />
            </>
          );
        }
        return (
          <DiffReview
            file={diff.file}
            hunks={diff.hunks}
            applied={diff.resolution}
            onApply={({ accepted, rejected }) => sim.respond({ type: 'diff.resolved', diffId: diff.id, accepted, rejected })}
          />
        );
      }}
    </LiveRun>
  ),
};
