// Sign in, then four steps of setup: a repository, an agent, what it may do, and a review.
// Nothing signs in or connects; every value stays on the page.
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';
import './app.css';
import { StrictMode, useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ApprovalPrompt,
  Button,
  Card,
  Checkbox,
  Choicebox,
  Description,
  Field,
  Input,
  RiskLabel,
  Slider,
  Steps,
  ThemeSwitcher,
  Toaster,
  toast,
  type StepItem,
} from '@creance-ui/react';
import { SampleNote } from '../SampleNote';

const glyph = (...d: string[]) => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
);
const icons = {
  code: glyph('M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5'),
  key: glyph('M7.3 8.7L13 3M11 5l1.5 1.5M9.5 6.5L11 8', 'M5.5 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'),
};
const sample = 'This is a sample: nothing signs in.';

const repos = [
  { value: 'acme/web', title: 'acme/web', description: 'The customer site. Next.js, deployed on every merge.' },
  { value: 'acme/api', title: 'acme/api', description: 'The public API. Node, deployed twice a week.' },
  { value: 'acme/docs', title: 'acme/docs', description: 'Help pages, published from Markdown.' },
];
const agents = [
  { value: 'Deploy Fixer', title: 'Deploy Fixer', description: 'Finds why a build or deploy fails, and fixes it.' },
  { value: 'Docs Writer', title: 'Docs Writer', description: 'Writes and updates docs from the code.' },
  { value: 'Upgrader', title: 'Upgrader', description: 'Upgrades dependencies, one pull request each.' },
];
const permissions = [
  { value: 'read', title: <span className="ex-perm">Read files <RiskLabel level="low" /></span>, description: 'Code, configs and logs. Nothing leaves the repository.' },
  { value: 'test', title: <span className="ex-perm">Run tests <RiskLabel level="low" /></span>, description: 'Any suite, in a sandbox.' },
  { value: 'install', title: <span className="ex-perm">Install packages <RiskLabel level="medium" /></span>, description: 'Changes package.json and the lockfile.' },
  { value: 'push', title: <span className="ex-perm">Push to branches <RiskLabel level="high" /></span>, description: 'High risk: it always asks, every time. This cannot be allowed here.', disabled: true },
];
const names: Record<string, string> = { read: 'Read files', test: 'Run tests', install: 'Install packages' };
const titles = ['Connect a repository', 'Choose an agent', 'Set permissions', 'Review and start'];

const read = () => window.location.hash.slice(1) || 'sign-in';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);
  const emailError = !email ? 'Enter your work email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'That does not look like an email address.' : undefined;
  const passwordError = password ? undefined : 'Enter your password.';
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (emailError || passwordError) return;
    window.location.hash = 'setup';
  };
  const elsewhere = (how: string) => {
    toast({ title: `${how}. ${sample}` });
    window.location.hash = 'setup';
  };
  return (
    <div className="ex-split">
      <section className="ex-pitch" aria-labelledby="pitch-h">
        <span className="ex-brand">Acme</span>
        <div className="ex-pitch__body">
          <h2 id="pitch-h">Agents that ask before they act.</h2>
          <p>Every install, push and payment waits for a person. You decide once, or every time. Try it:</p>
          <ApprovalPrompt
            agentName="Deploy Fixer"
            action="npm install zod@3"
            target="web/package.json"
            risk="medium"
            reason="zod is imported but missing, so the deploy fails."
            autoFocus={false}
            shortcuts={false}
            onAllow={() => toast({ title: 'Allowed once. That is the whole idea.' })}
            onDeny={() => toast({ title: 'Denied. The agent stops and explains.' })}
          />
        </div>
        <span className="ex-muted ex-small">© 2026 Acme, a made-up company</span>
      </section>
      <main className="ex-form-side">
        <SampleNote source="sign-in/main.tsx" />
        <form className="ex-form" onSubmit={submit} noValidate>
          <div>
            <h1>Sign in to Acme</h1>
            <p className="ex-muted">Welcome back. Use your work account.</p>
          </div>
          <Button type="button" onClick={() => elsewhere('Continue with GitHub')}>
            {icons.code}Continue with GitHub
          </Button>
          <Button type="button" onClick={() => elsewhere('Single sign-on')}>
            {icons.key}Continue with SSO
          </Button>
          <p className="ex-or">or with email</p>
          <Field label="Work email" error={tried ? emailError : undefined}>
            <Input type="email" autoComplete="email" placeholder="you@acme.example" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" error={tried ? passwordError : undefined}>
            <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <div className="ex-row">
            <Checkbox label="Keep me signed in" defaultChecked />
            <a href="#sign-in" onClick={() => toast({ title: `Password reset. ${sample}` })}>
              Forgot password?
            </a>
          </div>
          <Button type="submit" variant="primary">
            Sign in
          </Button>
          <p className="ex-center">
            New to Acme? <a href="#setup">Create an account</a>
          </p>
        </form>
      </main>
    </div>
  );
}

