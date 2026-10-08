import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Gauge } from '../atoms/Gauge';
import { MiddleTruncate } from '../atoms/MiddleTruncate';
import { DestructiveActionModal } from './DestructiveActionModal';
import { FileTree } from './FileTree';
import { JsonView } from './JsonView';
import { formatRelative } from './RelativeTimeCard';
import { Sheet, SheetContent } from './Sheet';
import { Table, type TableColumn } from './Table';

interface Run {
  id: string;
  title: string;
  tokens: number;
}
const runs: Run[] = [
  { id: 'r1', title: 'Seed staging', tokens: 4100 },
  { id: 'r2', title: 'Fix the failing deploy', tokens: 9800 },
  { id: 'r3', title: 'Upgrade react-router', tokens: 31200 },
];
const columns: TableColumn<Run>[] = [
  { key: 'title', header: 'Run', cell: (r) => r.title, rowHeader: true, sortValue: (r) => r.title },
  { key: 'tokens', header: 'Tokens', cell: (r) => r.tokens, align: 'end', sortValue: (r) => r.tokens },
];

test('Table sorts by a column and announces the direction', async () => {
  render(<Table caption="Recent runs" columns={columns} rows={runs} rowKey={(r) => r.id} />);
  const header = screen.getByRole('columnheader', { name: 'Tokens' });
  expect(header).toHaveAttribute('aria-sort', 'none');
  await userEvent.click(within(header).getByRole('button'));
  expect(header).toHaveAttribute('aria-sort', 'ascending');
  await userEvent.click(within(header).getByRole('button'));
  expect(header).toHaveAttribute('aria-sort', 'descending');
  expect(screen.getAllByRole('rowheader').map((c) => c.textContent)).toEqual(['Upgrade react-router', 'Fix the failing deploy', 'Seed staging']);
});

test('Table selects a range with Shift-click, marks select-all as mixed, and shows bulk actions', async () => {
  const onSelectedChange = vi.fn();
  render(
    <Table
      caption="Recent runs"
      columns={columns}
      rows={runs}
      rowKey={(r) => r.id}
      rowLabel={(r) => r.title}
      selectable
      onSelectedChange={onSelectedChange}
      bulkActions={(keys) => <button type="button">Archive {keys.length}</button>}
    />,
  );
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select Seed staging' }));
  const user = userEvent.setup();
  await user.keyboard('{Shift>}');
  await user.click(screen.getByRole('checkbox', { name: 'Select Fix the failing deploy' }));
  await user.keyboard('{/Shift}');
  expect(onSelectedChange).toHaveBeenLastCalledWith(['r1', 'r2']);
  expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toHaveProperty('indeterminate', true);
  expect(screen.getByRole('button', { name: 'Archive 2' })).toBeInTheDocument();
});

const files = [
  {
    id: 'web',
    name: 'web',
    children: [
      { id: 'server', name: 'server', children: [{ id: 'validate', name: 'validate.ts', status: 'M' as const }] },
      { id: 'pkg', name: 'package.json', status: 'M' as const },
    ],
  },
  { id: 'docs', name: 'docs', children: [] },
];

test('FileTree walks with the arrow keys, opens and closes folders, and selects files', async () => {
  const onSelect = vi.fn();
  render(<FileTree label="Changed files" nodes={files} defaultExpanded={['web']} onSelect={onSelect} />);
  const web = screen.getByRole('treeitem', { name: /^web/ });
  expect(web).toHaveAttribute('tabindex', '0');
  web.focus();

  await userEvent.keyboard('{ArrowDown}');
  const server = screen.getByRole('treeitem', { name: /^server/ });
  expect(server).toHaveFocus();
  expect(server).toHaveAttribute('aria-expanded', 'false');
  await userEvent.keyboard('{ArrowRight}');
  expect(server).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard('{ArrowRight}');
  const file = screen.getByRole('treeitem', { name: 'validate.ts, modified' });
  expect(file).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'validate' }));
  await userEvent.keyboard('{ArrowLeft}');
  expect(server).toHaveFocus();
});

test('DestructiveActionModal focuses Cancel and keeps the action off until the name is typed', async () => {
  const onConfirm = vi.fn();
  render(
    <DestructiveActionModal open title="Delete Deploy Fixer?" description="This can't be undone." confirmLabel="Delete agent" confirmText="deploy-fixer" onConfirm={onConfirm} />,
  );
  expect(screen.getByRole('alertdialog', { name: 'Delete Deploy Fixer?' })).toBeInTheDocument();
  const action = screen.getByRole('button', { name: 'Delete agent' });
  expect(action).toBeDisabled();
  await userEvent.type(screen.getByRole('textbox', { name: 'Type deploy-fixer to confirm' }), 'deploy-fixer');
  await userEvent.click(action);
  expect(onConfirm).toHaveBeenCalled();
});

test('DestructiveActionModal without a name to type starts on Cancel', () => {
  render(<DestructiveActionModal open title="Stop the run?" description="The agent stops." confirmLabel="Stop run" onConfirm={() => {}} />);
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
});

test('Sheet is a named dialog with a close button', async () => {
  const onOpenChange = vi.fn();
  render(
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent title="Tool call details">run_tests</SheetContent>
    </Sheet>,
  );
  expect(screen.getByRole('dialog', { name: 'Tool call details' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('JsonView folds deep branches and expands them on demand', async () => {
  render(<JsonView label="Tool result" value={{ tool: 'run_tests', input: { suite: 'web', filter: { name: 'deploy' } } }} expandDepth={1} />);
  expect(screen.queryByText('"suite"')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'input, 2 keys' }));
  expect(screen.getByText('"suite"')).toBeInTheDocument();
});

test('Gauge exposes a meter and says when it is over the limit', () => {
  render(<Gauge label="Error rate" value={86} limit={50} />);
  expect(screen.getByRole('meter', { name: 'Error rate' })).toHaveAttribute('aria-valuetext', '86%, over the limit');
});

test('MiddleTruncate keeps the ends on screen and the whole text for screen readers', () => {
  render(<MiddleTruncate text="web/server/routes/api/v2/deployments/validate-config.ts" />);
  expect(screen.getByText('web/server/rou…lidate-config.ts')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByText('web/server/routes/api/v2/deployments/validate-config.ts')).toBeInTheDocument();
});

test('formatRelative picks the largest whole unit', () => {
  const now = new Date('2026-10-08T14:00:00Z');
  expect(formatRelative(new Date('2026-10-08T12:00:00Z'), now, 'en')).toBe('2 hours ago');
  expect(formatRelative(new Date('2026-10-07T14:00:00Z'), now, 'en')).toBe('yesterday');
  expect(formatRelative(new Date('2026-10-08T14:00:30Z'), now, 'en')).toBe('in 30 seconds');
});
