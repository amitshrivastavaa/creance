// The docs: getting-started guides and every component, running from the real library with
// example code that can be edited in place.
import './site.css';
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';
import './page';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Creance from '@creance-ui/react';
import { deployFix } from '@creance-ui/react/simulator';
import { examples, groups, type Example } from './examples';
import { guides, type Guide } from './guides';
import { keyboard } from './keyboard';
import propsData from './props.json';
import { Colored } from './colored';
import { run } from './jsx';

// ── Sample data the examples can name ─────────────────────────────────────────────────────────
/** The deploy scenario played up to an event, with waits answered, as plain events. */
function scenario(until?: Creance.AgentEventType): Creance.AgentEvent[] {
  const bodies: [number, Creance.AgentEventBody][] = [];
  let t = 0;
  for (const step of deployFix) {
    if ('waitFor' in step) {
      t += 1500;
      bodies.push([
        t,
        step.waitFor === 'approval.resolved'
          ? { type: 'approval.resolved', approvalId: step.id, decision: 'allow-once' }
          : { type: 'diff.resolved', diffId: step.id, accepted: [], rejected: [] },
      ]);
      continue;
    }
    t += step.after;
    bodies.push([t, step.event]);
    if (step.event.type === until) break;
  }
  const now = Date.now();
  return bodies.map(([at, body]) => ({ ...body, runId: 'run-1', ts: now - (t - at) }) as Creance.AgentEvent);
}
const reduce = (events: Creance.AgentEvent[]) => events.reduce(Creance.reduceRun, Creance.initialRunState);
const waiting = reduce(scenario('approval.requested'));
const finished = reduce(scenario());
const minute = 60_000;

const data: Record<string, unknown> = {
  steps: Creance.timelineSteps(waiting),
  inbox: [
    ...Creance.inboxItems(waiting),
    { id: 'q1', kind: 'question', title: 'Which staging database should I seed?', agentName: 'Data Loader', createdAt: Date.now() - 14 * minute, urgency: 'normal', detail: 'staging-eu or staging-us' },
    { id: 'f1', kind: 'failed-run', title: 'Nightly dependency upgrade', agentName: 'Upgrader', createdAt: Date.now() - 42 * minute, urgency: 'high', detail: '3 tests failing after upgrading react-router' },
    { id: 'r1', kind: 'review', title: 'Review changes to docs/onboarding.md', agentName: 'Docs Writer', createdAt: Date.now() - 6 * minute, urgency: 'low', detail: '4 hunks' },
  ],
  finishedSteps: Creance.timelineSteps(finished),
  diff: finished.diffs[0],
  runs: [
    { id: 'r41', title: 'Fix the failing deploy', agent: 'Deploy Fixer', status: 'waiting', tokens: 9800 },
    { id: 'r40', title: 'Upgrade react-router', agent: 'Deploy Fixer', status: 'failed', tokens: 31200 },
    { id: 'r39', title: 'Seed staging', agent: 'Data Loader', status: 'running', tokens: 4100 },
    { id: 'r38', title: 'Write onboarding docs', agent: 'Docs Writer', status: 'done', tokens: 18000 },
  ],
  stackTrace: ["Error: Cannot find module 'zod'", '    at server/validate.ts:3', '    at Module._compile', '    at Object.require', '    at Module.load', '    at Function.Module._load', '    at main.ts:12'].join('\n'),
  poster:
    'data:image/svg+xml,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4150"/><stop offset="1" stop-color="#20242c"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/></svg>'),
  emptyVideo: 'data:video/mp4;base64,',
  /** A calendar day; months count from 1. */
  day: (y: number, m: number, d: number) => new Date(y, m - 1, d, 12),
  hoursAgo: (h: number) => new Date(Date.now() - h * 60 * minute),
  secondsAgo: (s: number) => Date.now() - s * 1000,
  format: {
    k: (v: number) => `${v / 1000}K`,
    seconds: (v: number) => `${v}s`,
    times: (v: number) => `${v}×`,
  },
  toast: Creance.toast,
};

// Tags the code may use: every exported component.
const components: Record<string, unknown> = {};
for (const [name, value] of Object.entries(Creance)) {
  if (/^[A-Z]/.test(name) && (typeof value === 'function' || (value && typeof value === 'object' && '$$typeof' in value))) components[name] = value;
}

