import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  ApprovalPrompt,
  Avatar,
  Citation,
  Code,
  CopyButton,
  Message,
  MessageList,
  ModelPicker,
  PromptInput,
  Reasoning,
  Sources,
  Suggestions,
  ToolCallHeader,
} from '@creance-ui/react';

const meta = {
  title: 'Molecules/Conversation',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const avatar = <Avatar name="Deploy Fixer" kind="agent" size="sm" decorative />;
const question = 'The production deploy for web is failing. Can you find out why and fix it?';
const answer = (
  <>
    <p>
      The build fails because <Code>server/validate.ts</Code> imports <Code>zod</Code>, which is missing from <Code>web/package.json</Code>.
      <Citation index={1} label="Source 1, Build 482 log" /> The import arrived in commit <Code>a41c9e2</Code>, after the last deploy that passed.
      <Citation index={2} label="Source 2, Commit a41c9e2" />
    </p>
    <p>I can add the dependency and run the tests again. Installing a package changes the lockfile, so I will ask before I do it.</p>
  </>
);
const sources = [
  { title: 'Build 482 log', detail: 'deploys/web/482', href: '#' },
  { title: 'Commit a41c9e2', detail: 'acme/web · 2 days ago', href: '#' },
];
const models = [
  { value: 'large', label: 'Large', description: 'Most capable, for hard problems' },
  { value: 'medium', label: 'Medium', description: 'Balanced, for everyday work' },
  { value: 'small', label: 'Small', description: 'Fastest, for quick answers' },
];

export const Messages: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
      <Message from="user">{question}</Message>
      <Message from="assistant" name="Deploy Fixer" avatar={avatar} actions={<CopyButton value="The build fails because zod is missing." label="Copy answer" />}>
        {answer}
      </Message>
      <Message from="assistant" name="Deploy Fixer" avatar={avatar} status="streaming">
        <p>
          Installing <Code>zod@3</Code> and running the test suite again
        </p>
      </Message>
      <Message from="assistant" name="Deploy Fixer" avatar={avatar} status="pending" />
    </div>
  ),
};

export const ReasoningStory: Story = {
  name: 'Reasoning',
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <Reasoning seconds={8}>
        <p>The log stops at the build step.</p>
      </Reasoning>
      <Reasoning seconds={8} defaultOpen>
        <p>The log stops at the build step with &quot;Cannot find module zod&quot;. That is a missing dependency, not a code error.</p>
        <p>Check which file imports it and when that import was added, then compare with package.json.</p>
      </Reasoning>
      <Reasoning thinking>
        <p>Reading the deploy log.</p>
      </Reasoning>
    </div>
  ),
};

export const SourcesStory: Story = {
  name: 'Sources',
  render: () => (
    <div style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
      <p style={{ margin: 0 }}>
        The import arrived after the last deploy that passed.
        <Citation index={2} href="#" label="Source 2, Commit a41c9e2" />
      </p>
      <Sources items={sources} />
    </div>
  ),
};

function Prompt({ working }: { working?: boolean }) {
  const [files, setFiles] = useState([
    { id: 'log', name: 'deploy.log', detail: '48 KB' },
    { id: 'png', name: 'build-error.png', detail: '212 KB', kind: 'image' as const },
  ]);
  return (
    <PromptInput
      label={working ? 'Message Deploy Fixer, working' : 'Message Deploy Fixer, with files'}
      placeholder="Ask Deploy Fixer, or tell it what to do"
      defaultValue={working ? '' : 'Use the staging config as the template.'}
      status={working ? 'working' : 'ready'}
      attachments={working ? [] : files}
      onRemoveAttachment={(id) => setFiles(files.filter((f) => f.id !== id))}
      onAttach={() => {}}
      tools={<ModelPicker models={models} defaultValue="medium" />}
    />
  );
}

export const PromptInputStory: Story = {
  name: 'PromptInput',
  render: () => (
    <div style={{ display: 'grid', gap: 20, maxWidth: 640 }}>
      <PromptInput label="Message Deploy Fixer" placeholder="Ask Deploy Fixer, or tell it what to do" onAttach={() => {}} tools={<ModelPicker models={models} defaultValue="medium" />} />
      <Prompt />
      <Prompt working />
    </div>
  ),
};

export const SuggestionsStory: Story = {
  name: 'Suggestions',
  render: () => <Suggestions items={['Explain the failure', 'Show the diff', 'Retry the deploy', 'Who changed this last?']} />,
};

export const ModelPickerStory: Story = {
  name: 'ModelPicker',
  render: () => <ModelPicker models={models} defaultValue="medium" />,
};

export const Conversation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: 640 }}>
      <MessageList>
        <Message from="user">{question}</Message>
        <Message from="assistant" name="Deploy Fixer" avatar={avatar} actions={<CopyButton value="The build fails because zod is missing." label="Copy answer" />}>
          <Reasoning seconds={8}>
            <p>The log stops at the build step.</p>
          </Reasoning>
          <ToolCallHeader tool="read_logs" status="success" headingLevel={3} />
          {answer}
          <Sources items={sources} />
        </Message>
        <ApprovalPrompt
          agentName="Deploy Fixer"
          action="npm install zod@3"
          target="web/package.json"
          risk="medium"
          reason="Adds one runtime package and changes the lockfile."
          onAllow={() => {}}
          onDeny={() => {}}
          autoFocus={false}
        />
      </MessageList>
      <div style={{ display: 'grid', gap: 10, width: '100%', maxWidth: 760, margin: '0 auto', padding: '0 16px 16px', boxSizing: 'border-box' }}>
        <Suggestions items={['Explain the failure', 'Show the diff']} />
        <PromptInput label="Message Deploy Fixer" placeholder="Ask Deploy Fixer, or tell it what to do" tools={<ModelPicker models={models} defaultValue="medium" />} />
      </div>
    </div>
  ),
};
