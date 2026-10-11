import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from '@creance-ui/react';

const meta = {
  title: 'Atoms/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  args: { label: 'Run progress', value: 40 },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
} satisfies Meta<typeof ProgressBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Warning: Story = { args: { value: 85, tone: 'warning' } };
export const Danger: Story = { args: { value: 100, tone: 'danger' } };
export const Indeterminate: Story = { args: { value: undefined, label: 'Waiting for agent' } };
