import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Description,
  DotsMenu,
  EmptyState,
  Entity,
  FileTree,
  Gauge,
  JsonView,
  LoadingDots,
  MenuItem,
  MiddleTruncate,
  Snippet,
  StatusDot,
  Table,
  type TableColumn,
} from '@creance-ui/react';

const meta = {
  title: 'Molecules/Data display',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

interface Run {
  id: string;
  title: string;
  agent: string;
  status: 'waiting' | 'failed' | 'running' | 'done';
  started: number;
  tokens: number;
}
const runs: Run[] = [
  { id: 'r41', title: 'Fix the failing deploy', agent: 'Deploy Fixer', status: 'waiting', started: 4, tokens: 9_800 },
  { id: 'r40', title: 'Upgrade react-router', agent: 'Deploy Fixer', status: 'failed', started: 120, tokens: 31_200 },
  { id: 'r39', title: 'Seed staging', agent: 'Data Loader', status: 'running', started: 180, tokens: 4_100 },
  { id: 'r38', title: 'Write onboarding docs', agent: 'Docs Writer', status: 'done', started: 1_440, tokens: 18_000 },
];
const ago = (m: number) => (m < 60 ? `${m} min ago` : m < 1_440 ? `${Math.round(m / 60)} hours ago` : 'Yesterday');
const columns: TableColumn<Run>[] = [
  { key: 'title', header: 'Run', cell: (r) => r.title, rowHeader: true, sortValue: (r) => r.title },
  { key: 'agent', header: 'Agent', cell: (r) => r.agent },
  { key: 'status', header: 'Status', cell: (r) => <StatusDot status={r.status} /> },
  { key: 'started', header: 'Started', cell: (r) => ago(r.started), sortValue: (r) => -r.started },
  { key: 'tokens', header: 'Tokens', cell: (r) => `${(r.tokens / 1000).toFixed(1)}K`, align: 'end', sortValue: (r) => r.tokens },
];

export const TableStory: Story = {
  name: 'Table',
  render: () => (
    <Table
      caption="Recent runs"
      columns={columns}
      rows={runs}
      rowKey={(r) => r.id}
      rowLabel={(r) => r.title}
      defaultSort={{ key: 'started', direction: 'descending' }}
      selectable
      bulkActions={() => (
        <>
          <Button size="sm">Re-run</Button>
          <Button size="sm">Archive</Button>
        </>
      )}
    />
  ),
};

export const FileTreeStory: Story = {
  name: 'File tree',
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <FileTree
        label="Changed files"
        defaultExpanded={['web', 'server']}
        selected="validate"
        nodes={[
          {
            id: 'web',
            name: 'web',
            children: [
              {
                id: 'server',
                name: 'server',
                children: [
                  { id: 'validate', name: 'validate.ts', status: 'M' },
                  { id: 'routes', name: 'routes.ts' },
                ],
              },
              { id: 'pkg', name: 'package.json', status: 'M' },
              { id: 'deploy', name: 'deploy.config.ts', status: 'A' },
            ],
          },
          { id: 'docs', name: 'docs', children: [{ id: 'old', name: 'old-setup.md', status: 'D' }] },
        ]}
      />
    </div>
  ),
};

export const JsonViewStory: Story = {
  name: 'JSON view',
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <JsonView
        label="Tool result"
        value={{ tool: 'run_tests', attempt: 2, ok: true, input: { suite: 'web', filter: 'deploy' }, output: ['212 passed', '0 failed'] }}
        expandDepth={1}
      />
    </div>
  ),
};

export const Details: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 560 }}>
      <Entity
        name="Deploy Fixer"
        description="Asks for risky actions"
        actions={
          <DotsMenu label="More actions for Deploy Fixer">
            <MenuItem>Open agent</MenuItem>
            <MenuItem tone="danger">Stop agent</MenuItem>
          </DotsMenu>
        }
      />
      <Entity name="Approver" kind="human" description="Allowed 12 actions this week" />
      <Description
        items={[
          { term: 'Goal', details: 'Fix the failing production deploy' },
          { term: 'Model', details: <code>claude-opus-5-5</code> },
          { term: 'Budget', details: '50K tokens' },
          { term: 'Started by', details: 'You, from the inbox' },
        ]}
      />
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {(['running', 'waiting', 'done', 'failed', 'queued'] as const).map((s) => (
          <StatusDot key={s} status={s} />
        ))}
      </div>
    </div>
  ),
};

export const Measures: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 560 }}>
      <div style={{ display: 'flex', gap: 24 }}>
        <Gauge label="Token budget used" value={20} />
        <Gauge label="Error rate" value={86} limit={50} />
      </div>
      <MiddleTruncate text="web/server/routes/api/v2/deployments/validate-config.ts" />
      <MiddleTruncate text="run_8f3a91c4b2e7d0a6c21d" start={8} end={4} />
      <LoadingDots>Deploy Fixer is thinking</LoadingDots>
      <LoadingDots tone="muted">Waiting for the registry</LoadingDots>
    </div>
  ),
};

export const Snippets: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
      <Snippet commands="pnpm add @creance-ui/react @creance-ui/tokens" />
      <Snippet tone="light" commands={['npx creance-codemod-on-allow src --dry', 'npx creance-codemod-on-allow src']} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <EmptyState
      title="No runs yet"
      description="Runs appear here when an agent starts work. Give Deploy Fixer a goal to start the first one."
      action={<Button variant="primary">Start a run</Button>}
    />
  ),
};
