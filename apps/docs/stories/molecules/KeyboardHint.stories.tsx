import type { Meta, StoryObj } from '@storybook/react-vite';
import { KeyboardHint } from '@creance-ui/react';

const meta = {
  title: 'Molecules/KeyboardHint',
  component: KeyboardHint,
  tags: ['autodocs'],
  args: { keys: ['A'], label: 'Allow once' },
} satisfies Meta<typeof KeyboardHint>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};
export const Combination: Story = { args: { keys: ['Shift', 'A'], label: 'Always allow' } };
export const KeysOnly: Story = { args: { keys: ['J'], label: undefined } };
