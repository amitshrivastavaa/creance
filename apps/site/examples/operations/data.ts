// Sample data for the examples app. Acme and everything in it is made up; nothing is connected.
import type { DiffHunk, DotStatus, InboxItem, StandingPermission } from '@creance-ui/react';

const minute = 60_000;
/** Ages are relative to when the page opened, so "waiting 3m" stays true. */
export const openedAt = Date.now();

export interface Agent {
  id: string;
  name: string;
  status: DotStatus;
  state: string;
  description: string;
  week: number[];
  permissions: number;
}

export const agents: Agent[] = [
  { id: 'deploy-fixer', name: 'Deploy Fixer', status: 'waiting', state: 'Waiting', description: 'Finds why a build or deploy fails, and fixes it.', week: [3, 5, 2, 6, 4, 7, 5], permissions: 5 },
  { id: 'data-loader', name: 'Data Loader', status: 'running', state: 'Running', description: 'Seeds, migrates and backfills databases.', week: [1, 2, 4, 2, 3, 1, 2], permissions: 3 },
  { id: 'docs-writer', name: 'Docs Writer', status: 'done', state: 'Idle', description: 'Writes and updates docs from the code.', week: [2, 1, 3, 2, 0, 1, 2], permissions: 2 },
  { id: 'upgrader', name: 'Upgrader', status: 'failed', state: 'Failed', description: 'Upgrades dependencies, one pull request each.', week: [1, 0, 2, 1, 1, 0, 1], permissions: 4 },
  { id: 'release-bot', name: 'Release Bot', status: 'done', state: 'Idle', description: 'Drafts release notes and tags releases.', week: [0, 1, 0, 1, 0, 0, 1], permissions: 3 },
  { id: 'triage', name: 'Triage', status: 'done', state: 'Idle', description: 'Labels new issues and routes them to a team.', week: [4, 6, 5, 3, 6, 2, 4], permissions: 1 },
];

export type RunStatus = 'waiting' | 'running' | 'done' | 'failed' | 'stopped';
export interface Run {
  id: string;
  title: string;
  agent: string;
  status: RunStatus;
  steps: [number, number];
  tokens: number;
  seconds: number;
  /** Minutes ago. */
  started: number;
  byMe: boolean;
}

const named: Omit<Run, 'id'>[] = [
  { title: 'Fix the failing deploy', agent: 'Deploy Fixer', status: 'waiting', steps: [3, 5], tokens: 9800, seconds: 252, started: 3, byMe: true },
  { title: 'Seed staging', agent: 'Data Loader', status: 'running', steps: [2, 4], tokens: 4100, seconds: 760, started: 12, byMe: false },
  { title: 'Write onboarding docs', agent: 'Docs Writer', status: 'done', steps: [6, 6], tokens: 18000, seconds: 543, started: 60, byMe: true },
  { title: 'Upgrade react-router', agent: 'Upgrader', status: 'failed', steps: [4, 7], tokens: 31200, seconds: 1338, started: 180, byMe: false },
  { title: 'Rotate API keys', agent: 'Deploy Fixer', status: 'done', steps: [3, 3], tokens: 2400, seconds: 111, started: 1500, byMe: true },
  { title: 'Backfill search index', agent: 'Data Loader', status: 'done', steps: [5, 5], tokens: 44000, seconds: 2290, started: 1560, byMe: false },
  { title: 'Label new issues', agent: 'Triage', status: 'done', steps: [2, 2], tokens: 3300, seconds: 48, started: 1620, byMe: false },
  { title: 'Draft release notes', agent: 'Release Bot', status: 'stopped', steps: [1, 3], tokens: 6300, seconds: 125, started: 2900, byMe: true },
  { title: 'Fix flaky checkout test', agent: 'Deploy Fixer', status: 'done', steps: [4, 4], tokens: 12000, seconds: 400, started: 3000, byMe: true },
  { title: 'Upgrade TypeScript', agent: 'Upgrader', status: 'done', steps: [5, 5], tokens: 27000, seconds: 1042, started: 4300, byMe: false },
];
// Older runs repeat the same jobs, so the table has pages to turn.
export const runs: Run[] = [
  ...named,
  ...named.slice(2).flatMap((r, i) => [{ ...r, status: 'done' as const, steps: [r.steps[1], r.steps[1]] as [number, number], started: r.started + 4400 + i * 1500 }]),
  ...named.slice(4).map((r, i) => ({ ...r, status: 'done' as const, steps: [r.steps[1], r.steps[1]] as [number, number], started: r.started + 16000 + i * 1700 })),
].map((r, i) => ({ ...r, id: `r${41 - i}` }));

