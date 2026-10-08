import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiskLabel } from 'creance';

const meta = {
  title: 'Molecules/RiskLabel',
  component: RiskLabel,
  tags: ['autodocs'],
  args: { level: 'medium' },
} satisfies Meta<typeof RiskLabel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Low: Story = { args: { level: 'low' } };
export const Medium: Story = {};
export const High: Story = { args: { level: 'high' } };
