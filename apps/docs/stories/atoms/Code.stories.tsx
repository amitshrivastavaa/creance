import type { Meta, StoryObj } from '@storybook/react-vite';
import { Code } from 'creance';

const meta = {
  title: 'Atoms/Code',
  component: Code,
  tags: ['autodocs'],
  args: { children: 'npm install zod' },
} satisfies Meta<typeof Code>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  render: (args) => (
    <p>
      The agent wants to run <Code {...args} />.
    </p>
  ),
};

export const Block: Story = {
  args: {
    block: true,
    children: JSON.stringify({ path: 'deploy/config.yaml', encoding: 'utf-8', lines: [1, 40] }, null, 2),
  },
};
