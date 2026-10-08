import type { AgentEvent, AgentEventBody } from '../events';

/** Emit `event` `after` ms after the previous step. */
export interface TimedStep {
  after: number;
  event: AgentEventBody;
}

/**
 * Pause until the human answers through `respond()`. If an approval is denied,
 * `ifDenied` plays instead of the rest of the scenario.
 */
export interface WaitStep {
  waitFor: 'approval.resolved' | 'diff.resolved';
  id: string;
  ifDenied?: TimedStep[];
}

export type ScenarioStep = TimedStep | WaitStep;
export type Scenario = ScenarioStep[];

export type SimulatorState = 'idle' | 'playing' | 'paused' | 'waiting' | 'done';

export interface SimulatorOptions {
  /** Playback speed multiplier. 2 plays twice as fast. */
  speed?: number;
  runId?: string;
  /** Clock for event timestamps. */
  now?: () => number;
}

export interface Simulator {
  subscribe(listener: (event: AgentEvent) => void): () => void;
  /** Listen for playback state changes. */
  onStateChange(listener: (state: SimulatorState) => void): () => void;
  start(): void;
  pause(): void;
  /** Stop and rewind. Subscribers should clear their events. */
  reset(): void;
  /** Send a human decision into the run (approval.resolved or diff.resolved). */
  respond(event: Extract<AgentEventBody, { type: 'approval.resolved' | 'diff.resolved' }>): void;
  readonly state: SimulatorState;
}

const isWait = (step: ScenarioStep): step is WaitStep => 'waitFor' in step;

/**
 * Plays a scripted scenario as a stream of events with realistic timing, using only setTimeout.
 * Pausing mid-delay keeps the remaining time, so resume continues where it left off.
 */
export function createSimulator(scenario: Scenario, options: SimulatorOptions = {}): Simulator {
  const { speed = 1, runId = 'run-1', now = Date.now } = options;
  const listeners = new Set<(event: AgentEvent) => void>();
  const stateListeners = new Set<(state: SimulatorState) => void>();

  let steps: ScenarioStep[] = scenario;
  let index = 0;
  let state: SimulatorState = 'idle';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dueAt = 0;
  let remaining: number | undefined;
  /** Answers by approval or diff id, kept so an early answer still releases its wait step. */
  const answers = new Map<string, Parameters<Simulator['respond']>[0]>();

  const setState = (next: SimulatorState) => {
    state = next;
    stateListeners.forEach((l) => l(next));
  };
  const emit = (body: AgentEventBody) => {
    const event = { ...body, runId, ts: now() } as AgentEvent;
    listeners.forEach((l) => l(event));
  };

  function passWait(step: WaitStep, answer: Parameters<Simulator['respond']>[0]) {
    if (answer.type === 'approval.resolved' && answer.decision === 'deny' && step.ifDenied) {
      steps = step.ifDenied;
      index = 0;
    } else {
      index++;
    }
  }

  function schedule() {
    if (state !== 'playing') return;
    const step = steps[index];
    if (!step) return setState('done');
    if (isWait(step)) {
      const answer = answers.get(step.id);
      if (!answer) return setState('waiting');
      passWait(step, answer);
      return schedule();
    }
    const delay = remaining ?? step.after / speed;
    remaining = undefined;
    dueAt = Date.now() + delay;
    timer = setTimeout(() => {
      timer = undefined;
      index++;
      emit(step.event);
      schedule();
    }, delay);
  }

  return {
    get state() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    onStateChange(listener) {
      stateListeners.add(listener);
      return () => stateListeners.delete(listener);
    },
    start() {
      if (state !== 'idle' && state !== 'paused') return;
      setState('playing');
      schedule();
    },
    pause() {
      if (state !== 'playing') return;
      clearTimeout(timer);
      timer = undefined;
      remaining = Math.max(0, dueAt - Date.now());
      setState('paused');
    },
    reset() {
      clearTimeout(timer);
      timer = undefined;
      steps = scenario;
      index = 0;
      remaining = undefined;
      answers.clear();
      setState('idle');
    },
    respond(event) {
      const id = event.type === 'approval.resolved' ? event.approvalId : event.diffId;
      if (answers.has(id)) return;
      answers.set(id, event);
      emit(event);
      const step = steps[index];
      if (state === 'waiting' && step && isWait(step) && step.id === id) {
        passWait(step, event);
        setState('playing');
        schedule();
      }
    },
  };
}

/**
 * The scenario's events with deterministic timestamps, without playing it. Wait steps are skipped
 * (human responses are not part of the script). Use it for static stories, tests and screenshots:
 * `scenarioEvents(deployFix).slice(0, 12)` is the run frozen after its 12th event.
 */
export function scenarioEvents(scenario: Scenario, { runId = 'run-1', start = 0 } = {}): AgentEvent[] {
  let ts = start;
  return scenario.filter((s): s is TimedStep => !isWait(s)).map((s) => {
    ts += s.after;
    return { ...s.event, runId, ts } as AgentEvent;
  });
}
