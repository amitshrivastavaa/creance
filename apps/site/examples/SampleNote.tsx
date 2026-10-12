// The line on every example that says it is a sample, and where its code is.
const repo = 'https://github.com/amitshrivastavaa/creance/blob/main/apps/site/examples/';

export function SampleNote({ company = 'Acme', source, sourceLabel = 'View the source' }: { company?: string; source: string; sourceLabel?: string }) {
  return (
    <aside className="ex-note" aria-label="About this sample">
      A sample app built only from <code>@creance-ui/react</code>. {company} and its data are made up; nothing is connected.{' '}
      <a href={repo + source}>{sourceLabel}</a> · <a href="../">All examples</a>
    </aside>
  );
}
