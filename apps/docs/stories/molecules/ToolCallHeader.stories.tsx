import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToolCallHeader } from 'creance';

const meta = {
  title: 'Molecules/ToolCallHeader',
  component: ToolCallHeader,
  tags: ['autodocs'],
  args: { tool: 'run_tests', status: 'success', startedAt: 0, endedAt: 8_300 },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
} satisfies Meta<typeof ToolCallHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
export const Pending: Story = { args: { status: 'pending' } };
export const Running: Story = { render: (args) => <ToolCallHeader {...args} startedAt={Date.now() - 3_000} endedAt={undefined} status="running" /> };
export const Error: Story = { args: { status: 'error', endedAt: 2_100 } };
export const Retried: Story = { args: { attempt: 2 } };
