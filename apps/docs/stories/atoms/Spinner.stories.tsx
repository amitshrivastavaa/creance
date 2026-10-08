import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from 'creance';

const meta = {
  title: 'Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Decorative: use next to text that already says what is happening. */
export const Decorative: Story = {
  render: (args) => (
    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <Spinner {...args} /> Running tests
    </span>
  ),
};
/** With a label, the spinner is announced as a status. */
export const Labelled: Story = { args: { label: 'Loading run history' } };
export const Small: Story = { args: { size: 'sm', label: 'Loading' } };
