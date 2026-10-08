import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'creance';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Allow once' },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Deny' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Skip' } };
export const Small: Story = { args: { size: 'sm' } };
export const Disabled: Story = { args: { disabled: true } };

export const Group: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="primary">Allow once</Button>
      <Button>Always allow</Button>
      <Button variant="danger">Deny</Button>
    </div>
  ),
};

