// A sample agent operations app, built only from Creance components. Each screen is one file in screens/.
import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';
import './app.css';
import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, type ApprovalDecision } from '@creance-ui/react';
import { inbox as initialInbox } from './data';
import { screens, type App } from './shell';
import { Overview } from './screens/Overview';
import { Inbox } from './screens/Inbox';
import { Runs } from './screens/Runs';
import { RunChat } from './screens/RunChat';
import { Agents } from './screens/Agents';
import { Permissions } from './screens/Permissions';
import { Budgets } from './screens/Budgets';
import { Integrations } from './screens/Integrations';
import { AuditLog } from './screens/AuditLog';
import { Settings } from './screens/Settings';

const read = () => window.location.hash.slice(1) || 'overview';

function Root() {
  const [hash, setHash] = useState(read);
  const [inbox, setInbox] = useState(initialInbox);
  const [deployDecision, setDeployDecision] = useState<ApprovalDecision>();

  useEffect(() => {
    const onHash = () => setHash(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  // A new screen starts at the top, and its title names the tab.
  useEffect(() => {
    document.querySelector('.cr-app-shell main')?.scrollTo(0, 0);
    const title = hash.startsWith('run/') ? 'Fix the failing deploy' : (screens.find((s) => s.route === hash.split('/')[0])?.title ?? 'Overview');
    document.title = `${title} · Acme · Creance examples`;
  }, [hash]);

  const go = useCallback((route: string) => {
    window.location.hash = route;
  }, []);
  const resolve = useCallback((id: string) => setInbox((items) => items.filter((i) => i.id !== id)), []);
  const decideDeploy = useCallback(
    (d: ApprovalDecision) => {
      setDeployDecision(d);
      resolve('a1');
    },
    [resolve],
  );

  const app: App = { go, inbox, resolve, deployDecision, decideDeploy };
  const [route, param] = hash.split('/');
  const screen = (() => {
    switch (route) {
      case 'inbox': return <Inbox app={app} selected={param} />;
      case 'runs': return <Runs app={app} />;
      case 'run': return <RunChat app={app} runId={param} />;
      case 'agents': return <Agents app={app} />;
      case 'permissions': return <Permissions app={app} />;
      case 'budgets': return <Budgets app={app} />;
      case 'integrations': return <Integrations app={app} />;
      case 'audit-log': return <AuditLog app={app} />;
      case 'settings': return <Settings app={app} />;
      default: return <Overview app={app} />;
    }
  })();
  return (
    <>
      {screen}
      <Toaster />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
