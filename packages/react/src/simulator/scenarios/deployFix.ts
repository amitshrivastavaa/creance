import type { Scenario } from '../createSimulator';

/**
 * "Fix the failing deploy": about 40 seconds at speed 1.
 * Covers tool calls, a failure and automatic retry, nested steps, one approval, one diff review and a handoff.
 */
export const deployFix: Scenario = [
  {
    after: 0,
    event: {
      type: 'run.started',
      agent: { id: 'deploy-fixer', name: 'Deploy Fixer' },
      goal: 'Fix the failing production deploy for the web service',
      budget: { limit: 50_000, unit: 'tokens' },
    },
  },

  // 1. Investigate, with a flaky tool call that fails once and is retried.
  { after: 600, event: { type: 'step.started', stepId: 'investigate', title: 'Investigate the failed deploy' } },
  {
    after: 500,
    event: {
      type: 'tool.call.started',
      callId: 'read-logs',
      stepId: 'investigate',
      tool: 'read_logs',
      input: { service: 'web', environment: 'production', since: '15m' },
      attempt: 1,
    },
  },
  {
    after: 1800,
    event: {
      type: 'tool.call.completed',
      callId: 'read-logs',
      output: { lines: 214, firstError: "Error: Cannot find module 'zod'", at: 'server/validate.ts:3' },
    },
  },
  { after: 200, event: { type: 'usage', tokens: 4_200 } },
  {
    after: 600,
    event: {
      type: 'tool.call.started',
      callId: 'run-tests',
      stepId: 'investigate',
      tool: 'run_tests',
      input: { suite: 'deploy', ci: true },
      attempt: 1,
    },
  },
  {
    after: 2200,
    event: {
      type: 'tool.call.failed',
      callId: 'run-tests',
      error: 'ECONNRESET: request to registry.npmjs.org timed out after 10s',
      retryable: true,
    },
  },
  {
    after: 1500,
    event: {
      type: 'tool.call.started',
      callId: 'run-tests',
      stepId: 'investigate',
      tool: 'run_tests',
      input: { suite: 'deploy', ci: true },
      attempt: 2,
    },
  },
  {
    after: 2600,
    event: {
      type: 'tool.call.completed',
      callId: 'run-tests',
      output: { passed: 41, failed: 1, failing: ['build > resolves runtime dependencies'] },
    },
  },
  { after: 300, event: { type: 'step.completed', stepId: 'investigate' } },
  { after: 100, event: { type: 'usage', tokens: 9_800 } },

  // 2. Install a missing dependency: needs approval.
  { after: 700, event: { type: 'step.started', stepId: 'install', title: 'Install the missing dependency' } },
  {
    after: 900,
    event: {
      type: 'approval.requested',
      approvalId: 'install-zod',
      stepId: 'install',
      action: 'npm install zod@3',
      target: 'web/package.json',
      risk: 'medium',
      reason:
        'server/validate.ts imports zod, but it is missing from dependencies, so the production build fails. Installing adds one runtime package and changes the lockfile.',
    },
  },
  {
    waitFor: 'approval.resolved',
    id: 'install-zod',
    ifDenied: [
      { after: 400, event: { type: 'step.failed', stepId: 'install', error: 'You denied the install.' } },
      { after: 600, event: { type: 'run.completed' } },
      {
        after: 300,
        event: {
          type: 'handoff',
          summary:
            'Stopped before installing zod. The deploy is still failing: server/validate.ts imports zod, which is not in dependencies.',
          nextActions: [
            { id: 'install-manually', label: 'Install it myself', primary: true },
            { id: 'view-logs', label: 'View run logs' },
          ],
        },
      },
    ],
  },
  {
    after: 400,
    event: {
      type: 'tool.call.started',
      callId: 'npm-install',
      stepId: 'install',
      tool: 'shell',
      input: { command: 'npm install zod@3', cwd: 'web' },
      attempt: 1,
    },
  },
  {
    after: 2800,
    event: { type: 'tool.call.completed', callId: 'npm-install', output: { added: 1, package: 'zod@3.25.76' } },
  },
  { after: 300, event: { type: 'step.completed', stepId: 'install' } },
  { after: 100, event: { type: 'usage', tokens: 13_100 } },

  // 3. Patch the config: a diff to review.
  { after: 700, event: { type: 'step.started', stepId: 'patch', title: 'Patch the deploy config' } },
  {
    after: 400,
    event: {
      type: 'tool.call.started',
      callId: 'read-config',
      stepId: 'patch',
      tool: 'read_file',
      input: { path: 'deploy/config.yaml' },
      attempt: 1,
    },
  },
  { after: 1100, event: { type: 'tool.call.completed', callId: 'read-config', output: { bytes: 612 } } },
  {
    after: 1500,
    event: {
      type: 'diff.proposed',
      diffId: 'config-diff',
      stepId: 'patch',
      file: 'deploy/config.yaml',
      hunks: [
        {
          id: 'retries',
          header: '@@ -10,5 +10,6 @@ deploy:',
          lines: [
            { type: 'context', content: 'deploy:', oldNumber: 10, newNumber: 10 },
            { type: 'context', content: '  service: web', oldNumber: 11, newNumber: 11 },
            { type: 'context', content: '  timeout: 30', oldNumber: 12, newNumber: 12 },
            { type: 'remove', content: '  retries: 0', oldNumber: 13 },
            { type: 'add', content: '  retries: 3', newNumber: 13 },
            { type: 'add', content: '  backoff: exponential', newNumber: 14 },
            { type: 'context', content: '  region: eu-west-1', oldNumber: 14, newNumber: 15 },
          ],
        },
        {
          id: 'install-step',
          header: '@@ -21,4 +22,4 @@ build:',
          lines: [
            { type: 'context', content: 'build:', oldNumber: 21, newNumber: 22 },
            { type: 'remove', content: '  install: npm install --omit=optional', oldNumber: 22 },
            { type: 'add', content: '  install: npm ci', newNumber: 23 },
            { type: 'context', content: '  command: npm run build', oldNumber: 23, newNumber: 24 },
          ],
        },
      ],
    },
  },
  { waitFor: 'diff.resolved', id: 'config-diff' },
  { after: 400, event: { type: 'step.completed', stepId: 'patch' } },
  { after: 100, event: { type: 'usage', tokens: 16_900 } },

  // 4. Verify, with nested steps.
  { after: 600, event: { type: 'step.started', stepId: 'verify', title: 'Verify the fix' } },
  {
    after: 300,
    event: { type: 'step.started', stepId: 'verify-tests', parentId: 'verify', title: 'Run the full test suite' },
  },
  {
    after: 300,
    event: {
      type: 'tool.call.started',
      callId: 'run-tests-full',
      stepId: 'verify-tests',
      tool: 'run_tests',
      input: { suite: 'all', ci: true },
      attempt: 1,
    },
  },
  { after: 3200, event: { type: 'tool.call.completed', callId: 'run-tests-full', output: { passed: 42, failed: 0 } } },
  { after: 200, event: { type: 'step.completed', stepId: 'verify-tests' } },
  {
    after: 300,
    event: { type: 'step.started', stepId: 'verify-build', parentId: 'verify', title: 'Build the production bundle' },
  },
  {
    after: 300,
    event: {
      type: 'tool.call.started',
      callId: 'build',
      stepId: 'verify-build',
      tool: 'build',
      input: { target: 'production' },
      attempt: 1,
    },
  },
  { after: 2800, event: { type: 'tool.call.completed', callId: 'build', output: { ok: true, sizeKb: 412 } } },
  { after: 200, event: { type: 'step.completed', stepId: 'verify-build' } },
  { after: 200, event: { type: 'step.completed', stepId: 'verify' } },
  { after: 100, event: { type: 'usage', tokens: 21_400 } },

  { after: 500, event: { type: 'run.completed' } },
  {
    after: 300,
    event: {
      type: 'handoff',
      summary:
        'The deploy is fixed. I added the missing zod dependency and updated deploy/config.yaml as you reviewed it. All 42 tests pass and the production build succeeds. Nothing has been deployed yet.',
      nextActions: [
        { id: 'open-pr', label: 'Open pull request', primary: true },
        { id: 'redeploy', label: 'Re-run deploy' },
        { id: 'view-logs', label: 'View run logs' },
      ],
    },
  },
];
