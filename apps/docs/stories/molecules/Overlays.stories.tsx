import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Avatar,
  Button,
  ContextCard,
  Description,
  DestructiveActionModal,
  RelativeTimeCard,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  StatusDot,
} from '@creance-ui/react';

const meta = {
  title: 'Molecules/Overlays',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const SheetStory: Story = {
  name: 'Sheet',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Show tool call details</Button>
      </SheetTrigger>
      <SheetContent
        title="Tool call details"
        actions={
          <>
            <Button>Copy call ID</Button>
            <SheetClose asChild>
              <Button>Rewind here</Button>
            </SheetClose>
          </>
        }
      >
        <Description
          items={[
            { term: 'Tool', details: <code>run_tests</code> },
            { term: 'Status', details: 'Succeeded on attempt 2' },
            { term: 'Duration', details: '2.6s' },
          ]}
        />
      </SheetContent>
    </Sheet>
  ),
};

export const DestructiveModal: Story = {
  render: () => (
    <DestructiveActionModal
      trigger={<Button variant="danger">Delete agent</Button>}
      title="Delete Deploy Fixer?"
      description="This deletes the agent, its runs and its permission rules. Running work stops first. This can't be undone."
      confirmLabel="Delete agent"
      confirmText="deploy-fixer"
      onConfirm={() => {}}
    />
  ),
};

export const Cards: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <p style={{ margin: 0 }}>
        <ContextCard
          content={
            <>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar name="Deploy Fixer" kind="agent" decorative />
                <div style={{ display: 'grid' }}>
                  <strong>Deploy Fixer</strong>
                  <span>Fixes failing deploys in web</span>
                </div>
              </div>
              <StatusDot status="waiting" />
            </>
          }
        >
          <a href="#agent">Deploy Fixer</a>
        </ContextCard>{' '}
        asked for approval.
      </p>
      <p style={{ margin: 0 }}>
        Run 40 failed <RelativeTimeCard date={new Date('2026-10-01T10:00:00Z')} now={new Date('2026-10-01T12:00:00Z')} locale="en-GB" />.
      </p>
    </div>
  ),
};
