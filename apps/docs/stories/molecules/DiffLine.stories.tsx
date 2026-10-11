import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiffLine } from '@creance-ui/react';

const meta = {
  title: 'Molecules/DiffLine',
  component: DiffLine,
  tags: ['autodocs'],
  args: { type: 'context', content: '  timeout: 30', oldNumber: 12, newNumber: 12 },
} satisfies Meta<typeof DiffLine>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Context: Story = {};
export const Added: Story = { args: { type: 'add', content: '  retries: 3', oldNumber: undefined, newNumber: 13 } };
export const Removed: Story = { args: { type: 'remove', content: '  retries: 0', oldNumber: 13, newNumber: undefined } };

export const Sequence: Story = {
  render: () => (
    <div>
      <DiffLine type="context" content="deploy:" oldNumber={11} newNumber={11} />
      <DiffLine type="context" content="  timeout: 30" oldNumber={12} newNumber={12} />
      <DiffLine type="remove" content="  retries: 0" oldNumber={13} />
      <DiffLine type="add" content="  retries: 3" newNumber={13} />
      <DiffLine type="add" content="  backoff: exponential" newNumber={14} />
    </div>
  ),
};
