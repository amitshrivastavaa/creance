import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { ApprovalPrompt, Avatar, Chat, Code, type ChatMessage } from '@creance-ui/react';

const meta = {
  title: 'Organisms/Chat',
  component: Chat,
  tags: ['autodocs'],
} satisfies Meta<typeof Chat>;
export default meta;
type Story = StoryObj<typeof meta>;

const avatar = <Avatar name="Deploy Fixer" kind="agent" size="sm" decorative />;
const history: ChatMessage[] = [
  { id: '1', from: 'user', content: 'The production deploy for web is failing. Can you find out why?' },
  {
    id: '2',
    from: 'assistant',
    reasoning: { seconds: 8, content: 'The log stops at the build step with "Cannot find module zod".' },
    content: (
      <p>
        The build fails because <Code>zod</Code> is missing from <Code>web/package.json</Code>. I can add it and run the tests again.
      </p>
    ),
    sources: [
      { title: 'Build 482 log', detail: 'deploys/web/482', href: '#' },
      { title: 'Commit a41c9e2', detail: 'acme/web · 2 days ago', href: '#' },
    ],
  },
];

export const Conversation: Story = {
  args: { messages: history, agentName: 'Deploy Fixer', avatar, height: 560, suggestions: ['Show the diff', 'Who changed this last?'], placeholder: 'Ask Deploy Fixer, or tell it what to do' },
};

export const Empty: Story = {
  args: { messages: [], agentName: 'Deploy Fixer', height: 420, empty: 'Ask anything about this deploy.', suggestions: ['Why is the deploy failing?'] },
};

export const WithApproval: Story = {
  args: { messages: history, agentName: 'Deploy Fixer', avatar, height: 620 },
  render: (args) => (
    <Chat {...args}>
      <ApprovalPrompt agentName="Deploy Fixer" action="npm install zod@3" target="web/package.json" risk="medium" reason="Adds one runtime package and changes the lockfile." onAllow={() => {}} onDeny={() => {}} autoFocus={false} />
    </Chat>
  ),
};

const reply = 'I read the deploy log. The build stops because zod is missing from web/package.json. I can add it and run the tests again.';

/** Type a message: a simulated agent thinks, streams a reply, then cites a source. */
function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [working, setWorking] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);
  const patch = (change: Partial<ChatMessage>) => setMessages((all) => all.map((m, i) => (i === all.length - 1 ? { ...m, ...change } : m)));

  function send(text: string) {
    clear();
    const id = String(Date.now());
    setWorking(true);
    setMessages((all) => [...all, { id: `${id}-you`, from: 'user', content: text }, { id: `${id}-agent`, from: 'assistant', status: 'pending' }]);
    const words = reply.split(' ');
    words.forEach((_, i) => timers.current.push(setTimeout(() => patch({ status: 'streaming', content: words.slice(0, i + 1).join(' ') }), 900 + i * 70)));
    timers.current.push(
      setTimeout(() => {
        patch({ status: 'done', sources: [{ title: 'Build 482 log', detail: 'deploys/web/482', href: '#' }] });
        setWorking(false);
      }, 1100 + words.length * 70),
    );
  }

  return (
    <Chat
      height={560}
      agentName="Deploy Fixer"
      avatar={avatar}
      messages={messages}
      status={working ? 'working' : 'ready'}
      onSend={send}
      onStop={() => {
        clear();
        patch({ status: 'done' });
        setWorking(false);
      }}
      suggestions={['Why is the deploy failing?']}
      empty="Ask anything about this deploy. The agent here is simulated."
    />
  );
}

export const Live: Story = { args: { messages: [] }, render: () => <LiveChat /> };
