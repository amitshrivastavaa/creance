import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { ConfidenceMeter } from '../molecules/ConfidenceMeter';
import { CheckpointRewind } from './CheckpointRewind';
import { KillSwitch } from './KillSwitch';
import { PermissionLedger } from './PermissionLedger';
import { PlanEditor } from './PlanEditor';
import { QuestionCard } from './QuestionCard';

afterEach(() => vi.useRealTimers());

test('KillSwitch stops only after a full hold, and letting go early does nothing', () => {
  vi.useFakeTimers();
  const onStop = vi.fn();
  render(<KillSwitch onStop={onStop} holdMs={1000} />);
  const button = screen.getByRole('button', { name: 'Hold to stop' });
  expect(button).toHaveAccessibleDescription('Press and hold for 1 second.');

  fireEvent.keyDown(button, { key: ' ' });
  act(() => vi.advanceTimersByTime(600));
  fireEvent.keyUp(button, { key: ' ' });
  act(() => vi.advanceTimersByTime(1000));
  expect(onStop).not.toHaveBeenCalled();

  fireEvent.pointerDown(button, { button: 0 });
  expect(screen.getByRole('button', { name: 'Keep holding' })).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1000));
  expect(onStop).toHaveBeenCalledTimes(1);
});

test('KillSwitch shows the stopped state with a way back', async () => {
  const onResume = vi.fn();
  render(<KillSwitch onStop={() => {}} stopped stoppedLabel="Deploy Fixer stopped" onResume={onResume} />);
  expect(screen.getByRole('status')).toHaveTextContent('Deploy Fixer stopped');
  await userEvent.click(screen.getByRole('button', { name: 'Resume run' }));
  expect(onResume).toHaveBeenCalled();
});

test('ConfidenceMeter says the range in words', () => {
  render(<ConfidenceMeter low="likely" high="very-likely" title="Fairly sure this fixes the deploy" reasons={['All tests pass.']} />);
  expect(screen.getByRole('img')).toHaveAccessibleName('Confidence: fairly sure, between likely and very likely');
  expect(screen.getByRole('region', { name: 'Fairly sure this fixes the deploy' })).toHaveTextContent('All tests pass.');
});

test('QuestionCard sends the chosen option, or free text for something else', async () => {
  const onAnswer = vi.fn();
  render(
    <QuestionCard
      agentName="Data Loader"
      question="Which staging database should I seed?"
      options={[
        { value: 'eu', label: 'staging-eu' },
        { value: 'us', label: 'staging-us' },
      ]}
      onAnswer={onAnswer}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Answer' }));
  expect(onAnswer).toHaveBeenLastCalledWith('staging-eu');

  await userEvent.click(screen.getByRole('radio', { name: 'Something else' }));
  expect(screen.getByRole('button', { name: 'Answer' })).toBeDisabled();
  await userEvent.type(screen.getByRole('textbox', { name: 'Your answer' }), 'staging-ap');
  await userEvent.click(screen.getByRole('button', { name: 'Answer' }));
  expect(onAnswer).toHaveBeenLastCalledWith('staging-ap');
});

const plan = [
  { id: 'a', text: 'Read the deploy logs' },
  { id: 'b', text: 'Run the deploy test suite' },
  { id: 'c', text: 'Redeploy to production automatically' },
];

test('PlanEditor reorders with Alt+arrows, removes and edits steps, and starts with the edited plan', async () => {
  const onStart = vi.fn();
  render(<PlanEditor agentName="Deploy Fixer" steps={plan} onStart={onStart} />);

  screen.getByRole('button', { name: 'Edit step 2: Run the deploy test suite' }).focus();
  await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
  expect(screen.getByRole('button', { name: 'Edit step 1: Run the deploy test suite' })).toHaveFocus();
  expect(await screen.findByText('Step moved to position 1 of 3')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Remove step 3' }));
  expect(screen.getByText('Removed')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Edit step 2: Read the deploy logs' }));
  const input = screen.getByRole('textbox', { name: 'Step 2' });
  await userEvent.clear(input);
  await userEvent.type(input, 'Read the deploy logs and find the first error{Enter}');
  expect(screen.getByText('Edited')).toBeInTheDocument();
  expect(screen.getByText(/2 changes from the agent's plan/)).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Start with this plan' }));
  expect(onStart).toHaveBeenCalledWith([
    { id: 'b', text: 'Run the deploy test suite' },
    { id: 'a', text: 'Read the deploy logs and find the first error' },
  ]);
});

test('CheckpointRewind previews what a rewind undoes before confirming', async () => {
  const onRewind = vi.fn();
  render(
    <CheckpointRewind
      onRewind={onRewind}
      checkpoints={[
        { id: 'now', label: 'After verifying the fix', time: '00:41' },
        {
          id: 'dep',
          label: 'Dependency installed',
          time: '00:18',
          undoes: { files: [{ path: 'deploy/config.yaml', added: 3, removed: 2 }], steps: ['Patch the deploy config', 'Verify the fix'] },
        },
      ]}
    />,
  );
  expect(screen.getByRole('radio', { name: /Now: After verifying the fix/ })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Rewind' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('radio', { name: /Dependency installed/ }));
  expect(screen.getByText('Forget 2 steps: Patch the deploy config, Verify the fix')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Rewind' }));
  expect(onRewind).toHaveBeenCalledWith('dep');
});

test('PermissionLedger revokes with a specific name and offers undo', async () => {
  const onRevoke = vi.fn();
  const onRestore = vi.fn();
  render(
    <PermissionLedger
      onRevoke={onRevoke}
      onRestore={onRestore}
      permissions={[
        { id: 'p1', tool: 'run_tests', agent: 'Deploy Fixer', scope: 'Any suite', granted: '5 days ago, by you', uses: 38 },
        { id: 'p2', tool: 'git push', agent: 'Release Bot', scope: 'main', granted: '2 weeks ago', uses: 14, revoked: true },
      ]}
    />,
  );
  expect(screen.queryByRole('button', { name: 'Revoke git push for Release Bot' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Revoke run_tests for Deploy Fixer' }));
  expect(onRevoke).toHaveBeenCalledWith('p1');
  expect(screen.getByRole('status')).toHaveTextContent('Revoked run_tests for Deploy Fixer. It will ask next time.');
  await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(onRestore).toHaveBeenCalledWith('p1');
});
