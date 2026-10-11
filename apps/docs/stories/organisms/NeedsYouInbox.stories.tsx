import type { Meta, StoryObj } from '@storybook/react-vite';
import { NeedsYouInbox, inboxItems } from '@creance-ui/react';
import { fn } from 'storybook/test';
import { NOW, otherAgents } from '../../src/inboxFixtures';
import { LiveRun, WaitingControls } from '../../src/LiveRun';

const meta = {
  title: 'Organisms/NeedsYouInbox',
  component: NeedsYouInbox,
  args: { items: otherAgents, now: NOW, onOpen: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
} satisfies Meta<typeof NeedsYouInbox>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Sorted by urgency, then by who has waited longest. */
export const Default: Story = {};
export const Empty: Story = { args: { items: [] } };
export const ReadOnly: Story = { args: { onOpen: undefined } };

/** Live: the simulated run's approval and review join the inbox when they appear and leave when answered. */
export const Live: Story = {
  render: (args) => (
    <LiveRun>
      {(run, sim) => (
        <>
          <NeedsYouInbox {...args} now={Date.now()} items={[...inboxItems(run), ...otherAgents]} />
          <WaitingControls run={run} sim={sim} />
        </>
      )}
    </LiveRun>
  ),
};
