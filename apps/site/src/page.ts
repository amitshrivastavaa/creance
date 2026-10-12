// The page shell around the React app: three views in one document, and the demo run in the hero.

declare global {
  interface Window {
    /** Go to a section of the overview, a guide or a component, by name. */
    creanceGo?: (target: string, scroll?: boolean) => void;
  }
}

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

// ── Router ────────────────────────────────────────────────────────────────────────────────────
// Links are handled here rather than left to the browser, so navigation still works where a host
// frame will not let the address change.
const page = el('page');
const views = { overview: el('view-overview'), examples: el('view-examples'), components: el('view-components') };
const isSection = (id: string) => !id || id === 'overview' || !!views.overview.querySelector(`#${CSS.escape(id)}`);
let last = '';
const homeTitle = document.title;

function go(target: string, scroll = true) {
  const id = String(target || '').replace(/^#/, '');
  const view = id === 'examples' ? 'examples' : isSection(id) ? 'overview' : 'components';
  const changed = page.dataset.view !== view;
  page.dataset.view = view;
  for (const [name, node] of Object.entries(views)) node.hidden = name !== view;
  document.querySelectorAll<HTMLElement>('[data-tab]').forEach((a) => (a.dataset.tab === view ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  try {
    if (location.hash.slice(1) !== id) history.replaceState(null, '', `#${id}`);
  } catch {
    // Some frames forbid changing the address; the view has still changed.
  }
  if (view === 'components') window.dispatchEvent(new CustomEvent('creance:go', { detail: id }));
  document.title = view === 'examples' ? 'Examples · Creance' : view === 'components' && id !== 'components' ? `${id} · Creance` : homeTitle;
  if (scroll) {
    const section = view === 'overview' && id && id !== 'overview' ? document.getElementById(id) : null;
    if (section) section.scrollIntoView();
    // Back to the top for a new page or a new component, but not for a link inside an example.
    else if (changed || id === 'overview' || (view === 'components' && id !== 'components' && id !== last)) window.scrollTo(0, 0);
  }
  last = id;
}

window.creanceGo = go;
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest?.('a[href^="#"]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  go(a.getAttribute('href') ?? '');
});
window.addEventListener('hashchange', () => go(location.hash, false));
go(location.hash, false);

// ── Hero demo ─────────────────────────────────────────────────────────────────────────────────
// A hand-written copy of a run, so the overview shows something before the library has loaded.
type DemoState = 'waiting' | 'running' | 'done' | 'denied' | 'stopped';
const pill = el('demo-pill');
const approval = el('demo-approval');
const outcome = el('demo-outcome');
const kill = el('demo-kill');
const step2 = el('demo-step-2');
const step3 = el('demo-step-3');
const live = el('demo-live');
let timer: ReturnType<typeof setTimeout> | undefined;
let state: DemoState = 'waiting';

const step = (node: HTMLElement, status: string, meta: string) => {
  node.dataset.status = status;
  node.querySelector('.step__meta')!.textContent = meta;
};
const finish = (who: string, title: string, text: string) => {
  el('demo-outcome-who').textContent = who;
  el('demo-outcome-title').textContent = title;
  el('demo-outcome-text').textContent = text;
  approval.hidden = true;
  outcome.hidden = false;
  kill.hidden = true;
  live.textContent = title;
};

function set(next: DemoState, focus = false) {
  clearTimeout(timer);
  state = next;
  if (next === 'waiting') {
    pill.textContent = 'Waiting for you';
    pill.className = 'pill pill--ink';
    step(step2, 'waiting', 'Waiting for you');
    step(step3, 'queued', 'Queued');
    approval.hidden = false;
    outcome.hidden = true;
    kill.hidden = false;
    live.textContent = '';
    if (focus) approval.focus();
    return;
  }
  if (next === 'running') {
    pill.textContent = 'Running';
    pill.className = 'pill';
    step(step2, 'running', 'Running');
    live.textContent = 'Allowed once. Deploy Fixer is running.';
    // Move focus to the outcome only if the person has not moved on to something else.
    timer = setTimeout(() => set('done', document.activeElement === document.body || approval.contains(document.activeElement)), 1500);
    return;
  }
  if (next === 'done') {
    pill.textContent = 'Completed';
    pill.className = 'pill';
    step(step2, 'done', 'Done, 3s');
    step(step3, 'done', 'Done, 4s');
    finish('You allowed npm install zod@3 once', 'Deploy Fixer finished and handed back to you', 'It added the missing zod dependency. All 42 tests pass and the production build succeeds. Nothing has been deployed yet.');
  } else if (next === 'denied') {
    pill.textContent = 'Stopped';
    pill.className = 'pill pill--red';
    step(step2, 'denied', 'Denied');
    step(step3, 'queued', 'Skipped');
    finish('You denied npm install zod@3', 'Deploy Fixer stopped and handed back to you', 'Nothing was installed. The deploy is still failing, and the run can be started again with a different plan.');
  } else {
    pill.textContent = 'Stopped';
    pill.className = 'pill pill--red';
    step(step2, 'queued', 'Stopped');
    step(step3, 'queued', 'Skipped');
    finish('You held the stop button', 'You stopped Deploy Fixer', 'It stopped after its current call. Changes it already made stay; nothing new is installed, written or deployed.');
  }
  if (focus) outcome.focus();
}

el('demo-allow').addEventListener('click', () => state === 'waiting' && set('running'));
el('demo-deny').addEventListener('click', () => state === 'waiting' && set('denied', true));
el('demo-replay').addEventListener('click', () => set('waiting', true));
// Shortcuts only while focus is inside the prompt, and never with a modifier key.
approval.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey || state !== 'waiting') return;
  if (e.key === 'a') set('running');
  if (e.key === 'd') set('denied', true);
});

// Hold to stop: one second by pointer, Space or Enter. Letting go early does nothing.
let hold: ReturnType<typeof setTimeout> | undefined;
const labels = kill.querySelectorAll('.kill__label');
const say = (text: string) => labels.forEach((l) => (l.textContent = text));
const cancel = () => {
  clearTimeout(hold);
  delete kill.dataset.holding;
  say('Hold to stop');
};
const start = () => {
  if (kill.dataset.holding !== undefined) return;
  kill.dataset.holding = '';
  say('Keep holding');
  hold = setTimeout(() => {
    cancel();
    set('stopped', true);
  }, 1000);
};
kill.addEventListener('pointerdown', (e) => e.button === 0 && start());
for (const name of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) kill.addEventListener(name, cancel);
kill.addEventListener('keydown', (e) => {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  e.preventDefault();
  if (!e.repeat) start();
});
kill.addEventListener('keyup', (e) => (e.key === ' ' || e.key === 'Enter') && cancel());
kill.addEventListener('contextmenu', (e) => e.preventDefault());

export {};
