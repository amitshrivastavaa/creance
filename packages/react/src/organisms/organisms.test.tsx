import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { ApprovalPrompt } from './ApprovalPrompt';
import { ToolCallCard } from './ToolCallCard';

const prompt = { action: 'npm install zod@3', target: 'web/package.json', reason: 'Missing dependency' } as const;

test('ApprovalPrompt takes focus, is labelled and described, and answers to shortcuts', async () => {
  const user = userEvent.setup();
  const onAllow = vi.fn();
  const onDeny = vi.fn();
  render(<ApprovalPrompt {...prompt} risk="medium" onAllow={onAllow} onDeny={onDeny} />);

  const group = screen.getByRole('group', { name: /wants to run npm install zod@3 on web\/package.json/ });
  expect(group).toHaveFocus();
  expect(group).toHaveAccessibleDescription('Missing dependency');

  await user.keyboard('a');
  expect(onAllow).toHaveBeenLastCalledWith('once');
  await user.keyboard('{Shift>}A{/Shift}');
  expect(onAllow).toHaveBeenLastCalledWith('always');
  await user.keyboard('d');
  expect(onDeny).toHaveBeenCalledOnce();

  // Modifier combos belong to the browser, not the prompt.
  await user.keyboard('{Control>}a{/Control}');
  expect(onAllow).toHaveBeenCalledTimes(2);
});

test('ApprovalPrompt buttons expose their shortcuts and work by click', async () => {
  const user = userEvent.setup();
  const onAllow = vi.fn();
  render(<ApprovalPrompt {...prompt} risk="low" onAllow={onAllow} />);
  const always = screen.getByRole('button', { name: 'Always allow' });
  expect(always).toHaveAttribute('aria-keyshortcuts', 'Shift+A');
  await user.click(always);
  expect(onAllow).toHaveBeenCalledWith('always');
});

test('high risk hides Always allow and ignores its shortcut', async () => {
  const user = userEvent.setup();
  const onAllow = vi.fn();
  render(<ApprovalPrompt {...prompt} risk="high" onAllow={onAllow} />);
  expect(screen.queryByRole('button', { name: 'Always allow' })).not.toBeInTheDocument();
  await user.keyboard('{Shift>}A{/Shift}');
  expect(onAllow).not.toHaveBeenCalled();
});

test('after a decision the buttons go and focus moves to the outcome', async () => {
  const user = userEvent.setup();
  function Harness() {
    const [decision, setDecision] = React.useState<'allow-once' | undefined>();
    return <ApprovalPrompt {...prompt} risk="medium" decision={decision} onAllow={() => setDecision('allow-once')} />;
  }
  render(<Harness />);
  await user.click(screen.getByRole('button', { name: 'Allow once' }));
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByText('Allowed once').closest('p')).toHaveFocus();
});

test('ToolCallCard shows the error and retries', async () => {
  const user = userEvent.setup();
  const onRetry = vi.fn();
  render(<ToolCallCard tool="run_tests" status="error" error="ECONNRESET" onRetry={onRetry} input={{ suite: 'deploy' }} />);
  expect(screen.getByRole('heading', { name: 'Tool call: run_tests' })).toBeInTheDocument();
  expect(screen.getByText('ECONNRESET')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(onRetry).toHaveBeenCalledOnce();
});

test('ToolCallCard hides Retry when the failure is not retryable', () => {
  render(<ToolCallCard tool="shell" status="error" error="Permission denied" retryable={false} onRetry={() => {}} />);
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
});

test('deprecated onApprove still works, warns once in development, and onAllow wins when both are set', async () => {
  const user = userEvent.setup();
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const onApprove = vi.fn();
  const { unmount } = render(<ApprovalPrompt {...prompt} risk="medium" onApprove={onApprove} />);
  await user.click(screen.getByRole('button', { name: 'Allow once' }));
  expect(onApprove).toHaveBeenCalledWith('once');
  unmount();
  render(<ApprovalPrompt {...prompt} risk="medium" onApprove={onApprove} autoFocus={false} />);
  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toMatch(/onApprove` is deprecated.*onAllow/);

  const onAllow = vi.fn();
  render(<ApprovalPrompt {...prompt} action="other" risk="low" onApprove={onApprove} onAllow={onAllow} autoFocus={false} />);
  await user.click(screen.getAllByRole('button', { name: 'Always allow' }).at(-1)!);
  expect(onAllow).toHaveBeenCalledWith('always');
  expect(onApprove).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});

import * as React from 'react';
