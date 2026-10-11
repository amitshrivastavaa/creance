import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Field,
  Input,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  RadioGroup,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toaster,
  toast,
} from '@creance-ui/react';

const meta = {
  title: 'Molecules/Core controls',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Fields: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      <Field label="Agent name" hint="Shown in the run header and the inbox.">
        <Input defaultValue="Deploy Fixer" />
      </Field>
      <Field label="Branch" error="Branch names can't contain spaces.">
        <Input defaultValue="main main" />
      </Field>
      <Field label="Workspace" hint="Set by your admin.">
        <Input defaultValue="acme/web" disabled />
      </Field>
      <Field label="Run speed">
        <Select defaultValue="1">
          <option value="1">Normal</option>
          <option value="2">2×</option>
        </Select>
      </Field>
      <Field label="Answer for Data Loader" hint="The agent reads this as its instruction.">
        <Textarea defaultValue="Seed staging-eu." />
      </Field>
    </div>
  ),
};

export const Radios: Story = {
  render: () => (
    <RadioGroup
      legend="When the budget runs out"
      defaultValue="pause"
      options={[
        { value: 'pause', label: 'Pause and ask me' },
        { value: 'stop', label: 'Stop the run' },
        { value: 'continue', label: 'Keep going', description: 'Spending continues past the limit.' },
      ]}
    />
  ),
};

export const TabsSegmented: Story = {
  name: 'Tabs',
  render: () => (
    <Tabs defaultValue="timeline">
      <TabsList aria-label="Run views">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="changes">Changes</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">Three steps, one waiting for you.</TabsContent>
      <TabsContent value="changes">Two files changed.</TabsContent>
      <TabsContent value="permissions">Reads run freely; writes ask first.</TabsContent>
    </Tabs>
  ),
};

export const MenuOpen: Story = {
  name: 'Menu',
  render: () => (
    <div style={{ minHeight: 260 }}>
      <Menu defaultOpen modal={false}>
        <MenuTrigger asChild>
          <Button size="sm">Run options</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem shortcut={<Kbd>P</Kbd>}>Pause run</MenuItem>
          <MenuItem>Rewind to a checkpoint</MenuItem>
          <MenuItem>Open run logs</MenuItem>
          <MenuSeparator />
          <MenuItem tone="danger">Stop agent</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  ),
};

export const DialogConfirm: Story = {
  name: 'Dialog',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">Stop agent</Button>
      </DialogTrigger>
      <DialogContent
        title="Stop Deploy Fixer?"
        description="The agent stops after its current tool call. Changes it already made stay; nothing new is installed, written or deployed."
        actions={
          <>
            <DialogClose asChild>
              <Button>Keep running</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="danger">Stop agent</Button>
            </DialogClose>
          </>
        }
      />
    </Dialog>
  ),
};

export const Toasts: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button
        onClick={() =>
          toast({ title: 'Allowed npm install zod@3 once', tone: 'success', action: { label: 'Undo', onClick: () => {} } })
        }
      >
        Show success
      </Button>
      <Button
        onClick={() =>
          toast({ title: 'Upgrader failed: 3 tests failing', tone: 'danger', action: { label: 'Open run', onClick: () => {} } })
        }
      >
        Show failure
      </Button>
      <Toaster />
    </div>
  ),
};

export const Alerts: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
      <Alert title="Budget at 84%">Deploy Fixer has used 42K of 50K tokens.</Alert>
      <Alert title="The run failed" tone="danger">
        Migration 042 failed: column &quot;region&quot; already exists.
      </Alert>
    </div>
  ),
};

export const Cards: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      <Card as="section" aria-labelledby="c1">
        <h3 id="c1" style={{ margin: 0, fontSize: 13 }}>Waiting on you</h3>
        <strong style={{ fontSize: 30 }}>5</strong>
        <span>2 urgent</span>
      </Card>
      <Card as="article">
        <strong>Deploy Fixer</strong>
        <span>Asks for risky actions</span>
      </Card>
    </div>
  ),
};
