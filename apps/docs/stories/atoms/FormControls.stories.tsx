import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, Input, Radio, Select, Separator, Skeleton, Switch, Textarea } from 'creance';

const meta = {
  title: 'Atoms/Form controls',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Native elements, styled: `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`. Forms, autofill, keyboard and screen readers work without script. Wrap text controls in `Field` for a label, hint and error.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const stack = { display: 'grid', gap: 16, maxWidth: 360 } as const;

export const Inputs: Story = {
  render: () => (
    <div style={stack}>
      <Input aria-label="Agent name" defaultValue="Deploy Fixer" />
      <Input aria-label="Search runs" placeholder="Search runs" />
      <Input aria-label="Branch" defaultValue="main main" aria-invalid />
      <Input aria-label="Workspace" defaultValue="acme/web" disabled />
      <Input aria-label="Small" size="sm" defaultValue="Small" />
    </div>
  ),
};

export const TextareaAndSelect: Story = {
  render: () => (
    <div style={stack}>
      <Textarea aria-label="Answer for Data Loader" defaultValue="Seed staging-eu. staging-us is being migrated this week." />
      <Select aria-label="Run speed" defaultValue="1">
        <option value="1">Normal</option>
        <option value="2">2×</option>
        <option value="4">4×</option>
      </Select>
    </div>
  ),
};

export const Checks: Story = {
  render: () => (
    <div style={stack}>
      <Checkbox label="Run tests after every change" defaultChecked />
      <Checkbox label="Open a pull request when done" description="As a draft until the checks pass." />
      <Checkbox label="Deploy automatically" disabled />
      <Radio name="demo" label="Pause and ask me" defaultChecked />
      <Radio name="demo" label="Stop the run" />
    </div>
  ),
};

export const Switches: Story = {
  render: () => (
    <div style={stack}>
      <Switch label="Ask before shell commands" defaultChecked />
      <Switch label="Always allow file reads" />
      <Switch label="Deploy on merge" description="Only on main." disabled />
    </div>
  ),
};

export const SeparatorAndSkeleton: Story = {
  render: () => (
    <div style={stack} aria-busy="true" aria-label="Loading runs">
      <span>Above</span>
      <Separator />
      <span>Below</span>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton shape="circle" />
        <Skeleton style={{ flex: 1 }} />
      </div>
      <Skeleton width="80%" />
      <Skeleton width="55%" />
    </div>
  ),
};
