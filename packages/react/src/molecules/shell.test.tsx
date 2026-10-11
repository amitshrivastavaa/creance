import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { AppShell } from '../templates/AppShell';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Steps } from './Steps';

const links = [
  { label: 'Overview', href: '#overview' },
  { label: 'Runs', href: '#runs', current: true },
  { label: 'Inbox', href: '#inbox', count: 5 },
];

test('Navbar marks the current page, and its menu opens, closes on Escape and gives focus back', async () => {
  render(<Navbar brand={<a href="#home">Acme</a>} items={links} />);
  const nav = screen.getByRole('navigation', { name: 'Main' });
  expect(within(nav).getByRole('link', { name: 'Runs' })).toHaveAttribute('aria-current', 'page');
  expect(within(nav).getByRole('link', { name: 'Inbox 5' })).toBeInTheDocument();

  const menu = within(nav).getByRole('button', { name: 'Menu' });
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(menu);
  expect(menu).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard('{Escape}');
  expect(menu).toHaveAttribute('aria-expanded', 'false');
  expect(menu).toHaveFocus();
});

test('Navbar closes its menu when a link is followed', async () => {
  const onClick = vi.fn((e: { preventDefault(): void }) => e.preventDefault());
  render(<Navbar items={[{ label: 'Runs', href: '#runs', onClick }]} />);
  const menu = screen.getByRole('button', { name: 'Menu' });
  await userEvent.click(menu);
  await userEvent.click(screen.getByRole('link', { name: 'Runs' }));
  expect(onClick).toHaveBeenCalledOnce();
  expect(menu).toHaveAttribute('aria-expanded', 'false');
});

const groups = [
  { items: [{ label: 'Runs', href: '#runs', current: true }, { label: 'Inbox', href: '#inbox', count: 5 }] },
  { title: 'Manage', items: [{ label: 'Settings', href: '#settings' }] },
];

test('Sidebar names its groups, and keeps every link named when collapsed', async () => {
  const onCollapsedChange = vi.fn();
  render(<Sidebar label="Workspace" groups={groups} collapsible onCollapsedChange={onCollapsedChange} footer={({ collapsed }) => (collapsed ? 'AS' : 'Amit')} />);
  const nav = screen.getByRole('navigation', { name: 'Workspace' });
  expect(within(nav).getByRole('list', { name: 'Manage' })).toBeInTheDocument();
  expect(within(nav).getByRole('link', { name: 'Runs' })).toHaveAttribute('aria-current', 'page');
  expect(within(nav).getByText('Amit')).toBeInTheDocument();

  await userEvent.click(within(nav).getByRole('button', { name: 'Collapse sidebar' }));
  expect(onCollapsedChange).toHaveBeenCalledWith(true);
  expect(nav).toHaveAttribute('data-collapsed');
  expect(within(nav).getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false');
  // Labels are hidden by CSS, not removed, so the links keep their names.
  expect(within(nav).getByRole('link', { name: 'Inbox 5' })).toBeInTheDocument();
  expect(within(nav).getByText('AS')).toBeInTheDocument();
});

test('Steps works out each status from the current index, and says it in words', () => {
  render(
    <Steps
      label="Set up"
      current={1}
      steps={[{ title: 'Connect' }, { title: 'Choose' }, { title: 'Permissions', status: 'error' }, { title: 'Review' }]}
    />,
  );
  const items = within(screen.getByRole('list', { name: 'Set up' })).getAllByRole('listitem');
  expect(items.map((li) => li.dataset.status)).toEqual(['done', 'current', 'error', 'upcoming']);
  expect(items[1]).toHaveAttribute('aria-current', 'step');
  expect(items[0]).toHaveTextContent('Connect, Done');
  expect(items[2]).toHaveTextContent('Permissions, Failed');
});

test('Footer names each column of links, and is one line without columns', () => {
  const { rerender } = render(
    <Footer brand="Acme" columns={[{ title: 'Product', links: [{ label: 'Runs', href: '#runs' }] }]} legal="© 2026 Acme" links={[{ label: 'GitHub', href: '#gh' }]} />,
  );
  expect(within(screen.getByRole('navigation', { name: 'Product' })).getByRole('link', { name: 'Runs' })).toBeInTheDocument();
  expect(within(screen.getByRole('navigation', { name: 'Footer' })).getByRole('link', { name: 'GitHub' })).toBeInTheDocument();

  rerender(<Footer legal="© 2026 Acme" links={[{ label: 'GitHub', href: '#gh' }]} />);
  expect(screen.queryByRole('navigation', { name: 'Product' })).not.toBeInTheDocument();
  expect(screen.getByText('© 2026 Acme')).toBeInTheDocument();
});

test('AppShell starts with a skip link to the content, and opens the sidebar in a sheet that closes on a link', async () => {
  render(
    <AppShell sidebar={<Sidebar label="Workspace" groups={groups} />} header={<span>Runs</span>} aside={<p>Waiting</p>} asideLabel="Needs you">
      <h1>Runs</h1>
    </AppShell>,
  );
  const main = screen.getByRole('main');
  expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', `#${main.id}`);
  expect(screen.getByRole('complementary', { name: 'Needs you' })).toHaveTextContent('Waiting');

  await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
  const sheet = screen.getByRole('dialog', { name: 'Navigation' });
  await userEvent.click(within(sheet).getByRole('link', { name: 'Settings' }));
  expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument();
});
