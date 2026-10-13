import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { BudgetMeter } from './BudgetMeter';
import { renderToString } from 'react-dom/server';
import { Calendar } from './Calendar';
import { NeedsYouInbox } from '../organisms/NeedsYouInbox';
import { RelativeTimeCard } from './RelativeTimeCard';
import { StatusBadge } from './StatusBadge';
import { IconButton } from '../atoms/IconButton';

afterEach(() => vi.useRealTimers());

test('StatusBadge ticks while running and freezes once ended', () => {
  vi.useFakeTimers({ now: 100_000 });
  const { rerender } = render(<StatusBadge status="running" startedAt={88_000} />);
  // The time is read just after mount.
  act(() => vi.advanceTimersByTime(0));
  expect(screen.getByText(/12s/)).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(3_000));
  expect(screen.getByText(/15s/)).toBeInTheDocument();

  rerender(<StatusBadge status="done" startedAt={88_000} endedAt={104_000} />);
  act(() => vi.advanceTimersByTime(10_000));
  expect(screen.getByText(/Done/)).toHaveTextContent('Done · , 16s');
});

test('StatusBadge keeps counting while waiting for a person', () => {
  vi.useFakeTimers({ now: 100_000 });
  render(<StatusBadge status="waiting" startedAt={95_000} />);
  act(() => vi.advanceTimersByTime(0));
  expect(screen.getByText(/5s/)).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(4_000));
  expect(screen.getByText(/9s/)).toBeInTheDocument();
});

test('nothing reads the clock while rendering on the server, so Next.js can prerender', () => {
  const now = vi.spyOn(Date, 'now');
  const running = renderToString(<StatusBadge status="running" startedAt={88_000} />);
  const relative = renderToString(<RelativeTimeCard date={new Date('2026-10-13T12:00:00Z')} />);
  const calendar = renderToString(<Calendar aria-label="Due date" />);
  const inbox = renderToString(<NeedsYouInbox items={[{ id: 'a', kind: 'approval', title: 'Install zod', agentName: 'Deploy Fixer', createdAt: 0, urgency: 'high' }]} />);
  expect(now).not.toHaveBeenCalled();
  now.mockRestore();
  // An open-ended time is left out until mounted; a finished one is known.
  expect(running).toContain('Running');
  expect(running).not.toMatch(/\d+s/);
  expect(renderToString(<StatusBadge status="done" startedAt={88_000} endedAt={104_000} />)).toMatch(/16s/);
  expect(relative).toContain('Oct 13, 2026');
  expect(calendar).toContain('aria-busy="true"');
  expect(inbox).toContain('Install zod');
  expect(inbox).not.toContain('waiting');
  expect(renderToString(<Calendar aria-label="Due date" defaultMonth={new Date(2026, 9, 1)} />)).toContain('October 2026');
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
