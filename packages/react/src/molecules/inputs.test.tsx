import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { Toggle } from '../atoms/Toggle';
import { Calendar } from './Calendar';
import { Choicebox } from './Choicebox';
import { ClearableInput } from './ClearableInput';
import { Combobox } from './Combobox';
import { CopyButton } from './CopyButton';
import { Feedback } from './Feedback';
import { MultiSelect } from './MultiSelect';
import { Slider } from './Slider';
import { ThemeSwitcher } from './ThemeSwitcher';

afterEach(() => vi.useRealTimers());

/** A day button by its full name, so 8 October does not also match 18 and 28 October. */
const on = (d: number, month = 'October') => new RegExp(`(^|\\s)${d} ${month} 2026$`);

const agents = [
  { value: 'df', label: 'Deploy Fixer' },
  { value: 'dl', label: 'Data Loader' },
  { value: 'dw', label: 'Docs Writer', disabled: true },
  { value: 'rb', label: 'Release Bot' },
];

test('Combobox filters as you type, moves with arrows past disabled options, and picks with Enter', async () => {
  const onValueChange = vi.fn();
  render(<Combobox aria-label="Agent" options={agents} onValueChange={onValueChange} />);
  const input = screen.getByRole('combobox', { name: 'Agent' });

  await userEvent.type(input, 'd');
  expect(input).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getAllByRole('option')).toHaveLength(3);
  expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Deploy Fixer' }).id);

  await userEvent.keyboard('{ArrowDown}{ArrowDown}');
  // Docs Writer is disabled, so the second ArrowDown wraps back to the first option.
  expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Deploy Fixer' }).id);
  await userEvent.keyboard('{ArrowDown}{Enter}');
  expect(onValueChange).toHaveBeenCalledWith('dl');
  expect(input).toHaveValue('Data Loader');
  expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('Combobox Escape closes and restores the chosen label', async () => {
  render(<Combobox aria-label="Agent" options={agents} defaultValue="rb" />);
  const input = screen.getByRole('combobox');
  await userEvent.clear(input);
  await userEvent.type(input, 'xyz');
  expect(screen.getByText('No matches')).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  expect(input).toHaveValue('Release Bot');
});

test('Combobox offers to create what was typed', async () => {
  const onCreate = vi.fn();
  render(<Combobox aria-label="Agent" options={agents} onCreate={onCreate} />);
  await userEvent.type(screen.getByRole('combobox'), 'Triage');
  await userEvent.keyboard('{Enter}');
  expect(onCreate).toHaveBeenCalledWith('Triage');
});

test('MultiSelect toggles with Enter, keeps the list open, and Backspace removes the last chip', async () => {
  const onValueChange = vi.fn();
  render(<MultiSelect aria-label="Allowed tools" options={agents} defaultValue={['df']} onValueChange={onValueChange} />);
  const input = screen.getByRole('combobox');
  await userEvent.click(input);
  await userEvent.type(input, 'data');
  await userEvent.keyboard('{Enter}');
  expect(onValueChange).toHaveBeenLastCalledWith(['df', 'dl']);
  expect(input).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'Remove Data Loader' })).toBeInTheDocument();

  await userEvent.keyboard('{Backspace}');
  expect(onValueChange).toHaveBeenLastCalledWith(['df']);
  await userEvent.click(screen.getByRole('button', { name: 'Remove Deploy Fixer' }));
  expect(onValueChange).toHaveBeenLastCalledWith([]);
});

