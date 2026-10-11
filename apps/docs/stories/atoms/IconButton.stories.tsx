import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '@creance-ui/react';

const Retry = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5v3h-3" />
  </svg>
);

const meta = {
  title: 'Atoms/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { label: 'Retry tool call', icon: <Retry /> },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Small: Story = { args: { size: 'sm' } };
export const WithoutTooltip: Story = { args: { tooltip: false } };
