import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from '@creance-ui/react';

const meta = {
  title: 'Atoms/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  args: { children: 'A' },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const InText: Story = {
  render: () => (
    <p>
      Press <Kbd>A</Kbd> to allow once, <Kbd>D</Kbd> to deny.
    </p>
  ),
};
