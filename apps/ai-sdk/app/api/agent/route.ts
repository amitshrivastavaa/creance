// The AI SDK route the page talks to: a standard createAgentUIStreamResponse.
import { anthropic } from '@ai-sdk/anthropic';
import { createAgentUIStreamResponse, type UIMessage } from 'ai';
import { createAgent, projectFrom } from '../../agent';

export const maxDuration = 120;

async function model() {
  // MOCK=1 swaps in a scripted model, so the end-to-end test runs without a key or a network.
  if (process.env.MOCK) return (await import('../../mock')).mockModel;
  // One line to change provider: any AI SDK model works here.
  return anthropic(process.env.MODEL ?? 'claude-sonnet-5-5');
}

export async function POST(request: Request) {
  if (!process.env.MOCK && !process.env.ANTHROPIC_API_KEY) {
    return new Response('Set ANTHROPIC_API_KEY in apps/ai-sdk/.env.local, then restart the dev server.', { status: 401 });
  }
  const { messages }: { messages: UIMessage<{ tokens?: number }>[] } = await request.json();
  const last = messages.at(-1);
  // Tokens so far in this assistant message: an answered approval continues the same message.
  const before = last?.role === 'assistant' ? (last.metadata?.tokens ?? 0) : 0;

  return createAgentUIStreamResponse({
    agent: createAgent(await model(), projectFrom(messages)),
    uiMessages: messages,
    abortSignal: request.signal,
    messageMetadata: ({ part }) => (part.type === 'finish' ? { tokens: before + (part.totalUsage.totalTokens ?? 0) } : undefined),
  });
}
