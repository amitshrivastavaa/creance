import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart, BarList, Card, DonutChart, LineChart, Sparkline, StatCard } from '@creance-ui/react';

const meta = {
  title: 'Molecules/Charts',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const tokens = [42, 55, 48, 61, 73, 39, 28, 64, 82, 77, 91, 68, 45, 96];
const previous = [38, 44, 51, 47, 58, 35, 30, 52, 60, 66, 70, 62, 41, 74];
const days = ['28 Sep', '29 Sep', '30 Sep', '1 Oct', '2 Oct', '3 Oct', '4 Oct', '5 Oct', '6 Oct', '7 Oct', '8 Oct', '9 Oct', '10 Oct', '11 Oct'];
const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const outcomes = [
  { label: 'Completed', value: 64 },
  { label: 'Waiting for you', value: 5 },
  { label: 'Stopped by you', value: 9 },
  { label: 'Failed', value: 7, tone: 'danger' as const },
];
const agents = [
  { label: 'Deploy Fixer', value: 84 },
  { label: 'Docs Writer', value: 46 },
  { label: 'Data Loader', value: 31 },
  { label: 'Upgrader', value: 23 },
];

const stats = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
    <StatCard label="Runs today" value="20" trend={{ direction: 'up', label: '4' }} note="vs yesterday" chart={<Sparkline variant="bars" width={84} height={34} label="Runs per day, last 7 days" values={[12, 18, 9, 22, 16, 5, 20]} />} />
    <StatCard label="Waiting for you" value="5" trend={{ direction: 'flat', label: 'No change' }} note="oldest 14 min" />
    <StatCard label="Tokens today" value="184K" trend={{ direction: 'up', label: '12%' }} note="vs last week" chart={<Sparkline variant="area" width={96} height={34} label="Tokens per day, last 14 days" values={tokens} />} />
    <StatCard label="Failed runs" value="3" trend={{ direction: 'up', label: '2', tone: 'bad' }} note="vs yesterday" />
  </div>
);

export const StatCards: Story = { render: () => stats };

export const Sparklines: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 40 }}>
      <Sparkline variant="area" width={160} height={40} label="Tokens per day, with fill" values={tokens} />
      <Sparkline width={160} height={40} label="Tokens per day" values={tokens} />
      <Sparkline variant="bars" width={160} height={40} label="Runs per day" values={[12, 18, 9, 22, 16, 5, 20, 14, 19, 23]} />
    </div>
  ),
};

const line = (
  <LineChart
    label="Tokens per day"
    unit="K"
    labels={days}
    series={[
      { name: 'This period', values: tokens },
      { name: 'Previous period', values: previous, style: 'dashed' },
    ]}
  />
);

export const Line: Story = { render: () => <div style={{ maxWidth: 640 }}>{line}</div> };

export const Bars: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32, maxWidth: 620 }}>
      <BarChart label="Runs per day" labels={week} highlight={3} series={[{ name: 'Runs', values: [12, 18, 9, 22, 16, 5, 8] }]} />
      <BarChart
        label="Runs per day, by outcome"
        labels={week}
        height={170}
        series={[
          { name: 'Completed', values: [11, 16, 9, 19, 15, 5, 7] },
          { name: 'Failed', values: [1, 2, 0, 3, 1, 0, 1], tone: 'danger' },
        ]}
      />
    </div>
  ),
};

export const Donut: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <DonutChart label="Run outcomes" centerLabel="runs" data={outcomes} />
    </div>
  ),
};

export const BarListStory: Story = {
  name: 'BarList',
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <BarList label="Tokens by agent" unit="K" items={agents} />
    </div>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 14 }}>
      {stats}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 14 }}>
        <Card>
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Tokens per day</h2>
          {line}
        </Card>
        <Card>
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Run outcomes</h2>
          <DonutChart label="Run outcomes" centerLabel="runs" data={outcomes} />
        </Card>
      </div>
    </div>
  ),
};
