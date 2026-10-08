import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from 'creance';

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { status: 'running' },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = {};
export const Waiting: Story = { args: { status: 'waiting' } };
export const Blocked: Story = { args: { status: 'blocked' } };
export const Done: Story = { args: { status: 'done' } };
export const Failed: Story = { args: { status: 'failed' } };
export const CustomLabel: Story = { args: { status: 'waiting', children: 'Needs approval' } };

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['running', 'waiting', 'blocked', 'done', 'failed'] as const).map((s) => (
        <Badge key={s} status={s} />
      ))}
    </div>
  ),
};
