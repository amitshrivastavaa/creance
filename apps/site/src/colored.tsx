import type { ReactNode } from 'react';

// ── Code colouring ────────────────────────────────────────────────────────────────────────────
const TOKEN = /(\{\/\*[\s\S]*?\*\/\})|("[^"\n]*"|'[^'\n]*')|(<\/?)([A-Za-z][\w.]*)|([A-Za-z_][\w:-]*)(?==)|\b(true|false|null|undefined|log)\b|(-?\b\d[\d_.]*)|(=>|[{}()[\]<>/=,:])/g;
const KINDS = ['', 'comment', 'string', 'punct', 'tag', 'attr', 'keyword', 'number', 'punct'];

export function Colored({ code }: { code: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    if (m.index > last) out.push(code.slice(last, m.index));
    let at = m.index;
    for (let g = 1; g < m.length; g++) {
      if (m[g] === undefined) continue;
      out.push(
        <span key={`${at}-${g}`} data-k={KINDS[g]}>
          {m[g]}
        </span>,
      );
      at += m[g]!.length;
    }
    last = m.index + m[0].length;
  }
  out.push(code.slice(last));
  // The trailing newline keeps this layer as tall as the textarea above it.
  return <pre aria-hidden="true">{out}{'\n'}</pre>;
}
