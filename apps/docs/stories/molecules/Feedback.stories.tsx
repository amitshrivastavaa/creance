import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ApprovalPrompt,
  Banner,
  BrowserFrame,
  Button,
  ErrorCard,
  ErrorMessage,
  Field,
  Input,
  PhoneFrame,
  ProjectBanner,
  Skeleton,
  Video,
} from 'creance';

const meta = {
  title: 'Molecules/Feedback and media',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Banners: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 760 }}>
      <Banner onDismiss={() => {}}>Scheduled maintenance on Sunday, 02:00–03:00 UTC. Running agents pause and resume after.</Banner>
      <Banner tone="ink" action={<a href="#inbox">Open inbox</a>} onDismiss={() => {}}>
        3 agents are waiting for you.
      </Banner>
      <Banner tone="danger" action={<a href="#status">Status page</a>}>
        The model provider is returning errors. New runs are paused until it recovers.
      </Banner>
      <ProjectBanner
        name="web"
        message="This project's token budget is 92% used for October."
        progress={{ value: 92, max: 100, label: 'web token budget, 92% used' }}
        action={<Button>Raise budget</Button>}
      />
    </div>
  ),
};

export const Errors: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
        <Field label="Branch" error="Branch names can't contain spaces. Try fix-deploy.">
          <Input defaultValue="fix deploy" />
        </Field>
        <ErrorMessage>Couldn&apos;t save the plan. Check your connection and try again.</ErrorMessage>
      </div>
      <ErrorCard
        title="Run 40 failed at step 3"
        description={
          <>
            <code>run_tests</code> failed 3 times: 14 tests broke after the react-router upgrade.
          </>
        }
        details="TypeError: useHistory is not a function"
        actions={
          <>
            <Button variant="primary">Retry from step 3</Button>
            <Button>View logs</Button>
          </>
        }
      />
    </div>
  ),
};

export const Frames: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <BrowserFrame url="preview-run-41.example.dev" caption="The preview deploy Deploy Fixer opened" className="story-browser">
        <div style={{ display: 'grid', gap: 12, padding: 24, width: 480 }} aria-hidden="true">
          <Skeleton width="40%" height={20} />
          <Skeleton width="70%" />
          <Skeleton width="60%" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <Skeleton shape="block" height={96} />
            <Skeleton shape="block" height={96} />
            <Skeleton shape="block" height={96} />
          </div>
        </div>
      </BrowserFrame>
      <PhoneFrame caption="An approval at phone size" width={260}>
        <ApprovalPrompt
          agentName="Deploy Fixer"
          action="npm install zod@3"
          target="web/package.json"
          risk="medium"
          reason="A runtime dependency is missing."
          headingLevel={2}
          onAllow={() => {}}
          onDeny={() => {}}
          autoFocus={false}
        />
      </PhoneFrame>
    </div>
  ),
};

const poster =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4150"/><stop offset="1" stop-color="#20242c"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/></svg>');
const vtt = 'data:text/vtt,' + encodeURIComponent('WEBVTT\n\n00:00.000 --> 00:10.000\nInstalling the missing dependency\n');

export const VideoPlayer: Story = {
  name: 'Video',
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <Video label="Run 41 recording" poster={poster} src="data:video/mp4;base64," captions={{ src: vtt }} caption="A recording of run 41. No media is loaded in this story." />
    </div>
  ),
};
