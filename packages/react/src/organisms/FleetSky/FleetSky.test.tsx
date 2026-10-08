import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { FleetSky } from './FleetSky';

test('every agent has a real, labelled tag; with onSelect they are buttons', async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(
    <FleetSky
      onSelect={onSelect}
      agents={[
        { id: 'a', name: 'Deploy Fixer', status: 'waiting', detail: 'wants to run npm install zod@3' },
        { id: 'b', name: 'Docs Writer', status: 'running' },
      ]}
    />,
  );
  expect(screen.getByRole('region', { name: 'Your agents' })).toBeInTheDocument();
  const tag = screen.getByRole('button', { name: /Deploy Fixer.*needs you.*npm install zod@3/ });
  await user.click(tag);
  expect(onSelect).toHaveBeenCalledWith('a');
  expect(screen.getByRole('button', { name: /Docs Writer.*running/ })).toBeInTheDocument();
});

test('announces agents as they start needing you', async () => {
  const { rerender } = render(<FleetSky agents={[{ id: 'a', name: 'Deploy Fixer', status: 'running' }]} />);
  rerender(<FleetSky agents={[{ id: 'a', name: 'Deploy Fixer', status: 'waiting' }]} />);
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Deploy Fixer needs you'));
});
