import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Breadcrumbs,
  Button,
  Card,
  Collapse,
  CollapseItem,
  CommandMenu,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DotsMenu,
  Kbd,
  MenuItem,
  MenuSeparator,
  Pagination,
  Scroller,
} from '@creance-ui/react';

const meta = {
  title: 'Molecules/Navigation',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const BreadcrumbsStory: Story = {
  name: 'Breadcrumbs',
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Breadcrumbs items={['Acme', 'Agents', 'Deploy Fixer', 'Run 41'].map((label) => ({ label, href: '#' }))} />
      <Breadcrumbs
        label="Breadcrumb, folded"
        items={['Acme', 'Agents', 'Deploy Fixer', 'Run 41', 'Tool call run_tests'].map((label) => ({ label, href: '#' }))}
      />
    </div>
  ),
};

export const PaginationStory: Story = {
  name: 'Pagination',
  render: function Render() {
    const [page, setPage] = useState(3);
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <Pagination page={page} pageCount={12} onPageChange={setPage} label="Runs pages" />
        <Pagination
          variant="compact"
          page={page}
          pageCount={12}
          onPageChange={setPage}
          label="Runs pages, compact"
          summary={`Runs ${(page - 1) * 20 + 1}–${page * 20} of 230`}
        />
      </div>
    );
  },
};

export const CommandMenuOpen: Story = {
  name: 'Command menu',
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>
          Open command menu <Kbd>⌘K</Kbd>
        </Button>
        <CommandMenu
          open={open}
          onOpenChange={setOpen}
          commands={[
            { id: 'df', group: 'Agents', label: 'Deploy Fixer', meta: 'Open agent', onSelect: () => {} },
            { id: 'r41', group: 'Runs', label: 'Fix the failing deploy', meta: 'Waiting for you', keywords: ['zod'], onSelect: () => {} },
            { id: 'r39', group: 'Runs', label: 'Re-run deploy checks', meta: '2 days ago', onSelect: () => {} },
            { id: 'new', group: 'Actions', label: 'Start a new run with Deploy Fixer', shortcut: <Kbd>N</Kbd>, onSelect: () => {} },
            { id: 'stop', group: 'Actions', label: 'Stop all running agents', tone: 'danger', onSelect: () => {} },
          ]}
        />
      </>
    );
  },
};

export const Menus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card style={{ padding: 16 }} tabIndex={0} aria-label="run_tests, attempt 2. Right-click or Shift+F10 for actions">
            <code>run_tests</code> attempt 2
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Show input and result</ContextMenuItem>
          <ContextMenuItem shortcut={<Kbd>⌘C</Kbd>}>Copy call ID</ContextMenuItem>
          <ContextMenuItem>Rewind to before this call</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Always allow run_tests</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Card style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 16px', width: 320 }}>
        <strong style={{ flex: 1 }}>Docs Writer</strong>
        <span>Running</span>
        <DotsMenu label="More actions for Docs Writer">
          <MenuItem>Open run</MenuItem>
          <MenuItem>Pause</MenuItem>
          <MenuItem>Rename agent</MenuItem>
          <MenuSeparator />
          <MenuItem tone="danger">Stop agent</MenuItem>
        </DotsMenu>
      </Card>
    </div>
  ),
};

export const ScrollerStory: Story = {
  name: 'Scroller',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Scroller label="Recent runs">
        {[
          ['Run 41', 'Fix the failing deploy', 'Waiting for you'],
          ['Run 40', 'Upgrade react-router', 'Failed'],
          ['Run 39', 'Seed staging', 'Done'],
          ['Run 38', 'Write onboarding docs', 'Done'],
          ['Run 37', 'Rotate API keys', 'Done'],
          ['Run 36', 'Triage issues', 'Done'],
        ].map(([id, title, status]) => (
          <Card key={id} as="article" style={{ width: 200 }} aria-label={`${id}: ${title}`}>
            <span>{id}</span>
            <strong>{title}</strong>
            <span>{status}</span>
          </Card>
        ))}
      </Scroller>
    </div>
  ),
};

export const CollapseStory: Story = {
  name: 'Collapse',
  render: () => (
    <Collapse type="multiple" defaultValue={['auto']} style={{ maxWidth: 640 }}>
      <CollapseItem value="auto" title="What can Deploy Fixer do on its own?">
        Read files and logs and run tests without asking. Anything that installs, writes outside the repository or touches
        production waits for you.
      </CollapseItem>
      <CollapseItem value="tokens" title="How are tokens counted?">
        Input and output tokens both count toward the run&apos;s budget.
      </CollapseItem>
      <CollapseItem value="undo" title="Can I undo what an agent did?">
        Rewind to any checkpoint. Changes after it are reverted; nothing outside the repository is touched.
      </CollapseItem>
    </Collapse>
  ),
};