test('Calendar moves by day, week and month from the keyboard and picks with Enter', async () => {
  const onValueChange = vi.fn();
  render(<Calendar today={new Date(2026, 9, 8)} locale="en-GB" onValueChange={onValueChange} />);
  const today = screen.getByRole('button', { name: on(8) });
  expect(today).toHaveAttribute('aria-current', 'date');
  expect(today).toHaveAttribute('tabindex', '0');

  today.focus();
  await userEvent.keyboard('{ArrowRight}{ArrowDown}');
  expect(screen.getByRole('button', { name: on(16) })).toHaveFocus();
  await userEvent.keyboard('{PageDown}');
  expect(screen.getByRole('heading', { name: 'November 2026' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: on(16, 'November') })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(onValueChange.mock.calls[0]![0].getDate()).toBe(16);
});

test('Calendar picks a range in two steps, in either order, and skips disabled days', async () => {
  const onValueChange = vi.fn();
  render(
    <Calendar
      mode="range"
      today={new Date(2026, 9, 8)}
      locale="en-GB"
      isDateDisabled={(d) => d.getDate() === 12}
      onValueChange={onValueChange}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: on(10) }));
  expect(onValueChange).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: on(12) }));
  expect(onValueChange).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: on(6) }));
  const { start, end } = onValueChange.mock.calls[0]![0];
  expect([start.getDate(), end.getDate()]).toEqual([6, 10]);
});

test('CopyButton writes to the clipboard and announces it', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  render(<CopyButton value="pnpm add @creance-ui/react" label="Copy command" />);
  await userEvent.click(screen.getByRole('button', { name: 'Copy command' }));
  expect(writeText).toHaveBeenCalledWith('pnpm add @creance-ui/react');
  expect(await screen.findByText('Copied')).toBeInTheDocument();
});

test('ClearableInput clears and puts focus back in the field', async () => {
  render(<ClearableInput aria-label="Branch" defaultValue="fix/deploy" />);
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(screen.getByRole('textbox', { name: 'Branch' })).toHaveValue('');
  expect(screen.getByRole('textbox', { name: 'Branch' })).toHaveFocus();
  expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
});

test('Choicebox in checkbox mode reports every checked card', async () => {
  const onValueChange = vi.fn();
  render(
    <Choicebox
      type="checkbox"
      legend="Notify me about"
      options={[
        { value: 'approvals', title: 'Approvals' },
        { value: 'failures', title: 'Failures' },
      ]}
      onValueChange={onValueChange}
    />,
  );
  await userEvent.click(screen.getByRole('checkbox', { name: 'Approvals' }));
  await userEvent.click(screen.getByRole('checkbox', { name: 'Failures' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['approvals', 'failures']);
});

test('Toggle reports pressed state', async () => {
  render(<Toggle>Wrap lines</Toggle>);
  const t = screen.getByRole('button', { name: 'Wrap lines' });
  await userEvent.click(t);
  expect(t).toHaveAttribute('aria-pressed', 'true');
});

test('Slider names its thumb from the label and reads the formatted value', () => {
  render(<Slider label="Token budget" defaultValue={[50_000]} min={10_000} max={200_000} formatValue={(v) => `${v / 1000}K`} />);
  const thumb = screen.getByRole('slider', { name: 'Token budget' });
  expect(thumb).toHaveAttribute('aria-valuetext', '50K');
});

test('ThemeSwitcher sets data-theme on <html> and removes it for system', async () => {
  render(<ThemeSwitcher />);
  await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
  expect(document.documentElement.dataset.theme).toBe('dark');
  await userEvent.click(screen.getByRole('radio', { name: 'Match system' }));
  expect(document.documentElement.dataset.theme).toBeUndefined();
});

test('Feedback sends the rating and the comment, then thanks', async () => {
  const onSubmit = vi.fn();
  render(<Feedback onSubmit={onSubmit} />);
  await userEvent.click(screen.getByRole('button', { name: 'Not useful' }));
  await act(async () => {});
  await userEvent.type(screen.getByRole('textbox', { name: 'What went wrong?' }), 'It asked twice.');
  await userEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
  expect(onSubmit).toHaveBeenCalledWith({ rating: 'down', comment: 'It asked twice.' });
  expect(screen.getByRole('status')).toHaveTextContent('Thanks for the feedback.');
});
