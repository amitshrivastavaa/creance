import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { AgentHandoffBanner } from './AgentHandoffBanner';
import { DiffReview, type DiffHunk } from './DiffReview';
import { NeedsYouInbox, type InboxItem } from './NeedsYouInbox';
import { RunTimeline, type TimelineStep } from './RunTimeline';

const hunks: DiffHunk[] = [
  { id: 'h1', header: '@@ -1 +1 @@', lines: [{ type: 'remove', content: 'a', oldNumber: 1 }, { type: 'add', content: 'b', newNumber: 1 }] },
  { id: 'h2', header: '@@ -9 +9 @@', lines: [{ type: 'add', content: 'c', newNumber: 9 }] },
];

test('DiffReview: J/K move between hunks, Y/N decide, Apply reports the result', async () => {
  const user = userEvent.setup();
  const onApply = vi.fn();
  render(<DiffReview file="config.yaml" hunks={hunks} onApply={onApply} />);
  const apply = screen.getByRole('button', { name: 'Apply 0 of 2' });
  expect(apply).toBeDisabled();

  const [first, second] = screen.getAllByRole('region', { name: /Hunk \d of 2/ });
  await user.click(within(first!).getByRole('button', { name: 'Accept' }));
  expect(within(first!).getByRole('button', { name: 'Accept' })).toHaveAttribute('aria-pressed', 'true');

  await user.keyboard('j');
  expect(second).toHaveFocus();
  await user.keyboard('n');
  expect(within(second!).getByRole('button', { name: 'Reject' })).toHaveAttribute('aria-pressed', 'true');
  await user.keyboard('k');
  expect(first).toHaveFocus();

  await user.click(screen.getByRole('button', { name: 'Apply 1 of 2' }));
  expect(onApply).toHaveBeenCalledWith({ accepted: ['h1'], rejected: ['h2'] });
});

test('DiffReview: Accept all, and the read-only applied state', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<DiffReview file="config.yaml" hunks={hunks} />);
  await user.click(screen.getByRole('button', { name: 'Accept all' }));
  expect(screen.getByRole('button', { name: 'Apply 2 of 2' })).toBeEnabled();

  rerender(<DiffReview file="config.yaml" hunks={hunks} applied={{ accepted: ['h1'], rejected: ['h2'] }} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByText('Applied 1 of 2 hunks')).toBeInTheDocument();
});

test('NeedsYouInbox sorts by urgency then age and counts by kind', async () => {
  const user = userEvent.setup();
  const onOpen = vi.fn();
  const items: InboxItem[] = [
    { id: '1', kind: 'review', title: 'Review config', agentName: 'A', createdAt: 100, urgency: 'normal' },
    { id: '2', kind: 'approval', title: 'Allow push', agentName: 'B', createdAt: 300, urgency: 'high' },
    { id: '3', kind: 'approval', title: 'Allow install', agentName: 'A', createdAt: 50, urgency: 'normal' },
  ];
  render(<NeedsYouInbox items={items} now={60_050} onOpen={onOpen} />);
  expect(screen.getByRole('heading', { name: 'Needs you 3' })).toBeInTheDocument();
  expect(screen.getByText(/2 approvals/)).toBeInTheDocument();
  const titles = screen.getAllByRole('button').map((b) => b.textContent);
  expect(titles).toEqual(['Allow push', 'Allow install', 'Review config']);
  expect(screen.getByText('waiting 1m 00s')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Allow push' }));
  expect(onOpen).toHaveBeenCalledWith(items[1]);
});

test('AgentHandoffBanner focuses its heading and reports actions', async () => {
  const user = userEvent.setup();
  const onAction = vi.fn();
  render(
    <AgentHandoffBanner agentName="Deploy Fixer" summary="All tests pass." actions={[{ id: 'pr', label: 'Open pull request', primary: true }]} onAction={onAction} />,
  );
  expect(screen.getByRole('heading', { name: 'Deploy Fixer finished and handed back to you' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Open pull request' }));
  expect(onAction).toHaveBeenCalledWith('pr');
});

function fakeScroll(el: HTMLElement, sizes: { scrollHeight: number; clientHeight: number }) {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => sizes.scrollHeight });
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => sizes.clientHeight });
  el.scrollTo = ((opts: ScrollToOptions) => {
    el.scrollTop = opts.top ?? 0;
  }) as typeof el.scrollTo;
}

test('RunTimeline follows new steps, pauses when scrolled up, and offers Jump to latest', async () => {
  const step = (n: number): TimelineStep => ({ id: `s${n}`, title: `Step ${n}`, status: 'done' });
  const { rerender } = render(<RunTimeline steps={[step(1)]} />);
  const region = screen.getByRole('region', { name: 'Run timeline' });
  const sizes = { scrollHeight: 1000, clientHeight: 200 };
  fakeScroll(region, sizes);

  // At the bottom: new content is followed.
  rerender(<RunTimeline steps={[step(1), step(2)]} />);
  expect(region.scrollTop).toBe(1000);

  // Scroll up: following stops and the jump button appears on new content.
  region.scrollTop = 100;
  fireEvent.scroll(region);
  sizes.scrollHeight = 1200;
  rerender(<RunTimeline steps={[step(1), step(2), step(3)]} />);
  expect(region.scrollTop).toBe(100);
  const jump = screen.getByRole('button', { name: 'Jump to latest' });

  await act(async () => jump.click());
  expect(region.scrollTop).toBe(1200);
  expect(screen.queryByRole('button', { name: 'Jump to latest' })).not.toBeInTheDocument();
});

test('RunTimeline renders nested steps, retries and errors, and selects tool calls', async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(
    <RunTimeline
      onSelectToolCall={onSelect}
      steps={[
        {
          id: 'v',
          title: 'Verify',
          status: 'running',
          children: [{ id: 't', title: 'Tests', status: 'failed', error: 'Build broke' }],
          toolCalls: [{ id: 'c1', tool: 'run_tests', status: 'success', attempt: 2 }],
        },
      ]}
    />,
  );
  expect(screen.getByText('Build broke')).toBeInTheDocument();
  expect(screen.getByText('attempt 2')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /run_tests/ }));
  expect(onSelect).toHaveBeenCalledWith('c1');
});
