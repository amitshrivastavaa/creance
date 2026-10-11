import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApprovalPrompt } from '@creance-ui/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { LiveRun } from '../../src/LiveRun';

const meta = {
  title: 'Organisms/ApprovalPrompt',
  component: ApprovalPrompt,
  args: {
    agentName: 'Deploy Fixer',
    action: 'npm install zod@3',
    target: 'web/package.json',
    risk: 'medium',
    reason:
      'server/validate.ts imports zod, but it is missing from dependencies, so the production build fails. Installing adds one runtime package and changes the lockfile.',
    onAllow: fn(),
    onDeny: fn(),
    autoFocus: false,
  },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
} satisfies Meta<typeof ApprovalPrompt>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LowRisk: Story = {
  args: { action: 'read_file', target: 'deploy/config.yaml', risk: 'low', reason: 'Reading the deploy config to find the retry setting.' },
};

/** High risk hides "Always allow": a destructive action should be confirmed every time. */
export const HighRisk: Story = {
  args: {
    action: 'git push --force origin main',
    target: 'github.com/acme/web',
    risk: 'high',
    reason: 'Rewrites the remote main branch to drop the broken release commit. Anyone who pulled it will need to reset.',
  },
};

export const Allowed: Story = { args: { decision: 'allow-once' } };
export const Denied: Story = { args: { decision: 'deny' } };

/** Click a button or press A, Shift+A or D while the prompt has focus. */
export const Interactive: Story = {
  render: function Render(args) {
    const [decision, setDecision] = useState<'allow-once' | 'always-allow' | 'deny'>();
    return (
      <ApprovalPrompt
        {...args}
        decision={decision}
        onAllow={(scope) => setDecision(scope === 'once' ? 'allow-once' : 'always-allow')}
        onDeny={() => setDecision('deny')}
      />
    );
  },
};

/** Live: the simulated agent runs until it needs permission, then waits for you. */
export const Live: Story = {
  render: (args) => (
    <LiveRun>
      {(run, sim) => {
        const approval = run.approvals.at(-1);
        if (!approval) return <p className="live__empty">The agent is investigating. It will ask before installing anything.</p>;
        return (
          <ApprovalPrompt
            agentName={run.agent?.name}
            action={approval.action}
            target={approval.target}
            risk={approval.risk}
            reason={approval.reason}
            decision={approval.decision}
            autoFocus={args.autoFocus}
            onAllow={(scope) =>
              sim.respond({ type: 'approval.resolved', approvalId: approval.id, decision: scope === 'once' ? 'allow-once' : 'always-allow' })
            }
            onDeny={() => sim.respond({ type: 'approval.resolved', approvalId: approval.id, decision: 'deny' })}
          />
        );
      }}
    </LiveRun>
  ),
};
