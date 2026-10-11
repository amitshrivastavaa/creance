import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@creance-ui/react';

const meta = {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'Deploy Fixer' },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Agent: Story = {};
export const Human: Story = { args: { name: 'Priya Nair', kind: 'human' } };
export const Small: Story = { args: { size: 'sm' } };
/** Next to a visible name, mark the avatar decorative so the name isn't read twice. */
export const WithName: Story = {
  render: (args) => (
    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <Avatar {...args} decorative /> {args.name}
    </span>
  ),
};
