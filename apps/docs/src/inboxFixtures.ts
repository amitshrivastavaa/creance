import type { InboxItem } from '@creance-ui/react';

export const NOW = Date.now();
const min = 60_000;

/** Work from other agents, so the inbox has more than one source. */
export const otherAgents: InboxItem[] = [
  { id: 'q1', kind: 'question', title: 'Which staging database should I seed?', agentName: 'Data Loader', createdAt: NOW - 14 * min, urgency: 'normal', detail: 'staging-eu or staging-us' },
  { id: 'f1', kind: 'failed-run', title: 'Nightly dependency upgrade', agentName: 'Upgrader', createdAt: NOW - 42 * min, urgency: 'high', detail: '3 tests failing after upgrading react-router' },
  { id: 'r1', kind: 'review', title: 'Review changes to docs/onboarding.md', agentName: 'Docs Writer', createdAt: NOW - 6 * min, urgency: 'low', detail: '4 hunks' },
  { id: 'a1', kind: 'approval', title: 'Allow git push --force origin main?', agentName: 'Release Bot', createdAt: NOW - 2 * min, urgency: 'high', detail: 'github.com/acme/web' },
];