function Setup() {
  const [step, setStep] = useState(0);
  const [repo, setRepo] = useState('acme/web');
  const [agent, setAgent] = useState('Deploy Fixer');
  const [allowed, setAllowed] = useState(['read', 'test']);
  const [budget, setBudget] = useState([50_000]);
  const steps: StepItem[] = titles.map((title, i) => ({
    title,
    status: i < step ? 'done' : i === step ? 'current' : 'upcoming',
    description: i < step ? [repo, agent, `${allowed.length} allowed`][i] : i === step ? `Step ${i + 1} of 4` : undefined,
  }));
  return (
    <main className="ex-setup">
      <SampleNote source="sign-in/main.tsx" />
      <span className="ex-brand">Acme</span>
      <Card as="section" className="ex-wizard" aria-labelledby="step-h">
        <Steps steps={steps} label="Setup" />
        <h1 id="step-h">{['Which repository should agents work in?', 'Which agent should start?', `What may ${agent} do without asking?`, 'Ready to start'][step]}</h1>
        {step === 0 && <Choicebox legend="Repository" options={repos} value={repo} onValueChange={setRepo} />}
        {step === 1 && <Choicebox legend="Agent" options={agents} value={agent} onValueChange={setAgent} />}
        {step === 2 && (
          <>
            <Choicebox type="checkbox" legend="Allowed without asking. Anything unticked, it asks you first." options={permissions} value={allowed} onValueChange={setAllowed} />
            <Slider label="Token budget per run" min={10_000} max={200_000} step={10_000} value={budget} onValueChange={setBudget} formatValue={(v) => `${v / 1000}K tokens`} />
          </>
        )}
        {step === 3 && (
          <Description
            items={[
              { term: 'Repository', details: repo },
              { term: 'Agent', details: agent },
              { term: 'Allowed without asking', details: allowed.length ? allowed.map((v) => names[v]).join(', ') : 'Nothing: it asks every time' },
              { term: 'Budget per run', details: `${budget[0]! / 1000}K tokens` },
            ]}
          />
        )}
        <div className="ex-wizard__actions">
          {step > 0 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
          <span className="ex-space" />
          {step < 3 ? (
            <Button variant="primary" onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={() => (window.location.href = '../operations/#run/r41')}>
              Start the first run
            </Button>
          )}
        </div>
      </Card>
      <p className="ex-muted ex-small">
        You can change all of this later. <a href="#sign-in">Back to sign in</a>
      </p>
    </main>
  );
}

function App() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    document.title = `${route === 'setup' ? 'Set up Acme' : 'Sign in'} · Creance examples`;
  }, [route]);
  return (
    <>
      <aside className="ex-theme" aria-label="Theme">
        <ThemeSwitcher />
      </aside>
      {route === 'setup' ? <Setup /> : <SignIn />}
      <Toaster />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
