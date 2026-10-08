import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Input } from '../atoms/Input';
import { Switch } from '../atoms/Switch';
import { Field } from './Field';
import { Menu, MenuContent, MenuItem, MenuTrigger } from './Menu';
import { RadioGroup } from './RadioGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { Toaster, toast } from './Toast';

test('Field labels its control and describes it with the error, then the hint', () => {
  render(
    <Field label="Branch" hint="Lowercase, no spaces." error="Branch names can't contain spaces.">
      <Input defaultValue="main main" />
    </Field>,
  );
  const input = screen.getByRole('textbox', { name: 'Branch' });
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription("Branch names can't contain spaces. Lowercase, no spaces.");
});

test('Field keeps an id the control already has', () => {
  render(
    <Field label="Agent name">
      <Input id="agent-name" />
    </Field>,
  );
  expect(screen.getByLabelText('Agent name')).toHaveAttribute('id', 'agent-name');
});

test('RadioGroup reports the chosen value', async () => {
  const onValueChange = vi.fn();
  render(
    <RadioGroup
      legend="When the budget runs out"
      defaultValue="pause"
      onValueChange={onValueChange}
      options={[
        { value: 'pause', label: 'Pause and ask me' },
        { value: 'stop', label: 'Stop the run' },
      ]}
    />,
  );
  expect(screen.getByRole('group', { name: 'When the budget runs out' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('radio', { name: 'Stop the run' }));
  expect(onValueChange).toHaveBeenCalledWith('stop');
});

test('Switch is a native checkbox exposed as a switch', async () => {
  render(<Switch label="Ask before shell commands" />);
  const sw = screen.getByRole('switch', { name: 'Ask before shell commands' });
  expect(sw).not.toBeChecked();
  await userEvent.click(sw);
  expect(sw).toBeChecked();
});

test('Tabs move with the arrow keys', async () => {
  render(
    <Tabs defaultValue="timeline">
      <TabsList aria-label="Run views">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="changes">Changes</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">Steps</TabsContent>
      <TabsContent value="changes">Diff</TabsContent>
    </Tabs>,
  );
  await userEvent.click(screen.getByRole('tab', { name: 'Timeline' }));
  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Changes' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Diff');
});

test('Menu opens from the keyboard and runs an item', async () => {
  const onSelect = vi.fn();
  render(
    <Menu>
      <MenuTrigger>Run options</MenuTrigger>
      <MenuContent>
        <MenuItem onSelect={onSelect}>Pause run</MenuItem>
        <MenuItem tone="danger">Stop agent</MenuItem>
      </MenuContent>
    </Menu>,
  );
  screen.getByRole('button', { name: 'Run options' }).focus();
  await userEvent.keyboard('{Enter}');
  await userEvent.click(await screen.findByRole('menuitem', { name: 'Pause run' }));
  expect(onSelect).toHaveBeenCalled();
});

test('toast() queues a message in the Toaster and the returned function dismisses it', () => {
  render(<Toaster />);
  let close = () => {};
  act(() => {
    close = toast({ title: 'Allowed npm install zod@3 once', tone: 'success' });
  });
  expect(screen.getByText('Allowed npm install zod@3 once')).toBeInTheDocument();
  act(() => close());
  expect(screen.queryByText('Allowed npm install zod@3 once')).not.toBeInTheDocument();
});
