import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { ErrorMessage } from '../atoms/ErrorMessage';
import { Banner } from './Banner';
import { BrowserFrame } from './BrowserFrame';
import { ErrorCard } from './ErrorCard';
import { ProjectBanner } from './ProjectBanner';
import { Video } from './Video';

afterEach(() => localStorage.clear());

test('Banner dismisses and remembers it under its storage key', async () => {
  const onDismiss = vi.fn();
  const { unmount } = render(
    <Banner storageKey="maintenance-oct" onDismiss={onDismiss}>
      Scheduled maintenance on Sunday.
    </Banner>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(onDismiss).toHaveBeenCalled();
  expect(screen.queryByText('Scheduled maintenance on Sunday.')).not.toBeInTheDocument();
  unmount();

  render(<Banner storageKey="maintenance-oct">Scheduled maintenance on Sunday.</Banner>);
  expect(screen.queryByText('Scheduled maintenance on Sunday.')).not.toBeInTheDocument();
});

test('Banner uses alert for danger and status otherwise', () => {
  render(
    <>
      <Banner tone="danger">The model provider is returning errors.</Banner>
      <Banner tone="ink">3 agents are waiting for you.</Banner>
    </>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('The model provider is returning errors.');
  expect(screen.getByRole('status')).toHaveTextContent('3 agents are waiting for you.');
});

test('ErrorMessage is only announced when asked to be', () => {
  const { rerender } = render(<ErrorMessage>Couldn&apos;t save the plan.</ErrorMessage>);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  rerender(<ErrorMessage live>Couldn&apos;t save the plan.</ErrorMessage>);
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

test('ErrorCard is a region named by its title, with the raw error', () => {
  render(<ErrorCard title="Run 40 failed at step 3" details="TypeError: useHistory is not a function" />);
  expect(screen.getByRole('region', { name: 'Run 40 failed at step 3' })).toHaveTextContent('TypeError: useHistory is not a function');
});

test('ProjectBanner labels its progress', () => {
  render(<ProjectBanner name="web" message="92% of October's budget used." progress={{ value: 92, max: 100, label: 'web token budget' }} />);
  expect(screen.getByRole('progressbar', { name: 'web token budget' })).toHaveAttribute('value', '92');
});

test('BrowserFrame is a figure with its caption', () => {
  render(
    <BrowserFrame url="preview.example.dev" caption="The preview deploy">
      <p>Page</p>
    </BrowserFrame>,
  );
  expect(screen.getByRole('figure', { name: 'The preview deploy' })).toBeInTheDocument();
});

test('Video starts muted with captions on, and its controls drive the media element', async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  render(<Video src="/run-41.mp4" label="Run 41 recording" captions={{ src: '/run-41.vtt' }} />);
  expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^CC\s*captions$/ })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'Play Run 41 recording' }));
  expect(play).toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  play.mockRestore();
});
