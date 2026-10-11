import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge } from '@creance-ui/react';

const meta = {
  title: 'Molecules/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: { status: 'running' },
} satisfies Meta<typeof StatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Ticks once a second while running. */
export const Running: Story = { render: (args) => <StatusBadge {...args} startedAt={Date.now() - 12_000} /> };
export const Done: Story = { args: { status: 'done', startedAt: 0, endedAt: 134_000 } };
export const Failed: Story = { args: { status: 'failed', startedAt: 0, endedAt: 4_200 } };
export const Waiting: Story = { args: { status: 'waiting', label: 'Waiting for you' } };
