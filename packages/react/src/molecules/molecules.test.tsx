import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { BudgetMeter } from './BudgetMeter';
import { StatusBadge } from './StatusBadge';
import { IconButton } from '../atoms/IconButton';

afterEach(() => vi.useRealTimers());

test('StatusBadge ticks while running and freezes once ended', () => {
  vi.useFakeTimers({ now: 100_000 });
  const { rerender } = render(<StatusBadge status="running" startedAt={88_000} />);
  expect(screen.getByText(/12s/)).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(3_000));
  expect(screen.getByText(/15s/)).toBeInTheDocument();

  rerender(<StatusBadge status="done" startedAt={88_000} endedAt={104_000} />);
  act(() => vi.advanceTimersByTime(10_000));
  expect(screen.getByText(/Done/)).toHaveTextContent('Done · , 16s');
});

test('BudgetMeter warns at 80% and flags over-limit', () => {
  const { container, rerender } = render(<BudgetMeter used={40_000} limit={50_000} unit="tokens" />);
  expect(container.firstElementChild).toHaveAttribute('data-tone', 'warning');
  expect(screen.getByRole('progressbar', { name: 'Token budget: 40K / 50K tokens' })).toBeInTheDocument();

  rerender(<BudgetMeter used={51_000} limit={50_000} unit="tokens" />);
  expect(container.firstElementChild).toHaveAttribute('data-tone', 'danger');
  expect(screen.getByText(/over limit/)).toBeInTheDocument();
});

test('IconButton takes its accessible name from label', () => {
  render(<IconButton label="Retry tool call" icon={<svg />} tooltip={false} />);
  expect(screen.getByRole('button', { name: 'Retry tool call' })).toBeInTheDocument();
});
