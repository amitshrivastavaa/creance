import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';
import { Collapse, CollapseItem } from './Collapse';
import { CommandMenu, type Command } from './CommandMenu';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ContextMenu';
import { DotsMenu } from './DotsMenu';
import { MenuItem } from './Menu';
import { Pagination, pageItems } from './Pagination';

test('Breadcrumbs marks the current page and folds the middle of long trails', async () => {
  const items = ['Acme', 'Agents', 'Deploy Fixer', 'Runs', 'Run 41'].map((label) => ({ label, href: '#' }));
  render(<Breadcrumbs items={items} />);
  expect(screen.getByRole('link', { name: 'Run 41' })).toHaveAttribute('aria-current', 'page');
  expect(screen.queryByRole('link', { name: 'Agents' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Show 3 hidden levels' }));
  expect(screen.getByRole('link', { name: 'Agents' })).toBeInTheDocument();
});

test('pageItems keeps the ends and neighbours, and folds only gaps of two or more', () => {
  expect(pageItems(1, 3, 1)).toEqual([1, 2, 3]);
  expect(pageItems(6, 12, 1)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12]);
  // A gap of exactly one page shows the page instead of an ellipsis.
  expect(pageItems(3, 12, 1)).toEqual([1, 2, 3, 4, 'gap', 12]);
});

test('Pagination marks the current page and disables stepping off the ends', async () => {
  const onPageChange = vi.fn();
  render(<Pagination page={1} pageCount={12} onPageChange={onPageChange} label="Runs pages" />);
  expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(onPageChange).toHaveBeenCalledWith(2);
});

const commands = (onSelect: (id: string) => void): Command[] => [
  { id: 'df', label: 'Deploy Fixer', group: 'Agents', onSelect: () => onSelect('df') },
  { id: 'run', label: 'Fix the failing deploy', group: 'Runs', keywords: ['zod'], onSelect: () => onSelect('run') },
  { id: 'stop', label: 'Stop all running agents', group: 'Actions', tone: 'danger', onSelect: () => onSelect('stop') },
];

function Harness({ onSelect }: { onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return <CommandMenu open={open} onOpenChange={setOpen} commands={commands(onSelect)} />;
}

test('CommandMenu opens with Ctrl+K, filters by label and keywords, and runs the picked command', async () => {
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} />);
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  const input = await screen.findByRole('combobox');
  expect(screen.getAllByRole('option')).toHaveLength(3);

  await userEvent.type(input, 'zod');
  expect(screen.getAllByRole('option')).toHaveLength(1);
  await userEvent.keyboard('{Enter}');
  expect(onSelect).toHaveBeenCalledWith('run');
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});

test('ContextMenu opens on right-click', async () => {
  const onSelect = vi.fn();
  render(
    <ContextMenu>
      <ContextMenuTrigger>run_tests</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onSelect}>Copy call ID</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );
  fireEvent.contextMenu(screen.getByText('run_tests'));
  await userEvent.click(await screen.findByRole('menuitem', { name: 'Copy call ID' }));
  expect(onSelect).toHaveBeenCalled();
});

test('DotsMenu is a named button that opens its menu', async () => {
  render(
    <DotsMenu label="More actions for Docs Writer">
      <MenuItem>Pause</MenuItem>
    </DotsMenu>,
  );
  const trigger = screen.getByRole('button', { name: 'More actions for Docs Writer' });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  expect(await screen.findByRole('menuitem', { name: 'Pause' })).toBeInTheDocument();
});

test('Collapse opens a section and uses the requested heading level', async () => {
  render(
    <Collapse type="multiple">
      <CollapseItem value="a" title="How are tokens counted?" headingLevel={2}>
        Input and output tokens both count.
      </CollapseItem>
    </Collapse>,
  );
  const trigger = screen.getByRole('button', { name: 'How are tokens counted?' });
  expect(screen.getByRole('heading', { level: 2 })).toContainElement(trigger);
  await userEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Input and output tokens both count.')).toBeVisible();
});
