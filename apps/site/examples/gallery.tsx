// The Examples page: every sample app, with a screenshot, what it shows, and where its code is.
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';
import './gallery.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Footer, Navbar, ThemeSwitcher } from '@creance-ui/react';

const repo = 'https://github.com/amitshrivastavaa/creance/tree/main/apps/';

const examples = [
  { id: 'operations', title: 'Agent operations', href: 'operations/', source: `${repo}site/examples/operations`, screens: '10 screens', about: 'A whole product: overview, inbox, runs, agents, permissions, budgets, integrations, audit log and settings.' },
  { id: 'assistant', title: 'Assistant chat', href: 'assistant/', source: `${repo}site/examples/assistant`, screens: '2 screens', about: 'A chat app with history, a model picker, reasoning, sources, attachments and streaming replies.' },
  { id: 'review', title: 'Code review', href: 'review/', source: `${repo}site/examples/review`, screens: '1 screen', about: 'An agent’s pull request: changed files, the diff change by change, the run behind it and checkpoints.' },
  { id: 'sign-in', title: 'Sign in and onboarding', href: 'sign-in/', source: `${repo}site/examples/sign-in`, screens: '2 screens', about: 'Sign in, then four steps to connect a repository, choose an agent and set what it may do.' },
  { id: 'demo', title: 'A supervised run', href: '../demo/', source: `${repo}demo`, screens: '1 screen', about: 'The live demo: watch an agent work, approve its install, review its diff and take back control.' },
  { id: 'mobile', title: 'Mobile approvals', href: 'mobile/', source: `${repo}site/examples/mobile`, screens: '3 screens', about: 'Approve, answer and stop agents from a phone.' },
];

function Gallery() {
  return (
    <>
      <div className="ex-wrap">
        <Navbar
          brand={<a href="../" className="ex-brand">Creance</a>}
          items={[
            { label: 'Overview', href: '../' },
            { label: 'Components', href: '../#components' },
            { label: 'Examples', href: './', current: true },
          ]}
          actions={<ThemeSwitcher />}
        />
        <main>
          <header className="ex-intro">
            <h1>Examples</h1>
            <p>Sample apps built only from Creance components. Open one to use it; each links to its source. The companies and data in them are made up, and nothing is connected.</p>
          </header>
          <ul className="ex-grid">
            {examples.map((e) => (
              <li key={e.id}>
                <Card as="article" className="ex-tile" aria-labelledby={`${e.id}-h`}>
                  <a href={e.href} className="ex-tile__shot" tabIndex={-1} aria-hidden="true">
                    <img className="ex-shot--light" src={`thumbs/${e.id}-light.jpg`} alt="" width="720" height="450" loading="lazy" />
                    <img className="ex-shot--dark" src={`thumbs/${e.id}-dark.jpg`} alt="" width="720" height="450" loading="lazy" />
                  </a>
                  <div className="ex-tile__text">
                    <h2 id={`${e.id}-h`}>
                      <a href={e.href}>{e.title}</a>
                      <span className="ex-pill">{e.screens}</span>
                    </h2>
                    <p>{e.about}</p>
                    <a className="ex-tile__source" href={e.source}>
                      Source<span className="ex-sr"> of {e.title}</span>
                    </a>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </main>
      </div>
      <Footer legal="© 2026 Amit Shrivastava. MIT licence." links={[{ label: 'Docs', href: '../' }, { label: 'GitHub', href: 'https://github.com/amitshrivastavaa/creance' }, { label: 'npm', href: 'https://www.npmjs.com/package/@creance-ui/react' }]} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
