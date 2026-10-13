// The agent: an ordinary AI SDK ToolLoopAgent. Nothing here knows about Creance.
import { ToolLoopAgent, isStepCount, tool, type LanguageModel, type UIMessage } from 'ai';
import { z } from 'zod';
import { Project } from './project';

const instructions = `You fix a small web project. Work in short steps and explain each in one sentence.
Start by running the checks. Read a file before you change it.
To add a dependency, use install_package. To change any other file, use write_file with the whole new file.
When a person denies an action, do not retry it; say what you would need instead.
When the checks pass, stop and summarise what you changed in two sentences.`;

/** Rebuilds the project for this request by replaying the changes that already ran earlier in the conversation. */
export function projectFrom(messages: UIMessage[]) {
  const project = new Project();
  for (const part of messages.flatMap((m) => m.parts)) {
    if (!('state' in part) || part.state !== 'output-available') continue;
    const input = part.input as Record<string, string>;
    if (part.type === 'tool-install_package') project.install(input.name!, input.version ?? 'latest');
    if (part.type === 'tool-write_file') project.write(input.path!, input.content!);
  }
  return project;
}

export function createAgent(model: LanguageModel, project: Project) {
  return new ToolLoopAgent({
    model,
    instructions,
    stopWhen: isStepCount(20),
    tools: {
      list_files: tool({
        description: 'List the files in the project.',
        inputSchema: z.object({}),
        execute: async () => Object.keys(project.files),
      }),
      read_file: tool({
        description: 'Read one file.',
        inputSchema: z.object({ path: z.string() }),
        execute: async ({ path }) => project.files[path] ?? `No file at ${path}.`,
      }),
      run_tests: tool({
        description: 'Run the build and deploy checks.',
        inputSchema: z.object({}),
        execute: async () => project.check(),
      }),
      install_package: tool({
        description: 'Add an npm dependency to web/package.json.',
        inputSchema: z.object({
          name: z.string(),
          version: z.string().describe('A semver range, such as ^3.23.8.'),
          reason: z.string().describe('One sentence for the person approving it: why this package is needed.'),
        }),
        execute: async ({ name, version }) => {
          project.install(name, version);
          return { installed: `${name}@${version}` };
        },
      }),
      write_file: tool({
        description: 'Replace a file with new contents. The person reviews the change first.',
        inputSchema: z.object({
          path: z.string(),
          content: z.string().describe('The whole new file.'),
          reason: z.string().describe('One sentence for the person reviewing it: why this change.'),
        }),
        execute: async ({ path, content }) => {
          project.write(path, content);
          return { written: path };
        },
      }),
    },
    // Anything that changes the project waits for a person.
    toolApproval: { install_package: 'user-approval', write_file: 'user-approval' },
  });
}