/** The one run with a conversation behind it. */
export const deployRunId = 'r41';

export const inbox: InboxItem[] = [
  { id: 'a1', kind: 'approval', title: 'Run npm install zod@3 in web/', agentName: 'Deploy Fixer', createdAt: openedAt - 3 * minute, urgency: 'high', detail: 'Fix the failing deploy, step 3 of 5' },
  { id: 'r1', kind: 'review', title: 'Review 2 changes to router.tsx', agentName: 'Upgrader', createdAt: openedAt - 14 * minute, urgency: 'normal', detail: 'Upgrade react-router' },
  { id: 'q1', kind: 'question', title: 'Which region should I seed first?', agentName: 'Data Loader', createdAt: openedAt - 31 * minute, urgency: 'normal', detail: 'Seed staging' },
  { id: 'a2', kind: 'approval', title: 'Publish onboarding docs to the wiki', agentName: 'Docs Writer', createdAt: openedAt - 60 * minute, urgency: 'low', detail: 'Write onboarding docs' },
  { id: 'q2', kind: 'question', title: 'Keep the 30 second timeout?', agentName: 'Deploy Fixer', createdAt: openedAt - 120 * minute, urgency: 'low', detail: 'Fix the failing deploy' },
];

export const routerHunks: DiffHunk[] = [
  {
    id: 'h1',
    header: '@@ -1,4 +1,4 @@',
    lines: [
      { type: 'remove', content: "import { BrowserRouter, Switch, Route } from 'react-router-dom';", oldNumber: 1 },
      { type: 'add', content: "import { BrowserRouter, Routes, Route } from 'react-router-dom';", newNumber: 1 },
      { type: 'context', content: "import { Home } from './pages/Home';", oldNumber: 2, newNumber: 2 },
    ],
  },
  {
    id: 'h2',
    header: '@@ -12,6 +12,6 @@',
    lines: [
      { type: 'context', content: '<BrowserRouter>', oldNumber: 12, newNumber: 12 },
      { type: 'remove', content: '  <Switch>', oldNumber: 13 },
      { type: 'remove', content: '    <Route path="/" component={Home} />', oldNumber: 14 },
      { type: 'add', content: '  <Routes>', newNumber: 13 },
      { type: 'add', content: '    <Route path="/" element={<Home />} />', newNumber: 14 },
    ],
  },
];

export const permissions: StandingPermission[] = [
  { id: 'p1', tool: 'read_file', agent: 'All agents', scope: 'This repository', granted: '2 weeks ago, by you', uses: 412 },
  { id: 'p2', tool: 'run_tests', agent: 'Deploy Fixer', scope: 'Any suite', granted: '5 days ago, by you', uses: 38 },
  { id: 'p3', tool: 'shell', agent: 'Docs Writer', scope: 'Read-only commands', granted: 'Yesterday, by you', uses: 57 },
  { id: 'p4', tool: 'git push', agent: 'Release Bot', scope: 'Release branches only', granted: '3 days ago, by you', uses: 6 },
  { id: 'p5', tool: 'db write', agent: 'Data Loader', scope: 'Staging only', granted: '1 week ago, by you', uses: 22 },
];

export const decisions = [
  { id: 'd1', when: '1 hour ago', agent: 'Docs Writer', what: 'shell: ls docs/', result: 'Always allowed' },
  { id: 'd2', when: '3 hours ago', agent: 'Upgrader', what: 'git push origin main', result: 'Denied' },
  { id: 'd3', when: 'Yesterday', agent: 'Data Loader', what: 'db write: seed users (staging)', result: 'Allowed once' },
  { id: 'd4', when: 'Yesterday', agent: 'Release Bot', what: 'git tag v2.4.0', result: 'Allowed once' },
];

