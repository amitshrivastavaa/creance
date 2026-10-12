// Inbox: everything the agents are waiting on, and the request you picked, ready to answer.
import { ApprovalPrompt, Card, DiffReview, EmptyState, NeedsYouInbox, QuestionCard, Snippet, toast, type InboxItem } from '@creance-ui/react';
import { deployRunId, routerHunks } from '../data';
import { PageHead, Shell, icons, type App } from '../shell';

export function Inbox({ app, selected }: { app: App; selected?: string }) {
  const item = app.inbox.find((i) => i.id === selected) ?? app.inbox[0];
  // Answering takes the request out of the inbox and moves on to the next one.
  const done = (title: string) => {
    toast({ title, tone: 'success' });
    app.go('inbox');
  };

  return (
    <Shell app={app} route="inbox" crumbs={[{ label: 'Inbox' }]}>
      <PageHead title="Inbox" sub={app.inbox.length ? `${app.inbox.length} requests from your agents. The most urgent are first.` : 'Nothing is waiting for you.'} />
      {item ? (
        <div className="ex-grid ex-grid--inbox">
          <Card as="section" className="ex-card">
            <NeedsYouInbox items={app.inbox} onOpen={(i) => app.go(`inbox/${i.id}`)} title="Waiting" headingLevel={2} />
          </Card>
          <div className="ex-stack" key={item.id}>
            <Request item={item} app={app} done={done} />
          </div>
        </div>
      ) : (
        <Card className="ex-card">
          <EmptyState icon={icons.inbox} title="You are all caught up" description="When an agent needs a decision, it appears here." headingLevel={2} />
        </Card>
      )}
    </Shell>
  );
}

function Request({ item, app, done }: { item: InboxItem; app: App; done: (title: string) => void }) {
  const finish = () => {
    app.resolve(item.id);
  };
  switch (item.id) {
    case 'a1':
      return (
        <>
          <ApprovalPrompt
            agentName="Deploy Fixer"
            action="npm install zod@3"
            target="web/package.json"
            risk="medium"
            reason="server/validate.ts imports zod, but it is missing from dependencies, so the production build fails. Installing adds one runtime package and changes the lockfile."
            headingLevel={2}
            autoFocus={false}
            onAllow={(scope) => {
              app.decideDeploy(scope === 'once' ? 'allow-once' : 'always-allow');
              done('Allowed. Deploy Fixer is installing zod.');
            }}
            onDeny={() => {
              app.decideDeploy('deny');
              done('Denied. Deploy Fixer will stop and explain.');
            }}
          />
          <Card as="section" className="ex-card" aria-labelledby="cmd-h">
            <h3 id="cmd-h">What it will run</h3>
            <Snippet commands={['cd web', 'npm install zod@3']} />
            <p className="ex-muted ex-small">
              Changes <code>web/package.json</code> and <code>pnpm-lock.yaml</code>. Part of <a href={`#run/${deployRunId}`}>Fix the failing deploy</a>, step 3 of 5.
            </p>
          </Card>
        </>
      );
    case 'r1':
      return (
        <DiffReview
          file="src/router.tsx"
          hunks={routerHunks}
          headingLevel={2}
          description="Upgrader moved the router to react-router 6: Switch becomes Routes, and routes take an element."
          onApply={({ accepted }) => {
            finish();
            done(`Applied ${accepted.length} of ${routerHunks.length} changes to router.tsx.`);
          }}
        />
      );
    case 'q1':
      return (
        <QuestionCard
          agentName="Data Loader"
          question="Which region should I seed first?"
          headingLevel={2}
          options={[
            { value: 'staging-eu', label: 'staging-eu', description: 'Smaller, about 4 minutes.' },
            { value: 'staging-us', label: 'staging-us', description: 'Most testers use it, about 11 minutes.' },
          ]}
          timeoutNote="If nobody answers within an hour, it seeds staging-eu."
          onAnswer={(answer) => {
            finish();
            done(`Answered: ${answer}. Data Loader is seeding.`);
          }}
        />
      );
    case 'a2':
      return (
        <ApprovalPrompt
          agentName="Docs Writer"
          action="Publish docs/onboarding.md"
          target="the team wiki"
          risk="low"
          reason="The onboarding guide is written and reviewed. Publishing replaces the current wiki page; the old version stays in its history."
          headingLevel={2}
          autoFocus={false}
          onAllow={() => {
            finish();
            done('Allowed. Docs Writer is publishing.');
          }}
          onDeny={() => {
            finish();
            done('Denied. The guide stays a draft.');
          }}
        />
      );
    default:
      return (
        <QuestionCard
          agentName={item.agentName}
          question={item.title}
          headingLevel={2}
          options={[
            { value: 'yes', label: 'Yes, keep 30 seconds' },
            { value: 'no', label: 'No, raise it to 60 seconds' },
          ]}
          onAnswer={(answer) => {
            finish();
            done(`Answered: ${answer}.`);
          }}
        />
      );
  }
}
