import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, Badge, Button, IconButton, LiquidGlass } from 'creance';

const Close = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

/** Vivid content for the glass to refract: Liquid Glass is only as beautiful as what is behind it. */
function Scene({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg-scene">
      <p className="lg-scene__copy" aria-hidden="true">
        Deploy Fixer is running. Deploy Fixer is running. Deploy Fixer is running.
      </p>
      <div className="lg-scene__grid" aria-hidden="true" />
      <div className="lg-scene__content">{children}</div>
    </div>
  );
}

const meta = {
  title: 'Foundations/Liquid Glass',
  component: LiquidGlass,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LiquidGlass>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Controls and a floating bar over vivid content. In Chromium the edges refract; elsewhere they frost. */
export const Showcase: Story = {
  render: () => (
    <Scene>
      <LiquidGlass className="lg-bar">
        <Avatar name="Deploy Fixer" decorative />
        <strong>Deploy Fixer</strong>
        <Badge status="running" />
        <span className="lg-bar__spacer" />
        <Button size="sm">Pause</Button>
        <IconButton label="Close" icon={<Close />} variant="secondary" size="sm" tooltip={false} />
      </LiquidGlass>
      <div className="lg-row">
        <Button variant="primary">Allow once</Button>
        <Button>Always allow</Button>
        <Button variant="danger">Deny</Button>
      </div>
      <div className="lg-row">
        <LiquidGlass className="lg-tile">Regular</LiquidGlass>
        <LiquidGlass className="lg-tile" variant="clear">Clear</LiquidGlass>
      </div>
    </Scene>
  ),
};
