import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Message } from './Message';
import { MessageList } from './MessageList';
import { ModelPicker } from './ModelPicker';
import { PromptInput } from './PromptInput';
import { Reasoning } from './Reasoning';
import { Citation, Sources } from './Sources';
import { Suggestions } from './Suggestions';

test('Message says who is speaking, and shows actions only on a finished answer', () => {
  const { rerender } = render(<Message from="user">Why is it failing?</Message>);
  expect(screen.getByText('You:')).toHaveClass('cr-visually-hidden');

  const actions = <button type="button">Copy</button>;
  rerender(
    <Message from="assistant" name="Deploy Fixer" status="streaming" actions={actions}>
      Installing
    </Message>,
  );
  expect(screen.getByText('Deploy Fixer')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();

  rerender(
    <Message from="assistant" name="Deploy Fixer" actions={actions}>
      Installed
    </Message>,
  );
  expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();

  rerender(<Message from="assistant" name="Deploy Fixer" status="pending" />);
  expect(screen.getByRole('status')).toHaveTextContent('Deploy Fixer is thinking');
});

test('MessageList is a named region that can be scrolled by keyboard, and announces what it is told to', async () => {
  vi.useFakeTimers();
  render(
    <MessageList announcement="Deploy Fixer replied">
      <Message from="user">Hello</Message>
    </MessageList>,
  );
  expect(screen.getByRole('region', { name: 'Conversation' })).toHaveAttribute('tabindex', '0');
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(screen.getByRole('status')).toHaveTextContent('Deploy Fixer replied');
  vi.useRealTimers();
});

test('PromptInput sends on Enter, keeps Shift+Enter for a new line, and clears after sending', async () => {
  const onSubmit = vi.fn();
  render(<PromptInput label="Message Deploy Fixer" onSubmit={onSubmit} />);
  const field = screen.getByRole('textbox', { name: 'Message Deploy Fixer' });
  const send = screen.getByRole('button', { name: 'Send' });
  expect(send).toBeDisabled();

  await userEvent.type(field, '  Line one{Shift>}{Enter}{/Shift}line two  ');
  expect(onSubmit).not.toHaveBeenCalled();
  expect(send).toBeEnabled();
  await userEvent.keyboard('{Enter}');
  expect(onSubmit).toHaveBeenCalledWith('Line one\nline two');
  expect(field).toHaveValue('');
});

test('PromptInput turns Send into Stop while the agent works, and manages attached files', async () => {
  const onStop = vi.fn();
  const onRemoveAttachment = vi.fn();
  const onAttach = vi.fn();
  const { container } = render(
    <PromptInput
      label="Message"
      status="working"
      onStop={onStop}
      attachments={[{ id: 'log', name: 'deploy.log', detail: '48 KB' }]}
      onRemoveAttachment={onRemoveAttachment}
      onAttach={onAttach}
    />,
  );
  expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
  expect(onStop).toHaveBeenCalledOnce();

  await userEvent.click(screen.getByRole('button', { name: 'Remove deploy.log' }));
  expect(onRemoveAttachment).toHaveBeenCalledWith('log');

  const file = new File(['x'], 'trace.txt', { type: 'text/plain' });
  await userEvent.upload(container.querySelector<HTMLInputElement>('input[type=file]')!, file);
  expect(onAttach).toHaveBeenCalledWith([file]);
});

test('Reasoning says how long the agent thought, and opens to show the thinking', async () => {
  const { rerender } = render(<Reasoning seconds={8}>The log stops at the build step.</Reasoning>);
  const details = screen.getByRole('group');
  expect(details).not.toHaveAttribute('open');
  await userEvent.click(screen.getByText('Thought for 8 seconds'));
  expect(details).toHaveAttribute('open');

  rerender(<Reasoning seconds={1}>x</Reasoning>);
  expect(screen.getByText('Thought for 1 second')).toBeInTheDocument();
  rerender(<Reasoning thinking>x</Reasoning>);
  expect(screen.getByText('Thinking')).toBeInTheDocument();
});

test('Citation is a link with an href and a button without; Sources numbers its list', async () => {
  const onClick = vi.fn();
  render(
    <>
      <Citation index={1} href="#one" />
      <Citation index={2} onClick={onClick} label="Source 2, Commit a41c9e2" />
      <Sources items={[{ title: 'Build 482 log', detail: 'deploys/web/482', href: '#one' }, { title: 'Commit a41c9e2' }]} />
    </>,
  );
  expect(screen.getByRole('link', { name: 'Source 1' })).toHaveAttribute('href', '#one');
  await userEvent.click(screen.getByRole('button', { name: 'Source 2, Commit a41c9e2' }));
  expect(onClick).toHaveBeenCalledOnce();
  const items = within(screen.getByRole('list', { name: 'Sources' })).getAllByRole('listitem');
  expect(items.map((li) => li.textContent)).toEqual(['1Build 482 logdeploys/web/482', '2Commit a41c9e2']);
});

test('Suggestions sends the one that is chosen', async () => {
  const onSelect = vi.fn();
  render(<Suggestions items={['Explain the failure', 'Show the diff']} onSelect={onSelect} />);
  await userEvent.click(within(screen.getByRole('list', { name: 'Suggestions' })).getByRole('button', { name: 'Show the diff' }));
  expect(onSelect).toHaveBeenCalledWith('Show the diff');
});

test('ModelPicker names the chosen model on its button and changes it from the menu', async () => {
  const onValueChange = vi.fn();
  render(
    <ModelPicker
      onValueChange={onValueChange}
      models={[
        { value: 'large', label: 'Large', description: 'Most capable' },
        { value: 'small', label: 'Small', description: 'Fastest' },
      ]}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Model: Large' }));
  expect(screen.getByRole('menuitemradio', { name: /Large/ })).toBeChecked();
  await userEvent.click(screen.getByRole('menuitemradio', { name: /Small/ }));
  expect(onValueChange).toHaveBeenCalledWith('small');
  expect(screen.getByRole('button', { name: 'Model: Small' })).toBeInTheDocument();
});
