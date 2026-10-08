import * as RadixToast from '@radix-ui/react-toast';
import { useSyncExternalStore, type ReactNode } from 'react';
import { CheckIcon, CrossIcon, InfoIcon } from '../../internal/icons';
import './Toast.css';

export interface ToastOptions {
  title: ReactNode;
  /** `success` and `danger` change the icon; the words must say what happened. */
  tone?: 'default' | 'success' | 'danger';
  /** One follow-up, such as Undo or Open run. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it leaves. Default 5000. It stays while hovered or focused. */
  duration?: number;
}

interface Item extends ToastOptions {
  id: number;
}

// One queue per page: toasts outlive the component that raised them.
let items: Item[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Show a toast. Needs one `<Toaster />` mounted somewhere in the app. Returns a function that dismisses it. */
export function toast(options: ToastOptions) {
  const id = nextId++;
  items = [...items, { ...options, id }];
  emit();
  return () => dismiss(id);
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const icons = { default: InfoIcon, success: CheckIcon, danger: CrossIcon };

export interface ToasterProps {
  /** Accessible name of the region; F8 moves focus to it. */
  label?: string;
}

/** Renders queued toasts as glass capsules rising from the bottom. Announced politely by screen readers. */
export function Toaster({ label = 'Notifications' }: ToasterProps) {
  const queue = useSyncExternalStore(subscribe, () => items, () => items);
  return (
    <RadixToast.Provider label={label} swipeDirection="down">
      {queue.map(({ id, title, tone = 'default', action, duration = 5000 }) => {
        const Icon = icons[tone];
        return (
          <RadixToast.Root
            key={id}
            className="cr-toast cr-glass"
            data-tone={tone}
            duration={duration}
            onOpenChange={(open) => !open && dismiss(id)}
          >
            <Icon />
            <RadixToast.Title className="cr-toast__title">{title}</RadixToast.Title>
            {action && (
              <RadixToast.Action className="cr-toast__action" altText={action.label} onClick={action.onClick}>
                {action.label}
              </RadixToast.Action>
            )}
          </RadixToast.Root>
        );
      })}
      <RadixToast.Viewport className="cr-toast-viewport" />
    </RadixToast.Provider>
  );
}
