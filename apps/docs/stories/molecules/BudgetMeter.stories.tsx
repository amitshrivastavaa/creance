import type { Meta, StoryObj } from '@storybook/react-vite';
import { BudgetMeter } from '@creance-ui/react';

const meta = {
  title: 'Molecules/BudgetMeter',
  component: BudgetMeter,
  tags: ['autodocs'],
  args: { used: 18_200, limit: 50_000, unit: 'tokens' },
  decorators: [(Story) => <div style={{ maxWidth: 280 }}><Story /></div>],
} satisfies Meta<typeof BudgetMeter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tokens: Story = {};
export const Cost: Story = { args: { used: 1.2, limit: 5, unit: 'usd' } };
/** At 80% of the limit the meter warns. */
export const NearLimit: Story = { args: { used: 42_000 } };
export const OverLimit: Story = { args: { used: 53_100 } };
