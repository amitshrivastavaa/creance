// The frame every screen shares: sidebar, header and the state screens pass between them.
import { useState, type ReactNode } from 'react';
import {
  AppShell,
  Avatar,
  Breadcrumbs,
  Button,
  CommandMenu,
  Entity,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  ProgressBar,
  Sidebar,
  StatusDot,
  ThemeSwitcher,
  type ApprovalDecision,
  type InboxItem,
} from '@creance-ui/react';
import { agents } from './data';

/** What a screen can read and change. */
export interface App {
  go: (route: string) => void;
  inbox: InboxItem[];
  /** Takes a request out of the inbox once it has been answered. */
  resolve: (id: string) => void;
  /** The decision on Deploy Fixer's install, shared by the inbox and the run. */
  deployDecision: ApprovalDecision | undefined;
  decideDeploy: (d: ApprovalDecision) => void;
}

// ── Icons. The kit does not ship an icon set; these are a few strokes each. ────────────────────
const glyph = (...d: string[]) => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
);
export const icons = {
  home: glyph('M2.5 7.2L8 2.8l5.5 4.4V13a.6.6 0 0 1-.6.6H3.1a.6.6 0 0 1-.6-.6z'),
  inbox: glyph('M2.5 9.2l1.8-5.4h7.4l1.8 5.4v3.3a.6.6 0 0 1-.6.6H3.1a.6.6 0 0 1-.6-.6z', 'M2.5 9.2h3.2l.8 1.6h3l.8-1.6h3.2'),
  runs: glyph('M3 4h10M3 8h10M3 12h6'),
  agents: glyph('M8 8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z', 'M3 13.4c.6-2.4 2.6-3.6 5-3.6s4.4 1.2 5 3.6'),
  shield: glyph('M8 2.2l4.8 1.7v3.6c0 3-2 5.2-4.8 6.3-2.8-1.1-4.8-3.3-4.8-6.3V3.9z'),
  gauge: glyph('M2.8 11.5a5.6 5.6 0 1 1 10.4 0', 'M8 9.6l2.6-3.2'),
  plug: glyph('M6 2.5v3M10 2.5v3', 'M4.5 5.5h7V8a3.5 3.5 0 0 1-7 0z', 'M8 11.5v2'),
  log: glyph('M4.8 2.5h6.4a1.8 1.8 0 0 1 1.8 1.8v7.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 11.7V4.3a1.8 1.8 0 0 1 1.8-1.8z', 'M5.5 5.5h5M5.5 8h5M5.5 10.5h3'),
  gear: glyph('M8 10.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z', 'M8 1.8v1.7M8 12.5v1.7M1.8 8h1.7M12.5 8h1.7M3.6 3.6l1.2 1.2M11.2 11.2l1.2 1.2M3.6 12.4l1.2-1.2M11.2 4.8l1.2-1.2'),
  plus: glyph('M8 3v10M3 8h10'),
  play: glyph('M5 3.5l7 4.5-7 4.5z'),
  search: glyph('M7 11.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4z', 'M10.2 10.2l3.3 3.3'),
  chevron: glyph('M4 6l4 4 4-4'),
};

export interface Screen {
  route: string;
  title: string;
  icon: ReactNode;
  /** Where its source lives, for the "View source" link. */
  file: string;
}
export const screens: Screen[] = [
  { route: 'overview', title: 'Overview', icon: icons.home, file: 'Overview.tsx' },
  { route: 'inbox', title: 'Inbox', icon: icons.inbox, file: 'Inbox.tsx' },
  { route: 'runs', title: 'Runs', icon: icons.runs, file: 'Runs.tsx' },
  { route: 'agents', title: 'Agents', icon: icons.agents, file: 'Agents.tsx' },
  { route: 'permissions', title: 'Permissions', icon: icons.shield, file: 'Permissions.tsx' },
  { route: 'budgets', title: 'Budgets', icon: icons.gauge, file: 'Budgets.tsx' },
  { route: 'integrations', title: 'Integrations', icon: icons.plug, file: 'Integrations.tsx' },
  { route: 'audit-log', title: 'Audit log', icon: icons.log, file: 'AuditLog.tsx' },
  { route: 'settings', title: 'Settings', icon: icons.gear, file: 'Settings.tsx' },
];
const source = 'https://github.com/amitshrivastavaa/creance/blob/main/apps/site/examples/screens/';