// ── Preview ───────────────────────────────────────────────────────────────────────────────────
class Boundary extends Component<{ code: string; onError: (m: string) => void; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }
  override componentDidUpdate(prev: { code: string }) {
    if (prev.code !== this.props.code && this.state.failed) this.setState({ failed: false });
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

const show = (a: unknown): string => {
  if (a && typeof a === 'object' && ('nativeEvent' in a || a instanceof Event)) return 'event';
  if (a === undefined) return 'undefined';
  try {
    const s = JSON.stringify(a);
    return s.length > 90 ? `${s.slice(0, 88)}…` : s;
  } catch {
    return '…';
  }
};

/** A live preview with the code that produces it. Editing the code updates the preview. */
function Playground({ id, label, code: initial, state: initialState, lead }: { id: string; label: string; code: string; state?: Record<string, unknown>; lead?: boolean }) {
  const [code, setCode] = useState(initial);
  const [st, setSt] = useState<Record<string, unknown>>(initialState ?? {});
  const [events, setEvents] = useState<string[]>([]);
  // A crash belongs to the code that caused it, so editing the code clears it.
  const [crashed, setCrashed] = useState<{ code: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  // The last preview that rendered, shown dimmed while the code is being edited into shape.
  const [good, setGood] = useState<ReactNode>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  const report = (name: string, args: unknown[]) => setEvents((e) => [`${name}(${args.map(show).join(', ')})`, ...e].slice(0, 4));

  const { element, error } = useMemo(() => {
    const set = Object.fromEntries(Object.keys(initialState ?? {}).map((k) => [k, (v: unknown) => setSt((s) => ({ ...s, [k]: v }))]));
    const mark = (revoked: boolean) => (pid: string) =>
      setSt((s) => ({ ...s, permissions: ((s.permissions as { id: string }[] | undefined) ?? []).map((p) => (p.id === pid ? { ...p, revoked } : p)) }));
    try {
      const el = run(code, {
        scope: { ...data, state: st, set, revoke: mark(true), restore: mark(false) },
        components,
        report,
        onError: (message) => setCrashed({ code, message }),
      }) as ReactNode;
      return { element: el, error: '' };
    } catch (e) {
      return { element: null, error: (e as Error).message };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, st]);

  if (!error && good !== element) setGood(element);
  const problem = error || (crashed?.code === code ? crashed.message : '');
  const edited = code !== initial;
  const imports = [...new Set([...code.matchAll(/<([A-Z]\w*)/g)].map((m) => m[1]!))].sort().join(', ');
  const importLine = `import { ${imports} } from '@creance-ui/react';`;

  return (
    <section className="doc__panel window" aria-label={label}>
      <div className="doc__stage" data-stale={error ? '' : undefined}>
        <Boundary code={code} onError={(message) => setCrashed({ code, message })}>
          {error ? good : element}
        </Boundary>
      </div>

      {problem && (
        <p className="doc__problem" role="alert">
          {problem}
        </p>
      )}

      <div className="doc__editor">
        <div className="doc__editor-bar">
          <label htmlFor={id}>{lead ? 'Edit the code. The preview updates as you type.' : 'Code'}</label>
          <span className="doc__editor-actions">
            {edited && (
              <button
                type="button"
                onClick={() => {
                  setCode(initial);
                  setSt(initialState ?? {});
                  area.current?.focus();
                }}
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${importLine}\n\n${code}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  area.current?.select();
                }
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </span>
        </div>
        {lead && (
          <div className="doc__import">
            <Colored code={importLine} />
          </div>
        )}
        <div className="doc__code">
          <Colored code={code} />
          <textarea ref={area} id={id} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" value={code} onChange={(e) => setCode(e.currentTarget.value)} />
        </div>
        {(lead || events.length > 0) && (
          <p className="doc__events" role="log" aria-label="Events from the preview">
            {events.length ? (
              events.map((e, i) => (
                <code key={`${events.length}-${i}`} data-latest={i === 0 || undefined}>
                  {e}
                </code>
              ))
            ) : (
              <span>
                Handlers written as <code>log</code> report their calls here.
              </span>
            )}
          </p>
        )}
      </div>
    </section>
  );
}

function Doc({ example, prev, next }: { example: Example; prev?: Entry; next?: Entry }) {
  return (
    <article className="doc">
      <header className="doc__head">
        <p className="doc__crumb">
          {example.group} <span aria-hidden="true">/</span> {example.level}
        </p>
        <h1>{example.name}</h1>
        <p className="doc__about">{example.about}</p>
      </header>

      <Playground id="pg-code" label={`${example.name} example`} code={example.code} state={example.state} lead />

      {example.more && (
        <section className="doc__more" aria-labelledby="more-title">
          <h2 id="more-title">Examples</h2>
          {example.more.map((m, i) => (
            <div key={m.title} className="doc__example">
              <h3>{m.title}</h3>
              {m.about && <p>{m.about}</p>}
              <Playground id={`pg-code-${i + 1}`} label={`${example.name}: ${m.title}`} code={m.code} state={m.state} />
            </div>
          ))}
        </section>
      )}

      <Reference name={example.name} />
      <Pager prev={prev} next={next} />
    </article>
  );
}

// ── Reference: props and keyboard ─────────────────────────────────────────────────────────────
interface Prop {
  name: string;
  type: string;
  required: boolean;
  doc: string;
  deprecated: boolean;
  default?: string;
}
interface Part {
  kind: 'component' | 'function' | 'type' | 'union';
  name: string;
  props?: Prop[];
  html?: boolean;
  type?: string;
  signature?: string;
  doc?: string;
}
const reference = propsData as unknown as Record<string, Part[]>;

/** Source comments mark code with backticks; show those spans as code. */
const inlineCode = (text: string) => text.split('`').map((t, i) => (i % 2 ? <code key={i}>{t}</code> : t));

function PropsTable({ props }: { props: Prop[] }) {
  return (
    <div className="ref__scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <th scope="row">
                <code>{p.name}</code>
                {p.required && <span className="ref__flag">required</span>}
                {p.deprecated && <span className="ref__flag">deprecated</span>}
              </th>
              <td>
                <code>{p.type}</code>
              </td>
              <td>{p.default ? <code>{p.default}</code> : <span aria-label="none">–</span>}</td>
              <td>{inlineCode(p.doc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reference({ name }: { name: string }) {
  const parts = reference[name] ?? [];
  const keys = keyboard[name];
  return (
    <>
      {parts.length > 0 && (
        <section className="ref" aria-labelledby="ref-props">
          <h2 id="ref-props">Props</h2>
          {parts.map((part) => (
            <div key={part.name} className="ref__part">
              <h3>
                <code>{part.kind === 'component' ? `<${part.name}>` : part.kind === 'function' ? `${part.name}()` : part.name}</code>
                {part.kind === 'type' && <span>data type</span>}
              </h3>
              {part.kind === 'union' && (
                <p>
                  <code>{part.type}</code>
                </p>
              )}
              {part.kind === 'function' && (
                <p>
                  <code>
                    {part.name}
                    {part.signature}
                  </code>
                  {part.doc ? <> {inlineCode(part.doc)}</> : null}
                </p>
              )}
              {part.props && part.props.length > 0 && <PropsTable props={part.props} />}
              {part.kind === 'component' && !part.props?.length && <p>No props of its own.</p>}
              {part.html && <p className="ref__note">Also accepts the standard HTML attributes of the element it renders, such as className and event handlers.</p>}
            </div>
          ))}
        </section>
      )}
      {keys && (
        <section className="ref" aria-labelledby="ref-keys">
          <h2 id="ref-keys">Keyboard</h2>
          <div className="ref__scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">What it does</th>
                </tr>
              </thead>
              <tbody>
                {keys.keys.map(([k, does]) => (
                  <tr key={k + does}>
                    <th scope="row">
                      <kbd>{k}</kbd>
                    </th>
                    <td>{does}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {keys.note && <p className="ref__note">{keys.note}</p>}
        </section>
      )}
    </>
  );
}

function Pager({ prev, next }: { prev?: Entry; next?: Entry }) {
  return (
    <nav className="doc__pager" aria-label="More pages">
      {prev ? (
        <a href={`#${prev.name}`} rel="prev">
          <span>Previous</span>
          {prev.name}
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a href={`#${next.name}`} rel="next">
          <span>Next</span>
          {next.name}
        </a>
      )}
    </nav>
  );
}

function GuidePage({ guide, prev, next }: { guide: Guide; prev?: Entry; next?: Entry }) {
  return (
    <article className="doc">
      <header className="doc__head">
        <p className="doc__crumb">{guide.group}</p>
        <h1>{guide.name}</h1>
        <p className="doc__about">{guide.about}</p>
      </header>
      <div className="prose">{guide.body()}</div>
      <Pager prev={prev} next={next} />
    </article>
  );
}

// ── Browser ───────────────────────────────────────────────────────────────────────────────────
type Entry = Example | Guide;
const guideGroups = [...new Set(guides.map((g) => g.group))];
const isGuide = (e: Entry): e is Guide => 'body' in e;
const find = (name: string): Entry | undefined => [...guides, ...examples].find((e) => e.name.toLowerCase() === name.toLowerCase());
const go = (name: string) => (window as unknown as { creanceGo?: (n: string) => void }).creanceGo?.(name);
const remembered = () => {
  try {
    return localStorage.getItem('creance-order') === 'az';
  } catch {
    return false;
  }
};

function Browser() {
  const [current, setCurrent] = useState<Entry>(() => find(decodeURIComponent(location.hash.slice(1))) ?? examples[0]!);
  const [az, setAz] = useState(remembered);

  // The page's router announces every navigation, whether or not the address bar could change.
  useEffect(() => {
    const onGo = (e: Event) => {
      const name = String((e as CustomEvent).detail);
      const hit = find(name);
      if (hit) setCurrent(hit);
      // "Components" from a guide lands on the first component.
      else if (name === 'components') setCurrent((c) => (isGuide(c) ? examples[0]! : c));
    };
    window.addEventListener('creance:go', onGo);
    return () => window.removeEventListener('creance:go', onGo);
  }, []);

  // Keep the selected page visible in the sidebar without moving the document.
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = list.current;
    const item = box?.querySelector<HTMLElement>('a[aria-current]');
    if (!box || !item) return;
    const top = item.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top + item.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = top - box.clientHeight / 2;
  }, [current, az]);

  const sorted = az ? [...examples].sort((a, b) => a.name.localeCompare(b.name)) : examples;
  const ordered: Entry[] = [...guides, ...sorted];
  const at = ordered.indexOf(current);
  const order = (next: boolean) => {
    setAz(next);
    try {
      localStorage.setItem('creance-order', next ? 'az' : 'type');
    } catch {
      // Storage can be unavailable; the choice still holds for this visit.
    }
  };
  const link = (e: Entry) => (
    <li key={e.name}>
      <a href={`#${e.name}`} aria-current={e === current ? 'page' : undefined}>
        {e.name}
      </a>
    </li>
  );
  const section = (title: string, items: Entry[]) =>
    items.length ? (
      <section key={title} aria-label={title}>
        <h2>{title}</h2>
        <ul>{items.map(link)}</ul>
      </section>
    ) : null;

  return (
    <div className="docs">
      <nav className="docs__nav" aria-label="Docs">
        <div className="docs__list" ref={list}>
          {guideGroups.map((g) => section(g, guides.filter((e) => e.group === g)))}
          <div className="docs__order" role="group" aria-label="Order of components">
            <button type="button" aria-pressed={!az} onClick={() => order(false)}>
              By type
            </button>
            <button type="button" aria-pressed={az} onClick={() => order(true)}>
              A to Z
            </button>
          </div>
          {az ? section(`Components (${examples.length})`, sorted) : groups.map((g) => section(g, sorted.filter((e) => e.group === g)))}
        </div>
      </nav>

      <div className="docs__main">
        <label className="vh" htmlFor="pg-pick">
          Page
        </label>
        <select id="pg-pick" className="docs__pick" value={current.name} onChange={(e) => go(e.currentTarget.value)}>
          {guideGroups.map((g) => (
            <optgroup key={g} label={g}>
              {guides.filter((e) => e.group === g).map((e) => (
                <option key={e.name}>{e.name}</option>
              ))}
            </optgroup>
          ))}
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {examples.filter((e) => e.group === g).map((e) => (
                <option key={e.name}>{e.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {isGuide(current) ? (
          <GuidePage key={current.name} guide={current} prev={ordered[at - 1]} next={ordered[at + 1]} />
        ) : (
          <Doc key={current.name} example={current} prev={ordered[at - 1]} next={ordered[at + 1]} />
        )}
      </div>
    </div>
  );
}

// ── Top bar: search and theme ─────────────────────────────────────────────────────────────────
const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const themeNow = (): Creance.ThemeChoice => {
  const t = document.documentElement.dataset.theme;
  return t === 'dark' || t === 'light' ? t : 'system';
};

function Tools() {
  const [open, setOpen] = useState(false);
  // Start from the theme the page already has, so mounting never changes it.
  const [theme, setTheme] = useState<Creance.ThemeChoice>(themeNow);
  const commands = useMemo<Creance.Command[]>(
    () => [
      { id: 'overview', group: 'Pages', label: 'Overview', onSelect: () => go('overview') },
      ...guides.map((g) => ({ id: g.name, group: g.group, label: g.name, keywords: [g.about], onSelect: () => go(g.name) })),
      ...examples.map((e) => ({ id: e.name, group: e.group, label: e.name, keywords: [e.about], meta: e.level, onSelect: () => go(e.name) })),
    ],
    [],
  );
  return (
    <>
      <button type="button" className="tools__search" onClick={() => setOpen(true)}>
        <span>Search</span>
        <kbd>{mac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>
      <Creance.ThemeSwitcher value={theme} onValueChange={setTheme} />
      <Creance.CommandMenu open={open} onOpenChange={setOpen} commands={commands} placeholder="Search components and guides" label="Search" />
    </>
  );
}

const mount = document.getElementById('playground');
if (mount) createRoot(mount).render(<Browser />);
const tools = document.getElementById('tools');
if (tools) createRoot(tools).render(<Tools />);

// The page's router uses this to tell a docs page from a section of the overview.
(window as unknown as Record<string, unknown>).__creanceExamples = examples.map((e) => e.name);
