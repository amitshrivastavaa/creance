// A scripted model for the end-to-end test (MOCK=1): it makes the calls a real model would, in a fixed order,
// so CI exercises the real route, useChat, the adapter and the components without a key.
import { simulateReadableStream } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';

type Call = { tool: string; input: Record<string, string> } | { text: string };

const script: Call[] = [
  { tool: 'run_tests', input: {} },
  { tool: 'read_file', input: { path: 'web/package.json' } },
  { tool: 'install_package', input: { name: 'zod', version: '^3.23.8', reason: 'web/server/validate.ts imports zod, but it is not a dependency, so the build fails.' } },
  { tool: 'read_file', input: { path: 'deploy/config.yaml' } },
  {
    tool: 'write_file',
    input: { path: 'deploy/config.yaml', content: 'service: web\nretries: 3\ntimeout: 30\n', reason: 'The registry is flaky, so the deploy needs more than one retry.' },
  },
  { tool: 'run_tests', input: {} },
  { text: 'I added zod to the web dependencies and raised deploy retries from 1 to 3. The build and deploy checks now pass.' },
];

const usage = {
  inputTokens: { total: 1200, noCache: 1200, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 80, text: 80, reasoning: undefined },
};

export const mockModel = new MockLanguageModelV4({
  doStream: async ({ prompt }) => {
    // Each answered call adds a tool result, so their count says where in the script we are.
    const done = prompt.flatMap((m) => (m.role === 'tool' ? m.content : [])).filter((p) => p.type === 'tool-result').length;
    const step = script[Math.min(done, script.length - 1)]!;
    const id = `call-${done}`;
    const finish = (unified: 'stop' | 'tool-calls') => ({ type: 'finish' as const, finishReason: { unified, raw: undefined }, logprobs: undefined, usage });
    if ('text' in step) {
      const deltas = step.text.split(/(?<= )/).map((delta) => ({ type: 'text-delta' as const, id, delta }));
      return { stream: simulateReadableStream({ chunks: [{ type: 'text-start' as const, id }, ...deltas, { type: 'text-end' as const, id }, finish('stop')], chunkDelayInMs: 60 }) };
    }
    const call = { type: 'tool-call' as const, toolCallId: id, toolName: step.tool, input: JSON.stringify(step.input) };
    return { stream: simulateReadableStream({ chunks: [call, finish('tool-calls')], chunkDelayInMs: 120 }) };
  },
});
