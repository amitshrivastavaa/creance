import type { Meta, StoryObj } from '@storybook/react-vite';
import { FleetSky, skyAgent, type SkyAgent } from '@creance-ui/react';
import { fn } from 'storybook/test';
import { LiveRun, WaitingControls } from '../../src/LiveRun';

const others: SkyAgent[] = [
  { id: 'docs', name: 'Docs Writer', status: 'running', detail: '4 steps in' },
  { id: 'data', name: 'Data Loader', status: 'running', detail: '2 steps in' },
  { id: 'upgrade', name: 'Upgrader', status: 'failed', detail: '3 tests failing' },
];

const meta = {
  title: 'Organisms/FleetSky',
  component: FleetSky,
  args: {
    agents: [{ id: 'deploy', name: 'Deploy Fixer', status: 'waiting', detail: 'wants to run npm install zod@3' }, ...others],
    onSelect: fn(),
  },
  decorators: [(Story) => <div style={{ height: 460 }}><Story /></div>],
} satisfies Meta<typeof FleetSky>;
export default meta;
type Story = StoryObj<typeof meta>;

/** One agent has come back with a request: its line is taut and glowing. */
export const NeedsYou: Story = {};

export const AllFlying: Story = {
  args: { agents: others.map((a) => ({ ...a, status: 'running' })) },
};

export const Finished: Story = {
  args: {
    agents: [
      { id: 'deploy', name: 'Deploy Fixer', status: 'done' },
      { id: 'docs', name: 'Docs Writer', status: 'done' },
      { id: 'data', name: 'Data Loader', status: 'running' },
    ],
  },
};

/** Live: Deploy Fixer flies with the others, then returns to you when it needs approval. */
export const Live: Story = {
  decorators: [],
  render: (args) => (
    <LiveRun>
      {(run, sim) => (
        <>
          <div style={{ height: 420 }}>
            <FleetSky {...args} agents={run.runId ? [skyAgent(run), ...others] : others} />
          </div>
          <WaitingControls run={run} sim={sim} />
        </>
      )}
    </LiveRun>
  ),
};
