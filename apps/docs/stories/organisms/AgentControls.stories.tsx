import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  CheckpointRewind,
  ConfidenceMeter,
  KillSwitch,
  PermissionLedger,
  PlanEditor,
  QuestionCard,
  type StandingPermission,
} from '@creance-ui/react';

const meta = {
  title: 'Organisms/Agent controls',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Plan: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <PlanEditor
        agentName="Deploy Fixer"
        onStart={() => {}}
        steps={[
          { id: '1', text: 'Read the deploy logs and find the first error' },
          { id: '2', text: 'Run the deploy test suite' },
          { id: '3', text: 'Install any missing dependency, asking first' },
          { id: '4', text: 'Redeploy to production automatically' },
        ]}
      />
    </div>
  ),
};

export const Questions: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
      <QuestionCard
        agentName="Data Loader"
        question="Which staging database should I seed?"
        optionsLabel="Database"
        options={[
          { value: 'eu', label: 'staging-eu', description: 'Used by the web team. Last seeded 3 days ago.' },
          { value: 'us', label: 'staging-us', description: 'Being migrated this week.' },
        ]}
        timeoutNote="If no one answers in 30 minutes, Data Loader will pause, not guess."
        onAnswer={() => {}}
        onDefer={() => {}}
      />
      <div style={{ display: 'grid', gap: 24 }}>
        <QuestionCard agentName="Docs Writer" question="Who is the onboarding guide for?" onAnswer={() => {}} />
        <QuestionCard agentName="Data Loader" question="Which staging database should I seed?" answer="staging-eu" onAnswer={() => {}} />
      </div>
    </div>
  ),
};

export const KillSwitchStates: Story = {
  name: 'Kill switch',
  render: function Render() {
    const [stopped, setStopped] = useState(false);
    return (
      <KillSwitch
        stopped={stopped}
        onStop={() => setStopped(true)}
        onResume={() => setStopped(false)}
        stoppedLabel="Deploy Fixer stopped"
        description="Stops Deploy Fixer after its current call. Press and hold for 1 second."
      />
    );
  },
};

export const Checkpoints: Story = {
  render: () => (
    <CheckpointRewind
      onRewind={() => {}}
      checkpoints={[
        { id: 'now', label: 'After verifying the fix', time: '00:41' },
        { id: 'config', label: 'Config patched', description: 'You reviewed deploy/config.yaml', time: '00:27' },
        {
          id: 'dep',
          label: 'Dependency installed',
          description: 'After npm install zod@3',
          time: '00:18',
          undoes: {
            files: [{ path: 'deploy/config.yaml', added: 3, removed: 2 }],
            steps: ['Patch the deploy config', 'Verify the fix'],
            notes: ['Refund nothing: 7.6K tokens already used stay used'],
          },
        },
        { id: 'start', label: 'Start', description: 'Before the agent changed anything', time: '00:00' },
      ]}
    />
  ),
};

const grants: StandingPermission[] = [
  { id: 'p1', tool: 'read_file', agent: 'All agents', scope: 'This repository', granted: '2 weeks ago, by you', uses: 412 },
  { id: 'p2', tool: 'run_tests', agent: 'Deploy Fixer', scope: 'Any suite', granted: '5 days ago, by you', uses: 38 },
  { id: 'p3', tool: 'npm install', agent: 'Deploy Fixer', scope: 'web/ only', granted: 'Today, by you', uses: 1 },
  { id: 'p4', tool: 'shell', agent: 'Docs Writer', scope: 'Read-only commands', granted: 'Yesterday, by you', uses: 0 },
  { id: 'p5', tool: 'git push', agent: 'Release Bot', scope: 'main', granted: '3 weeks ago', uses: 14, revoked: true },
];

export const Permissions: Story = {
  render: function Render() {
    const [list, setList] = useState(grants);
    const set = (id: string, revoked: boolean) => setList((l) => l.map((p) => (p.id === id ? { ...p, revoked } : p)));
    return (
      <PermissionLedger
        permissions={list}
        summary="This repository's example grants"
        onRevoke={(id) => set(id, true)}
        onRestore={(id) => set(id, false)}
      />
    );
  },
};

export const Confidence: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
      <ConfidenceMeter
        low="likely"
        high="very-likely"
        title="Fairly sure this fixes the deploy"
        agentName="Deploy Fixer"
        reasons={[
          'All 42 tests pass, including the one that failed in production.',
          'The production build succeeds locally.',
          "Not checked: the deploy itself, which runs on infrastructure I can't see.",
        ]}
      />
      <ConfidenceMeter
        low="guessing"
        high="likely"
        title="Unsure which database is meant"
        agentName="Data Loader"
        reasons={["Two staging databases match the brief, and the ticket doesn't say which.", 'A wide range: the agent asked you instead of guessing.']}
      />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <ConfidenceMeter variant="compact" low="likely" high="very-likely" />
        <ConfidenceMeter variant="compact" low="unsure" />
        <ConfidenceMeter variant="compact" low="very-likely" />
      </div>
    </div>
  ),
};
