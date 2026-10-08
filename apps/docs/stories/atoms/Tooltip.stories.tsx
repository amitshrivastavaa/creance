import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Tooltip } from 'creance';

const meta = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: {
    content: 'Runs once. The agent will ask again next time.',
    children: <Button>Allow once</Button>,
  },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Bottom: Story = { args: { side: 'bottom' } };
