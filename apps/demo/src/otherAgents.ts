import type { InboxItem, SkyAgent } from 'creance';

const min = 60_000;

/** Work waiting from other (pretend) agents, so the inbox shows more than this one run. */
export function otherAgents(now: number): InboxItem[] {
  return [
    { id: 'q1', kind: 'question', title: 'Which staging database should I seed?', agentName: 'Data Loader', createdAt: now - 14 * min, urgency: 'normal', detail: 'staging-eu or staging-us' },
    { id: 'f1', kind: 'failed-run', title: 'Nightly dependency upgrade', agentName: 'Upgrader', createdAt: now - 42 * min, urgency: 'high', detail: '3 tests failing after upgrading react-router' },
    { id: 'r1', kind: 'review', title: 'Review changes to docs/onboarding.md', agentName: 'Docs Writer', createdAt: now - 6 * min, urgency: 'low', detail: '4 hunks' },
  ];
}

/** The same pretend agents, flying in the sky above the run. */
export const otherSkyAgents: SkyAgent[] = [
  { id: 'docs', name: 'Docs Writer', status: 'running', detail: '4 steps in' },
  { id: 'data', name: 'Data Loader', status: 'blocked', detail: 'asked which database to seed' },
  { id: 'upgrade', name: 'Upgrader', status: 'failed', detail: '3 tests failing' },
];
