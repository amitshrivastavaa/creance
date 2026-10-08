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

/**
 * Glass shows what is behind it: here, over deliberately loud content. This is also the known limit:
 * over very bright content the clear glass can drop text below 4.5:1 (Apple's Liquid Glass samples the
 * content beneath and flips light or dark; CSS can't). The axe result is reported as "todo" rather than
 * failing, so the limit stays visible. Keep glass controls over calm content in real screens.
 */
export const OverContent: Story = {
  parameters: { a11y: { test: 'todo' } },
  render: () => (
    <div style={{ position: 'relative', padding: 32, borderRadius: 24, overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 12 }}>
        <div style={{ borderRadius: 999, background: 'var(--cr-gradient-agent)' }} />
        <div style={{ borderRadius: 16, background: 'var(--cr-color-status-done-fg)' }} />
        <div style={{ borderRadius: 999, background: 'var(--cr-color-status-blocked-fg)' }} />
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: 8, justifyContent: 'center', padding: '24px 0' }}>
        <Button variant="primary">Allow once</Button>
        <Button>Always allow</Button>
        <Button variant="danger">Deny</Button>
      </div>
    </div>
  ),
};
