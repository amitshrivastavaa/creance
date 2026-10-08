import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Avatar,
  Calendar,
  Choicebox,
  ClearableInput,
  Combobox,
  CopyButton,
  Feedback,
  Field,
  LoadMoreButton,
  MenuItem,
  MultiSelect,
  SearchInput,
  ShowMore,
  Slider,
  SplitButton,
  TextWithCopy,
  ThemeSwitcher,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from 'creance';

const meta = {
  title: 'Molecules/Inputs',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const agents = [
  { value: 'df', label: 'Deploy Fixer', leading: <Avatar name="Deploy Fixer" kind="agent" size="sm" decorative />, meta: 'idle' },
  { value: 'dl', label: 'Data Loader', leading: <Avatar name="Data Loader" kind="agent" size="sm" decorative />, meta: 'running' },
  { value: 'dw', label: 'Docs Writer', leading: <Avatar name="Docs Writer" kind="agent" size="sm" decorative />, meta: 'idle' },
  { value: 'rb', label: 'Release Bot', leading: <Avatar name="Release Bot" kind="agent" size="sm" decorative />, disabled: true, meta: 'paused' },
];

const tools = ['read_file', 'run_tests', 'shell', 'write_file', 'open_pull_request'].map((t) => ({ value: t, label: t }));

const col = { display: 'grid', gap: 20, maxWidth: 420 } as const;

export const TextInputs: Story = {
  render: () => (
    <div style={col}>
      <Field label="Branch">
        <ClearableInput defaultValue="fix/deploy-zod" clearLabel="Clear branch" />
      </Field>
      <SearchInput aria-label="Search runs" placeholder="Search runs, agents, files" shortcut="⌘K" />
      <SearchInput aria-label="Search runs, loading" defaultValue="deploy" loading />
    </div>
  ),
};

export const ComboboxStory: Story = {
  name: 'Combobox',
  render: () => (
    <div style={{ ...col, minHeight: 320 }}>
      <Field label="Assign to agent" hint="Type to filter. Arrow keys move, Enter picks.">
        <Combobox options={agents} placeholder="Choose an agent" onCreate={() => {}} createLabel={(q) => `Create agent “${q}”`} />
      </Field>
    </div>
  ),
};

export const MultiSelectStory: Story = {
  name: 'Multi select',
  render: () => (
    <div style={{ ...col, minHeight: 320 }}>
      <Field label="Allowed tools">
        <MultiSelect options={tools} defaultValue={['read_file', 'run_tests']} placeholder="Add a tool" />
      </Field>
    </div>
  ),
};

export const ChoiceboxStory: Story = {
  name: 'Choicebox',
  render: () => (
    <Choicebox
      legend="How much can Deploy Fixer do on its own?"
      defaultValue="risky"
      options={[
        { value: 'all', title: 'Ask for everything', description: 'Every tool call waits for you.' },
        { value: 'risky', title: 'Ask for risky actions', description: 'Reads run freely; writes and commands ask first.' },
        { value: 'none', title: 'Run on its own', description: 'Only high-risk actions ask.' },
      ]}
    />
  ),
};

export const Sliders: Story = {
  render: () => (
    <div style={col}>
      <Slider label="Token budget" defaultValue={[50_000]} min={10_000} max={200_000} step={5_000} formatValue={(v) => `${v / 1000}K`} />
      <Slider
        label="Retry delay"
        defaultValue={[2, 30]}
        min={1}
        max={60}
        formatValue={(v) => `${v}s`}
        thumbLabels={['Minimum retry delay', 'Maximum retry delay']}
      />
      <Slider
        label="Speed"
        defaultValue={[4]}
        min={1}
        max={8}
        step={1}
        formatValue={(v) => `${v}×`}
        marks={[1, 2, 4, 8].map((v) => ({ value: v, label: `${v}×` }))}
      />
    </div>
  ),
};

export const Toggles: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Toggle defaultPressed>Wrap lines</Toggle>
        <Toggle>Show whitespace</Toggle>
      </div>
      <ToggleGroup type="single" defaultValue="unified" aria-label="Diff view">
        <ToggleGroupItem value="unified">Unified</ToggleGroupItem>
        <ToggleGroupItem value="split">Split</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" defaultValue={['bold']} aria-label="Text style">
        <ToggleGroupItem value="bold" aria-label="Bold">
          <strong>B</strong>
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <em>I</em>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const CalendarSingle: Story = {
  render: () => <Calendar today={new Date(2026, 9, 8)} defaultValue={new Date(2026, 9, 8)} locale="en-GB" />,
};

export const CalendarRange: Story = {
  render: () => (
    <Calendar
      mode="range"
      today={new Date(2026, 9, 8)}
      defaultValue={{ start: new Date(2026, 9, 6), end: new Date(2026, 9, 10) }}
      locale="en-GB"
      isDateDisabled={(d) => d.getDay() === 0}
    />
  ),
};

export const Actions: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start', minHeight: 300 }}>
      <SplitButton menuLabel="More ways to hand off" menu={<><MenuItem description="For review before merging">Open pull request</MenuItem><MenuItem description="Not ready for review yet">Open draft pull request</MenuItem><MenuItem description="Nothing is pushed">Keep changes local</MenuItem></>}>
        Open pull request
      </SplitButton>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <CopyButton value="run_8f3a91c4b2e7d0a6c21d" label="Copy run ID" />
        <TextWithCopy value="run_8f3a91c4b2e7d0a6c21d" label="Copy run ID">
          run_8f3a…c21d
        </TextWithCopy>
      </div>
      <div style={{ width: 420 }}>
        <TextWithCopy variant="block" value="npm install creance creance-tokens" label="Copy install command" />
      </div>
    </div>
  ),
};

export const LoadAndShowMore: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(false);
    return (
      <div style={col}>
        <LoadMoreButton loading={loading} onClick={() => setLoading(true)}>
          Load 20 more runs
        </LoadMoreButton>
        <ShowMore moreLabel="Show 209 more lines">
          <pre style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6 }}>
            {['Error: Cannot find module \'zod\'', '    at server/validate.ts:3', '    at Module._compile', '    at Object.require', '    at Module.load', '    at Function.Module._load', '    at main.ts:12'].join('\n')}
          </pre>
        </ShowMore>
      </div>
    );
  },
};

export const FeedbackAndTheme: Story = {
  render: () => (
    <div style={col}>
      <Feedback question="Was this run useful?" onSubmit={() => {}} />
      <ThemeSwitcher apply={false} />
    </div>
  ),
};
