import { AgentRun } from './AgentRun';

export const dynamic = 'force-dynamic';

// Rendered per request: the key is read on the server, so the page can say what to set up instead of failing on the first request.
export default function Page() {
  return <AgentRun ready={!!(process.env.MOCK || process.env.ANTHROPIC_API_KEY)} model={process.env.MOCK ? 'a scripted test model' : (process.env.MODEL ?? 'claude-sonnet-5-5')} />;
}
