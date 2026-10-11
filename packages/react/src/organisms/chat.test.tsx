import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Chat, type ChatMessage } from './Chat';

const messages: ChatMessage[] = [
  { id: '1', from: 'user', content: 'Why is the deploy failing?' },
  {
    id: '2',
    from: 'assistant',
    content: <p>The build cannot find zod.</p>,
    reasoning: { content: 'The log stops at the build step.', seconds: 8 },
    sources: [{ title: 'Build 482 log', href: '#log' }],
  },
];

test('Chat shows each turn with its thinking and sources, in a region named after the agent', () => {
  render(<Chat agentName="Deploy Fixer" messages={messages} />);
  const log = screen.getByRole('region', { name: 'Conversation with Deploy Fixer' });
  expect(within(log).getByText('Why is the deploy failing?')).toBeInTheDocument();
  expect(within(log).getByText('Deploy Fixer')).toBeInTheDocument();
  expect(within(log).getByText('Thought for 8 seconds')).toBeInTheDocument();
  expect(within(log).getByRole('link', { name: /Build 482 log/ })).toHaveAttribute('href', '#log');
  expect(screen.getByRole('textbox', { name: 'Message Deploy Fixer' })).toBeInTheDocument();
});

test('Chat sends what is typed and what is chosen from the suggestions, and stops on request', async () => {
  const onSend = vi.fn();
  const onStop = vi.fn();
  const { rerender } = render(<Chat messages={[]} empty="Ask anything about this deploy." suggestions={['Explain the failure']} onSend={onSend} onStop={onStop} />);
  expect(screen.getByText('Ask anything about this deploy.')).toBeInTheDocument();

  await userEvent.type(screen.getByRole('textbox'), 'Run the tests{Enter}');
  await userEvent.click(screen.getByRole('button', { name: 'Explain the failure' }));
  expect(onSend.mock.calls).toEqual([['Run the tests'], ['Explain the failure']]);

  rerender(<Chat messages={[]} status="working" onSend={onSend} onStop={onStop} />);
  await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
  expect(onStop).toHaveBeenCalledOnce();
});

test('Chat announces a reply once it has finished, not while it streams', async () => {
  vi.useFakeTimers();
  const streaming: ChatMessage[] = [messages[0]!, { id: '2', from: 'assistant', content: 'The build', status: 'streaming' }];
  const { rerender } = render(<Chat agentName="Deploy Fixer" messages={streaming} />);
  await act(() => vi.advanceTimersByTimeAsync(200));
  const spoken = () => screen.getAllByRole('status').map((s) => s.textContent).join('');
  expect(spoken()).toBe('');

  rerender(<Chat agentName="Deploy Fixer" messages={messages} />);
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(spoken()).toBe('Deploy Fixer replied');
  vi.useRealTimers();
});