// Thirty days of tokens, in thousands, ending yesterday. Fixed, so the charts look the same on every visit.
const tokens = [36, 41, 39, 52, 47, 33, 29, 44, 58, 51, 63, 49, 38, 31, 42, 55, 48, 61, 73, 39, 28, 64, 82, 77, 91, 68, 45, 96, 88, 79];
const previous = [31, 35, 40, 38, 44, 30, 27, 39, 47, 45, 52, 44, 35, 28, 38, 44, 51, 47, 58, 35, 30, 52, 60, 66, 70, 62, 41, 74, 70, 65];
const lastDay = new Date(2026, 9, 11);
const day = (back: number) => new Date(lastDay.getTime() - back * 86_400_000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export function tokenSeries(days: number) {
  return {
    labels: Array.from({ length: days }, (_, i) => day(days - 1 - i)),
    current: tokens.slice(-days),
    previous: previous.slice(-days),
  };
}

export const limits = [
  { agent: 'Deploy Fixer', used: 412, limit: 600 },
  { agent: 'Data Loader', used: 268, limit: 300 },
  { agent: 'Docs Writer', used: 190, limit: 500 },
  { agent: 'Upgrader', used: 160, limit: 400 },
  { agent: 'Triage', used: 110, limit: 300 },
  { agent: 'Release Bot', used: 60, limit: 200 },
];

export interface Service {
  id: string;
  name: string;
  about: string;
  scope?: string;
}
export const services: Service[] = [
  { id: 'github', name: 'GitHub', about: 'Repositories, pull requests and checks.', scope: 'acme/web, acme/api' },
  { id: 'slack', name: 'Slack', about: 'Post run results and ask for approvals in a channel.', scope: '#deploys' },
  { id: 'sentry', name: 'Sentry', about: 'Read errors so agents can trace a failure.', scope: 'web, api' },
  { id: 'linear', name: 'Linear', about: 'Open and update issues from a run.' },
  { id: 'pagerduty', name: 'PagerDuty', about: 'Start a run when an incident opens.' },
  { id: 'webhooks', name: 'Webhooks', about: 'Send run events to your own endpoint.', scope: '2 endpoints' },
];

export const toolServers = [
  { id: 'filesystem', tools: 6, usedBy: 'All agents', ok: true, latency: '12 ms' },
  { id: 'postgres-staging', tools: 3, usedBy: 'Data Loader', ok: true, latency: '40 ms' },
  { id: 'browser', tools: 4, usedBy: 'Docs Writer', ok: false, latency: '—' },
];

export interface AuditEvent {
  id: string;
  time: string;
  actor: string;
  kind: 'agent' | 'human';
  event: string;
  target: string;
  result: 'Waiting' | 'Succeeded' | 'Denied' | 'Failed';
  detail: Record<string, string | number | boolean>;
}
export const audit: AuditEvent[] = [
  { id: 'e7', time: '10:42', actor: 'Deploy Fixer', kind: 'agent', event: 'Asked for permission', target: 'npm install zod@3', result: 'Waiting', detail: { event: 'permission.requested', run: 'Fix the failing deploy', command: 'npm install zod@3', risk: 'medium' } },
  { id: 'e6', time: '10:41', actor: 'Deploy Fixer', kind: 'agent', event: 'Called a tool', target: 'read_logs deploys/web/482', result: 'Succeeded', detail: { event: 'tool.called', tool: 'read_logs', input: 'deploys/web/482', duration_ms: 1800 } },
  { id: 'e5', time: '10:38', actor: 'Amit Shrivastava', kind: 'human', event: 'Started a run', target: 'Fix the failing deploy', result: 'Succeeded', detail: { event: 'run.started', agent: 'Deploy Fixer', budget_tokens: 50000 } },
  { id: 'e4', time: '09:55', actor: 'Amit Shrivastava', kind: 'human', event: 'Granted a permission', target: 'shell for Docs Writer', result: 'Succeeded', detail: { event: 'permission.granted', tool: 'shell', scope: 'Read-only commands', always: true } },
  { id: 'e3', time: '07:20', actor: 'Upgrader', kind: 'agent', event: 'Asked for permission', target: 'git push origin main', result: 'Denied', detail: { event: 'permission.denied', run: 'Upgrade react-router', command: 'git push origin main', risk: 'high', decided_by: 'Amit Shrivastava', reason: 'Use a pull request' } },
  { id: 'e2', time: '07:18', actor: 'Upgrader', kind: 'agent', event: 'Ran tests', target: 'pnpm test router', result: 'Failed', detail: { event: 'tool.failed', tool: 'run_tests', failing: 3, passing: 45 } },
  { id: 'e1', time: '06:02', actor: 'Triage', kind: 'agent', event: 'Labelled an issue', target: 'acme/web#1182', result: 'Succeeded', detail: { event: 'issue.labelled', issue: 'acme/web#1182', labels: 'bug, checkout' } },
];

export const members = [
  { id: 'm1', name: 'Amit Shrivastava', email: 'owner@acme.example', role: 'Owner' },
  { id: 'm2', name: 'Priya Natarajan', email: 'priya@acme.example', role: 'Admin' },
  { id: 'm3', name: 'Jonas Weber', email: 'jonas@acme.example', role: 'Member' },
];

export const formatTokens = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}K` : String(n));
export const formatAgo = (min: number) =>
  min < 60 ? `${min} min ago` : min < 24 * 60 ? `${Math.round(min / 60)} hour${min < 120 ? '' : 's'} ago` : min < 48 * 60 ? 'Yesterday' : `${Math.round(min / 1440)} days ago`;
export const formatDuration = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`);
