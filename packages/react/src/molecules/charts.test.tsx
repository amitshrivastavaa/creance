import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { Sparkline } from '../atoms/Sparkline';
import { niceScale } from '../internal/chart';
import { BarChart } from './BarChart';
import { BarList } from './BarList';
import { DonutChart } from './DonutChart';
import { LineChart } from './LineChart';
import { StatCard } from './StatCard';

const cells = (table: HTMLElement) => within(table).getAllByRole('row').map((row) => [...row.children].map((c) => c.textContent));

test('niceScale rounds up to a readable maximum with even ticks', () => {
  expect(niceScale(96)).toEqual({ max: 100, ticks: [0, 25, 50, 75, 100] });
  expect(niceScale(22, 3)).toEqual({ max: 24, ticks: [0, 8, 16, 24] });
  expect(niceScale(0.9)).toEqual({ max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] });
  // No data still gives a scale to draw.
  expect(niceScale(0)).toEqual({ max: 1, ticks: [0, 1] });
});

test('Sparkline is one named image, and its line ends on the last value', () => {
  const { container } = render(<Sparkline label="Tokens per day" values={[1, 3, 2]} width={100} height={30} />);
  expect(screen.getByRole('img', { name: 'Tokens per day' })).toBeInTheDocument();
  // Three points across the width; the highest value sits at the top padding.
  expect(container.querySelector('.cr-sparkline__line')).toHaveAttribute('d', 'M3.0 27.0 L50.0 3.0 L97.0 15.0');
  expect(container.querySelector('.cr-sparkline__dot')).toHaveAttribute('cx', '97');
});

test('StatCard reads the direction of the trend in words', () => {
  render(<StatCard label="Failed runs" value="3" trend={{ direction: 'up', label: '2', tone: 'bad' }} note="vs yesterday" />);
  expect(screen.getByText('Failed runs')).toBeInTheDocument();
  const trend = screen.getByText('2').closest('.cr-stat__trend')!;
  expect(trend).toHaveTextContent('Up 2');
  expect(trend).toHaveAttribute('data-tone', 'bad');
});

test('BarChart carries its data as a table, with a total when stacked', () => {
  render(
    <BarChart
      label="Runs per day"
      labels={['Mon', 'Tue']}
      series={[
        { name: 'Completed', values: [11, 16] },
        { name: 'Failed', values: [1, 2], tone: 'danger' },
      ]}
    />,
  );
  expect(cells(screen.getByRole('table', { name: 'Runs per day' }))).toEqual([
    ['Category', 'Completed', 'Failed', 'Total'],
    ['Mon', '11', '1', '12'],
    ['Tue', '16', '2', '18'],
  ]);
});

test('BarChart sizes each bar against a rounded scale', () => {
  const { container } = render(<BarChart label="Runs" labels={['Mon', 'Tue']} highlight={1} series={[{ name: 'Runs', values: [12, 22] }]} />);
  const stacks = [...container.querySelectorAll<HTMLElement>('.cr-bar-chart__stack')].map((s) => s.style.height);
  // The scale tops out at 24, so 12 is half and 22 is eleven twelfths.
  expect(stacks).toEqual(['50%', `${(22 / 24) * 100}%`]);
  expect(container.querySelectorAll('.cr-bar-chart__column')[1]).toHaveAttribute('data-highlight');
});

test('DonutChart gives each slice its value and share, and the total', () => {
  render(<DonutChart label="Run outcomes" centerLabel="runs" data={[{ label: 'Completed', value: 60 }, { label: 'Failed', value: 20, tone: 'danger' }]} />);
  expect(cells(screen.getByRole('table', { name: 'Run outcomes' }))).toEqual([
    ['Slice', 'Value', 'Share'],
    ['Completed', '60', '75%'],
    ['Failed', '20', '25%'],
    ['Total', '80', '100%'],
  ]);
});

test('BarList states every value and marks the largest', () => {
  render(<BarList label="Tokens by agent" unit="K" items={[{ label: 'Deploy Fixer', value: 84 }, { label: 'Docs Writer', value: 42 }]} />);
  const items = within(screen.getByRole('list', { name: 'Tokens by agent' })).getAllByRole('listitem');
  expect(items.map((li) => li.textContent)).toEqual(['Deploy Fixer84K', 'Docs Writer42K']);
  expect(items[0]).toHaveAttribute('data-top');
  expect(items[1]!.querySelector<HTMLElement>('.cr-bar-list__bar')!.style.width).toBe('50%');
});

test('LineChart reads one point at a time with the arrow keys, and announces it', async () => {
  vi.useFakeTimers();
  render(
    <LineChart
      label="Tokens per day"
      unit="K"
      labels={['6 Oct', '7 Oct', '8 Oct']}
      series={[
        { name: 'This period', values: [82, 77, 91] },
        { name: 'Previous', values: [60, 66, 70], style: 'dashed' },
      ]}
    />,
  );
  const plot = screen.getByRole('img', { name: /Tokens per day/ });
  expect(plot).toHaveAttribute('tabindex', '0');

  fireEvent.keyDown(plot, { key: 'ArrowRight' });
  fireEvent.keyDown(plot, { key: 'ArrowRight' });
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(screen.getByRole('status')).toHaveTextContent('7 Oct: This period 77K, Previous 66K');
  expect(plot.querySelector('.cr-line-chart__tip')).toHaveTextContent('7 Oct');

  fireEvent.keyDown(plot, { key: 'End' });
  expect(plot.querySelector('.cr-line-chart__tip')).toHaveTextContent('8 Oct');
  fireEvent.keyDown(plot, { key: 'Escape' });
  expect(plot.querySelector('.cr-line-chart__tip')).not.toBeInTheDocument();

  expect(cells(screen.getByRole('table', { name: 'Tokens per day' }))[1]).toEqual(['6 Oct', '82K', '60K']);
  vi.useRealTimers();
});
