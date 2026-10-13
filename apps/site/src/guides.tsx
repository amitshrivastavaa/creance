// The "Getting started" pages. Everything here describes the repository as it is today.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Alert, ApprovalPrompt, Button, Snippet, StatusDot, Switch } from '@creance-ui/react';
import { Colored } from './colored';

export interface Guide {
  name: string;
  group: 'Getting started' | 'Project';
  about: string;
  body: () => ReactNode;
}

const Block = ({ code }: { code: string }) => (
  <div className="prose__code">
    <Colored code={code.replace(/^\n/, '').replace(/\n\s*$/, '')} />
  </div>
);

const RADII: Record<string, CSSProperties> = {
  Capsule: {},
  Rounded: { '--cr-radius-full': '12px' } as CSSProperties,
  Square: { '--cr-radius-full': '4px', '--cr-radius-xl': '6px', '--cr-radius-lg': '6px', '--cr-radius-md': '4px' } as CSSProperties,
};

/** Change a few tokens and watch real components follow. */
function ThemeLab() {
  const [accent, setAccent] = useState('#0071e3');
  const [radius, setRadius] = useState('Capsule');
  const [solid, setSolid] = useState(false);

  // Solid surfaces are a root-level switch, so this one applies to the whole page while it is on.
  useEffect(() => {
    const root = document.documentElement;
    if (solid) root.dataset.transparency = 'reduce';
    return () => {
      delete root.dataset.transparency;
    };
  }, [solid]);

  const changed = accent.toLowerCase() !== '#0071e3';
  const vars = {
    ...(changed
      ? {
          '--cr-color-accent-bg': accent,
          '--cr-color-accent-bg-hover': `color-mix(in srgb, ${accent} 86%, black)`,
          '--cr-color-accent-bg-active': `color-mix(in srgb, ${accent} 72%, black)`,
          '--cr-shadow-accent': `0 6px 16px color-mix(in srgb, ${accent} 28%, transparent)`,
        }
      : {}),
    ...RADII[radius],
  } as CSSProperties;
  const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`);
  const css = [lines.length ? `:root {\n${lines.join('\n')}\n}` : '/* The defaults. Change a control above. */', solid ? '\n<html data-transparency="reduce">' : ''].join('');

  return (
    <div className="lab window">
      <div className="lab__controls">
        <label>
          Accent colour
          <input id="lab-accent" type="color" value={accent} onChange={(e) => setAccent(e.currentTarget.value)} />
        </label>
        <label>
          Corners
          <select id="lab-radius" value={radius} onChange={(e) => setRadius(e.currentTarget.value)}>
            {Object.keys(RADII).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <Switch id="lab-solid" label="Solid surfaces" checked={solid} onChange={(e) => setSolid(e.currentTarget.checked)} />
      </div>
      <div className="lab__stage" style={vars}>
        <ApprovalPrompt
          agentName="Deploy Fixer"
          action="npm install zod@3"
          target="web/package.json"
          risk="medium"
          reason="server/validate.ts imports zod, but it is missing from dependencies."
          autoFocus={false}
          shortcuts={false}
          headingLevel={3}
        />
        <div className="lab__row">
          <Button variant="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </div>
      <Block code={css} />
    </div>
  );
}

export const guides: Guide[] = [
  {
    name: 'Introduction',
    group: 'Getting started',
    about: 'What Creance is, what is in it, and where it stands.',
    body: () => (
      <>
        <p>
          Creance is a React component library with two parts. The first is a general-purpose set: buttons, forms, menus, dialogs, tables and the rest of what an application needs. The second is a set built for
          supervising AI agents: approving what an agent wants to do, watching it work, reviewing its changes and taking back control.
        </p>
        <p>
          The name comes from falconry. A creance is the long line tied to a bird in training: the bird flies on its own, and the falconer can always bring it back.
        </p>
        <h2>What is in it</h2>
        <ul>
          <li>
            <strong>109 components</strong> in four levels: 24 atoms, 70 molecules, 13 organisms and two page templates.
          </li>
          <li>
            <strong>Design tokens</strong> as CSS variables, with light, dark and solid themes.
          </li>
          <li>
            <strong>A typed event model</strong> for agent runs, with a reducer hook that turns a stream of events into the state the components need.
          </li>
          <li>
            <strong>A simulator</strong> that plays a scripted run, so screens can be built and tested without a real agent.
          </li>
        </ul>
        <h2>How the components are built</h2>
        <ul>
          <li>Plain CSS on tokens. There is no CSS-in-JS and no styling runtime.</li>
          <li>Native elements where the browser already does the job: checkboxes, radios, switches, selects and progress bars.</li>
          <li>Radix for the widgets with difficult focus handling: dialogs, menus, tabs, popovers, sliders and toasts.</li>
          <li>Every component takes plain props. None of them depends on the event model.</li>
        </ul>
        <h2>Where it stands</h2>
        <Alert title="Early, and on npm">
          Creance is a one-person project, and it has no production users. The hosted demo is simulated; an example in the repository runs a real model through the Vercel AI SDK. The automated checks pass; a manual screen-reader pass has not been done.
        </Alert>
      </>
    ),
  },
  {
    name: 'Installation',
    group: 'Getting started',
    about: 'Two packages from npm, and two stylesheets imported once.',
    body: () => (
      <>
        <h2>Install</h2>
        <p>
          The components are in <code>@creance-ui/react</code> and the design tokens in <code>@creance-ui/tokens</code>. React 18 or later is the only peer dependency, and the unit tests run on both 18 and 19.
        </p>
        <Snippet commands="npm install @creance-ui/react @creance-ui/tokens" />
        <h2>Add the styles once</h2>
        <p>Import the tokens and the component styles at the root of your app, tokens first.</p>
        <Block
          code={`
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';`}
        />
        <h2>From source</h2>
        <p>To work on Creance itself, clone the repository. You need Node 22 or later and pnpm 12.</p>
        <Snippet tone="light" commands={['pnpm install', 'pnpm build', 'pnpm site']} />
        <p>
          <code>pnpm build</code> builds the tokens and the components. <code>pnpm site</code> runs this site, <code>pnpm storybook</code> opens the stories on localhost:6006, and <code>pnpm --filter demo dev</code> runs the demo app.
        </p>
      </>
    ),
  },
  {
    name: 'Frameworks',
    group: 'Getting started',
    about: 'Creance is a React library. This is where it has been tested, and where it has not.',
    body: () => (
      <>
        <div className="ref">
          <div className="ref__scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Where</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['React 19 and React 18', 'Tested. Developed on 19; the unit tests also run on 18.'],
                  ['Vite', 'Tested. The demo app and Storybook run on it.'],
                  ['Next.js 16, App Router', 'Tested. Every component is rendered by the server and hydrates without errors.'],
                  ['Next.js Pages Router, React Router, Remix, Astro', 'Not tested. They are plain React, so it is expected to work.'],
                  ['Vue, Svelte, Angular, Solid', 'Not supported. Only the tokens, which are plain CSS variables, can be used there.'],
                ].map(([where, status]) => (
                  <tr key={where}>
                    <th scope="row">{where}</th>
                    <td>{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <h2>Next.js</h2>
        <p>Import the two stylesheets once, in the root layout.</p>
        <Block
          code={`
// app/layout.tsx
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';`}
        />
        <p>
          Components can be imported straight into a server component. The 62 modules that use state, effects or Radix are marked <code>"use client"</code>, so Next.js treats them as client components without any extra step. The other 54, including Button,
          Input, Badge and Alert, have no client-only code and run on the server alone.
        </p>
        <Block
          code={`
// app/page.tsx: a server component
import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@creance-ui/react';

export default function Page() {
  return (
    <Tabs defaultValue="timeline">
      <TabsList aria-label="Run views">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="changes">Changes</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline"><Badge status="running" /></TabsContent>
      <TabsContent value="changes">Two files changed.</TabsContent>
    </Tabs>
  );
}`}
        />
        <h2>Components that take callbacks</h2>
        <p>
          A server component cannot pass a function as a prop. So a component with a handler, such as <code>onAllow</code> on ApprovalPrompt or <code>onPageChange</code> on Pagination, has to be used from a file of your own that starts with{' '}
          <code>"use client"</code>.
        </p>
        <Block
          code={`
'use client';

import { ApprovalPrompt } from '@creance-ui/react';

export function Approval({ id }) {
  return (
    <ApprovalPrompt
      action="npm install zod@3"
      risk="medium"
      reason="A runtime dependency is missing."
      onAllow={(scope) => allow(id, scope)}
      onDeny={() => deny(id)}
    />
  );
}`}
        />
        <h2>The event model on the server</h2>
        <p>
          The reducer and the selectors have no client-only code, so a run can be reduced on the server and passed down as plain data. <code>useSimulator</code> is a client hook.
        </p>
        <h2>How this was checked</h2>
        <p>
          The repository has a Next.js app that renders all 109 components: 97 from a server component and the rest from a client page. A browser test checks what the server sends, that the page hydrates without errors, and that the components respond. A lint step
          fails if a file needs the client marker and lacks it.
        </p>
      </>
    ),
  },
  {
    name: 'Usage',
    group: 'Getting started',
    about: 'Use a component on its own, or drive a whole screen from one stream of events.',
    body: () => (
      <>
        <h2>A component on its own</h2>
        <p>Every component takes plain props, so each one works with data from anywhere.</p>
        <Block
          code={`
import { ApprovalPrompt } from '@creance-ui/react';

<ApprovalPrompt
  agentName="Deploy Fixer"
  action="npm install zod@3"
  target="web/package.json"
  risk="medium"
  reason="server/validate.ts imports zod, but it is missing from dependencies."
  onAllow={(scope) => allow(scope)}
  onDeny={() => deny()}
/>`}
        />
        <h2>A screen driven by events</h2>
        <p>
          Your backend emits <code>AgentEvent</code>s: a run started, a tool call failed, an approval was requested. <code>useAgentRun</code> reduces them to run state, and selectors turn that state into props.
        </p>
        <Block
          code={`
import { ApprovalPrompt, RunTimeline, timelineSteps, useAgentRun } from '@creance-ui/react';

const run = useAgentRun(events);
const approval = run.approvals.find((a) => !a.decision);

<RunTimeline steps={timelineSteps(run)} />
{approval && (
  <ApprovalPrompt
    action={approval.action}
    target={approval.target}
    risk={approval.risk}
    reason={approval.reason}
    onAllow={(scope) => respond(approval.id, scope)}
    onDeny={() => respond(approval.id, 'deny')}
  />
)}`}
        />
        <p>The reducer ignores events for unknown steps, other runs and duplicates instead of throwing, because a live screen has to cope with a flaky connection.</p>
        <h2>Without a backend</h2>
        <p>The simulator plays a scripted run as real events. Approval and diff steps wait until a person answers, and a denial takes a different branch.</p>
        <Block
          code={`
import { useAgentRun } from '@creance-ui/react';
import { deployFix, useSimulator } from '@creance-ui/react/simulator';

const sim = useSimulator(deployFix, { autoplay: true });
const run = useAgentRun(sim.events);

sim.respond({ type: 'approval.resolved', approvalId: approval.id, decision: 'allow-once' });`}
        />
        <p>
          Connecting a real agent means emitting these events yourself. For the Vercel AI SDK,{' '}
          <a href="https://github.com/amitshrivastavaa/creance/tree/main/apps/ai-sdk">apps/ai-sdk</a> does it in one adapter file that turns <code>useChat</code>'s messages into events. Copy it; it is not part of the package.
        </p>
      </>
    ),
  },
  {
    name: 'Theming',
    group: 'Getting started',
    about: 'Every colour, radius, shadow and font is a CSS variable. Change the variables and the components follow.',
    body: () => (
      <>
        <h2>Try it</h2>
        <p>These controls set the same variables you would set in your own stylesheet. The components below are the real ones.</p>
        <ThemeLab />
        <h2>Two tiers of tokens</h2>
        <ul>
          <li>
            <strong>Primitives</strong> are the raw palette and scales, such as <code>--cr-blue-500</code> and <code>--cr-space-4</code>.
          </li>
          <li>
            <strong>Semantic tokens</strong> say what a value is for, such as <code>--cr-color-accent-bg</code> and <code>--cr-color-status-failed-fg</code>. They change between themes, and components use only these for colour.
          </li>
        </ul>
        <h2>Overriding</h2>
        <p>
          Set semantic tokens after the Creance stylesheets. Set them on <code>:root</code>: the glass colours are computed there from a tint and an opacity, so overriding those two further down the tree has no effect.
        </p>
        <Block
          code={`
:root {
  --cr-color-accent-bg: #7c3aed;
  --cr-color-accent-bg-hover: #6d28d9;
  --cr-glass-opacity-sheet: 80%;
  --cr-font-family-sans: 'Your Font', system-ui, sans-serif;
}`}
        />
        <p>
          A <code>:root</code> rule applies in both themes. To change a token in dark only, use the selectors the kit uses:{' '}
          <code>:root[data-theme="dark"]</code>, and <code>:root:not([data-theme="light"])</code> inside a{' '}
          <code>prefers-color-scheme: dark</code> media query.
        </p>
        <p>
          Glass opacity and animation durations are the exception: when someone asks their system for less transparency, more contrast or reduced
          motion, the kit's values win over yours.
        </p>
        <p>White text sits on the accent colour, so check its contrast when you change it.</p>
        <h2>Light, dark and solid</h2>
        <ul>
          <li>The theme follows the operating system by default.</li>
          <li>
            Force one with <code>data-theme="light"</code> or <code>data-theme="dark"</code> on <code>&lt;html&gt;</code>.
          </li>
          <li>
            Every glass layer turns opaque with no blur when someone asks their system for less transparency or more contrast, or when you set <code>data-transparency="reduce"</code> on <code>&lt;html&gt;</code>.
          </li>
          <li>Animation durations drop to zero when someone asks for reduced motion.</li>
        </ul>
        <h2>Targeting parts</h2>
        <p>
          Class names are a stable, public API with a <code>cr-</code> prefix, and variants are <code>data-*</code> attributes. You can style a part directly.
        </p>
        <Block
          code={`
.cr-approval__actions { justify-content: flex-end; }
.cr-button[data-variant='primary'] { text-transform: uppercase; }`}
        />
      </>
    ),
  },
  {
    name: 'Accessibility',
    group: 'Getting started',
    about: 'The target is WCAG 2.2 AA. This is what is in place, how it is checked, and what is not done.',
    body: () => (
      <>
        <h2>What is in place</h2>
        <ul>
          <li>
            <strong>Semantics first.</strong> Headings, lists, regions and native controls; ARIA only where HTML has no equivalent.
          </li>
          <li>
            <strong>Keyboard.</strong> Every action works by keyboard. Each component page lists its keys.
          </li>
          <li>
            <strong>Shortcuts that stay in their lane.</strong> Single-key shortcuts only fire while focus is inside the component, and never with Ctrl, Alt or ⌘.
          </li>
          <li>
            <strong>Focus.</strong> Prompts and banners move focus to themselves when they appear, and can be told not to. After a decision, focus moves to the outcome instead of being lost.
          </li>
          <li>
            <strong>Announcements.</strong> Live regions announce the moments that need a person, such as an approval request or a failed tool call, and not every tick of a long run.
          </li>
          <li>
            <strong>Not colour alone.</strong> Every status and risk level has its own shape, an icon and a word.
          </li>
          <li>
            <strong>Motion and transparency.</strong> Both follow the person's system settings.
          </li>
        </ul>
        <h2>How it is checked</h2>
        <ul>
          <li>axe runs on every Storybook story, in light and in dark. Any violation fails the build.</li>
          <li>Unit tests cover keyboard and focus behaviour, for example in the combobox, calendar, file tree, plan editor and kill switch.</li>
          <li>Lint rules from jsx-a11y run on every file.</li>
        </ul>
        <p>These checks caught real problems: two red-on-tint text colours below the contrast minimum, two unnamed search landmarks on one page, and two controls whose visible text was missing from their accessible name.</p>
        <h2>What is not done</h2>
        <Alert title="No manual screen-reader pass yet">Automated checks do not replace testing with assistive technology. A structured pass with VoiceOver and NVDA is the next accessibility task.</Alert>
      </>
    ),
  },
  {
    name: 'Architecture',
    group: 'Project',
    about: 'One event stream in, plain props out, and the decisions behind the build.',
    body: () => (
      <>
        <h2>How the pieces connect</h2>
        <p>Your backend emits typed events. A pure reducer turns them into run state, and small selectors turn that state into props. No component imports the event model.</p>
        <ol className="flow">
          {[
            ['AgentEvent', 'from SSE, a WebSocket, a log or the simulator'],
            ['useAgentRun(events)', 'a pure reducer'],
            ['RunState', 'steps, calls, approvals, usage'],
            ['selectors', 'timelineSteps, inboxItems'],
            ['components', 'plain props'],
          ].map(([name, what]) => (
            <li key={name}>
              <span className="tile">
                <b>{name}</b>
                <small>{what}</small>
              </span>
            </li>
          ))}
        </ol>
        <h2>Decisions and their costs</h2>
        <ul>
          <li>
            <strong>Plain CSS on tokens, not CSS-in-JS or Tailwind.</strong> Each component has its own CSS file using only <code>--cr-*</code> variables, built into one stylesheet. There is no runtime cost and it works with server rendering. The cost is global
            class names, kept apart with the <code>cr-</code> prefix. A lint step rejects any raw colour in component CSS.
          </li>
          <li>
            <strong>Two tiers of tokens.</strong> Primitives and semantic tokens. A third, per-component tier is left out until someone needs to theme one component in isolation.
          </li>
          <li>
            <strong>Native first, Radix where it is hard.</strong> Checkboxes, radios, switches, selects and progress bars are native elements. Ten Radix packages handle dialogs, menus, tabs, popovers, sliders, toasts and the like. The combobox, calendar and
            file tree are hand-built to the ARIA patterns, because Radix has no equivalent.
          </li>
          <li>
            <strong>Driven by events, not tied to them.</strong> One event stream keeps the agent screens consistent: a step with an open approval shows as waiting everywhere. Plain props mean teams with their own state management can skip the reducer.
          </li>
          <li>
            <strong>The approval prompt is not a modal.</strong> People usually need to read the timeline before allowing something, so the prompt is an inline, labelled group that takes focus when it appears instead of trapping it.
          </li>
          <li>
            <strong>One module per component.</strong> The package ships a file per component so bundlers can drop what an app does not import. Importing only ApprovalPrompt adds 1.87 kB of Creance code, minified and compressed.
          </li>
          <li>
            <strong>Simulated by default.</strong> A simulator ships instead of a real agent integration, so components can be built, tested and shown the same way every time. A real model runs only in the AI SDK example, locally, with your own key.
          </li>
        </ul>
        <h2>Atomic levels</h2>
        <p>Components sit in four levels: atoms, molecules, organisms and one template. Imports only point down a level, and a lint rule enforces it.</p>
      </>
    ),
  },
  {
    name: 'Testing',
    group: 'Project',
    about: 'The checks that run in CI on every push, with the figures from the latest commit.',
    body: () => (
      <>
        <div className="ref">
          <div className="ref__scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Check</th>
                  <th scope="col">How</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Types', 'TypeScript in strict mode', 'Passes in every package and app'],
                  ['Lint', 'ESLint with accessibility rules, import-direction rules, and a check that component CSS uses only tokens', '83 CSS files, no raw colours'],
                  ['Unit and interaction', 'Vitest and React Testing Library', '113 tests'],
                  ['Accessibility', 'axe on every Storybook story, in light and dark', '340 runs; any violation fails the build'],
                  ['Visual regression', 'Playwright screenshots in the CI Docker image', '59 stories in 2 themes, 118 screenshots'],
                  ['React 18', 'The same unit tests with React 18 installed', '113 tests'],
                  ['End to end', 'Playwright on the demo app', '2 scenarios: the full run and the deny path'],
                  ['Next.js', 'Playwright on a Next.js 16 App Router app', 'All 109 components: sent by the server, hydrated without errors, interactive'],
                  ['Bundle size', 'size-limit, compressed, without React and Radix', 'All components 31.4 kB, styles 14.1 kB'],
                ].map(([check, how, result]) => (
                  <tr key={check}>
                    <th scope="row">{check}</th>
                    <td>{how}</td>
                    <td>{result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <h2>What the checks found</h2>
        <p>They caught real problems while the library was being built, and all were fixed:</p>
        <ul>
          <li>Two red-on-tint text colours below the contrast minimum, at 4.29:1 and 4.16:1.</li>
          <li>Two unnamed search landmarks on one page.</li>
          <li>Two controls whose visible text was missing from the name a screen reader announces.</li>
          <li>A canvas that stayed blank with reduced motion turned on.</li>
          <li>A build that kept every component in the bundle whatever an app imported.</li>
        </ul>
        <h2>What they do not cover</h2>
        <p>Automated checks do not replace testing with assistive technology. A manual screen-reader pass has not been done.</p>
        <p>One screenshot test in about a hundred lands a sub-pixel off, on a different story each run, and the cause has not been found. The visual suite retries twice, so a real change still fails while this is reported as flaky.</p>
      </>
    ),
  },
  {
    name: 'Status',
    group: 'Project',
    about: 'On npm. The code is complete and passes its checks. This is what is not done.',
    body: () => (
      <>
        <ul className="status-list">
          <li>
            <StatusDot status="done">The 109 components, tokens, event model and simulator are built.</StatusDot>
          </li>
          <li>
            <StatusDot status="done">Every automated check passes on the latest commit.</StatusDot>
          </li>
          <li>
            <StatusDot status="done">It is tested in Vite and in the Next.js App Router, on React 18 and 19.</StatusDot>
          </li>
          <li>
            <StatusDot status="done">It is published to npm as @creance-ui/react and @creance-ui/tokens, and the repository is public.</StatusDot>
          </li>
          <li>
            <StatusDot status="done">A real model runs through the Vercel AI SDK in apps/ai-sdk, locally with your own key. The hosted demo still plays a simulated run.</StatusDot>
          </li>
          <li>
            <StatusDot status="queued">A manual screen-reader pass with VoiceOver and NVDA has not been done.</StatusDot>
          </li>
          <li>
            <StatusDot status="queued">Most components have one example on this site; 20 have several.</StatusDot>
          </li>
        </ul>
        <p>Creance is built by Amit Shrivastava as a one-person project, under the MIT licence. It has no production users.</p>
      </>
    ),
  },
];
