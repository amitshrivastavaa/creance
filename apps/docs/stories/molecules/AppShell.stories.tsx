import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { AppShell, Avatar, Breadcrumbs, Button, Card, Entity, Footer, Navbar, SearchInput, Sidebar, StatusDot, Steps, type SidebarGroup } from '@creance-ui/react';

const meta = {
  title: 'Molecules/App shell',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const icon = (path: ReactNode) => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);
const groups: SidebarGroup[] = [
  {
    items: [
      { label: 'Overview', href: '#', icon: icon(<path d="M2.5 7.2L8 2.8l5.5 4.4V13a.6.6 0 0 1-.6.6H3.1a.6.6 0 0 1-.6-.6z" />) },
      { label: 'Runs', href: '#', current: true, icon: icon(<path d="M3 4h10M3 8h10M3 12h6" />) },
      { label: 'Agents', href: '#', icon: icon(<><circle cx="8" cy="5.4" r="2.6" /><path d="M3 13.4c.6-2.4 2.6-3.6 5-3.6s4.400 1.200 5 3.600" /></>) },
      { label: 'Inbox', href: '#', count: 5, icon: icon(<path d="M2.5 9.2l1.8-5.400h7.400l1.800 5.400v3.300a.6.6 0 0 1-.6.6H3.100a.6.6 0 0 1-.6-.6zM2.500 9.200h3.200l.8 1.600h3l.8-1.600h3.200" />) },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'Permissions', href: '#', icon: icon(<path d="M8 2.2l4.800 1.700v3.600c0 3-2 5.200-4.800 6.300-2.800-1.100-4.800-3.300-4.800-6.300V3.900z" />) },
      { label: 'Budgets', href: '#' },
      { label: 'Settings', href: '#' },
    ],
  },
];
const brand = <a href="#top">Acme</a>;
const links = [
  { label: 'Overview', href: '#' },
  { label: 'Runs', href: '#', current: true },
  { label: 'Agents', href: '#' },
  { label: 'Inbox', href: '#', count: 5 },
];
const account = ({ collapsed }: { collapsed: boolean }) =>
  collapsed ? <Avatar name="Sam Rivera" decorative /> : <Entity name="Sam Rivera" description="Owner" />;

export const NavbarStory: Story = {
  name: 'Navbar',
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Navbar brand={brand} items={links} actions={<Button size="sm">Sign in</Button>} />
      <Navbar
        variant="flush"
        label="Docs"
        brand={brand}
        items={[{ label: 'Guides', href: '#', current: true }, { label: 'Components', href: '#' }, { label: 'Changelog', href: '#' }]}
        actions={
          <Button size="sm" variant="primary">
            Get started
          </Button>
        }
      />
      <div style={{ maxWidth: 360 }}>
        <Navbar label="Main, narrow" brand={brand} items={links} />
      </div>
    </div>
  ),
};

export const SidebarStory: Story = {
  name: 'Sidebar',
  render: () => (
    <div style={{ display: 'flex', gap: 16, height: 460 }}>
      <Sidebar variant="card" label="Workspace" groups={groups} collapsible footer={account} />
      <Sidebar variant="card" label="Workspace, collapsed" groups={groups} defaultCollapsed collapsible footer={account} />
    </div>
  ),
};

const flow = [
  { title: 'Connect a repository', description: 'acme/web' },
  { title: 'Choose an agent', description: 'Deploy Fixer' },
  { title: 'Set permissions', description: 'Step 3 of 4' },
  { title: 'Review and start', description: 'Not started' },
];

export const StepsStory: Story = {
  name: 'Steps',
  render: () => (
    <div style={{ display: 'grid', gap: 28, maxWidth: 760 }}>
      <Steps label="Set up" steps={flow} current={2} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Steps label="Set up, vertical" orientation="vertical" steps={flow} current={2} />
        <Steps
          label="Set up, with a failure"
          orientation="vertical"
          current={1}
          steps={[flow[0]!, { title: 'Choose an agent', description: 'Deploy Fixer has no access to this repository.', status: 'error' }, flow[2]!, flow[3]!]}
        />
      </div>
    </div>
  ),
};

const columns = [
  { title: 'Product', links: [{ label: 'Runs', href: '#' }, { label: 'Agents', href: '#' }, { label: 'Pricing', href: '#' }] },
  { title: 'Developers', links: [{ label: 'Docs', href: '#' }, { label: 'Changelog', href: '#' }, { label: 'Status', href: '#' }] },
];

export const FooterStory: Story = {
  name: 'Footer',
  render: () => (
    <Card>
      <Footer
        brand={brand}
        description="Agents that ask before they act, and hand back when they are done."
        columns={columns}
        legal="© 2026 Acme. MIT licence."
        links={[{ label: 'GitHub', href: '#' }, { label: 'npm', href: '#' }]}
      >
        <StatusDot status="done">All systems normal</StatusDot>
      </Footer>
    </Card>
  ),
};

// A page has one footer, so the one-line form gets a story of its own.
export const FooterCompact: Story = {
  render: () => <Footer legal="© 2026 Acme. MIT licence." links={[{ label: 'Docs', href: '#' }, { label: 'GitHub', href: '#' }]} />,
};

export const AppShellStory: Story = {
  name: 'AppShell',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <AppShell
      height={620}
      sidebar={<Sidebar label="Workspace" groups={groups} collapsible footer={account} />}
      header={
        <>
          <Breadcrumbs items={[{ label: 'Acme', href: '#' }, { label: 'Runs', href: '#' }]} />
          <span style={{ flex: 1 }} />
          <div style={{ width: 240 }}>
            <SearchInput aria-label="Search runs" placeholder="Search runs" shortcut="⌘K" />
          </div>
        </>
      }
      aside={<p style={{ margin: 0 }}>Three runs are waiting for you.</p>}
      asideLabel="Needs you"
    >
      <h1 style={{ margin: 0 }}>Runs</h1>
      <p>Everything your agents are doing, newest first.</p>
    </AppShell>
  ),
};