function Workspace() {
  return (
    <Menu>
      <MenuTrigger asChild>
        <button type="button" className="ex-workspace" aria-label="Switch workspace, Acme">
          <Avatar name="Acme" decorative />
          <span className="ex-workspace__text">
            <strong>Acme</strong>
            <span>Team plan</span>
          </span>
          {icons.chevron}
        </button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem description="Team plan">Acme</MenuItem>
        <MenuItem description="Sample workspace, not connected" disabled>
          Personal
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

function SidebarFooter({ go }: { go: App['go'] }) {
  return (
    <div className="ex-side-foot">
      <h2 className="ex-side-foot__title">
        Agents
        <a href="#agents">All {agents.length}</a>
      </h2>
      <ul className="ex-side-agents">
        {agents.slice(0, 4).map((a) => (
          <li key={a.id}>
            <a href="#agents">
              <StatusDot status={a.status}>{a.name}</StatusDot>
              <span className="ex-side-agents__state" data-failed={a.status === 'failed' || undefined}>
                {a.state}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <button type="button" className="ex-usage" onClick={() => go('budgets')}>
        <span className="ex-usage__row">
          <strong>Tokens this month</strong>
          <span>40%</span>
        </span>
        <ProgressBar label="Tokens this month" value={40} />
        <span className="ex-usage__note">1.2M of 3M · resets 1 Nov</span>
      </button>
      <Entity name="Amit Shrivastava" kind="human" description="Owner" />
    </div>
  );
}

export function Shell({ app, route, crumbs, aside, children }: { app: App; route: string; crumbs: { label: string; href?: string }[]; aside?: ReactNode; children: ReactNode }) {
  const [search, setSearch] = useState(false);
  const screen = screens.find((s) => s.route === route) ?? screens[0]!;
  const count = app.inbox.length;
  const sidebar = (
    <Sidebar
      variant="flush"
      label="Workspace"
      header={<Workspace />}
      footer={<SidebarFooter go={app.go} />}
      groups={[
        { items: screens.slice(0, 4).map((s) => ({ label: s.title, href: `#${s.route}`, icon: s.icon, current: s.route === route, count: s.route === 'inbox' ? count : undefined })) },
        { title: 'Manage', items: screens.slice(4).map((s) => ({ label: s.title, href: `#${s.route}`, icon: s.icon, current: s.route === route })) },
      ]}
    />
  );
  const header = (
    <div className="ex-header">
      <Breadcrumbs items={[{ label: 'Acme', href: '#overview' }, ...crumbs]} />
      <span className="ex-header__space" />
      <button type="button" className="ex-search" aria-label="Search" onClick={() => setSearch(true)}>
        {icons.search}
        <span>Search</span>
        <Kbd>⌘K</Kbd>
      </button>
      <ThemeSwitcher className="ex-theme" />
      <Button size="sm" onClick={() => app.go('inbox')}>
        Needs you <span className="ex-count">{count}</span>
      </Button>
      <CommandMenu
        open={search}
        onOpenChange={setSearch}
        label="Search"
        placeholder="Go to a screen, a run or an agent"
        commands={[
          ...screens.map((s) => ({ id: s.route, group: 'Screens', label: s.title, icon: s.icon, onSelect: () => app.go(s.route) })),
          { id: 'run', group: 'Runs', label: 'Fix the failing deploy', meta: 'Deploy Fixer', onSelect: () => app.go('run/r41') },
          ...agents.map((a) => ({ id: a.id, group: 'Agents', label: a.name, meta: a.state, onSelect: () => app.go('agents') })),
        ]}
      />
    </div>
  );
  return (
    <AppShell sidebar={sidebar} header={header} aside={aside} asideLabel="Details">
      <aside className="ex-note" aria-label="About this sample">
        A sample app built only from <code>@creance-ui/react</code>. Acme and its data are made up; nothing is connected.{' '}
        <a href={source + screen.file}>View this screen&rsquo;s source</a> · <a href="../">Back to the docs</a>
      </aside>
      {children}
    </AppShell>
  );
}

/** The title row at the top of a screen. */
export function PageHead({ title, sub, actions }: { title: string; sub: ReactNode; actions?: ReactNode }) {
  return (
    <div className="ex-head">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {actions && <div className="ex-head__actions">{actions}</div>}
    </div>
  );
}
