// Writes the docs as plain markdown for coding agents and LLMs, after `vite build`: dist/llms.txt (an
// index, following llmstxt.org), dist/docs/<Name>.md (one file per guide and component) and
// dist/llms-full.txt (all of it in one file). Run from apps/site.
import { runnerImport } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Also written in index.html, public/robots.txt and public/sitemap.xml.
const SITE = 'https://creance.pages.dev/';
const src = path.resolve(import.meta.dirname, '../src');
const dist = path.resolve(import.meta.dirname, '../dist');

// The data modules are TypeScript and JSX, so Vite loads them, the same way the site does.
const load = async (file) => (await runnerImport(path.join(src, file), { configFile: false, logLevel: 'error' })).module;
const [{ examples, groups }, { guides }, { keyboard }] = await Promise.all([load('examples.ts'), load('guides.tsx'), load('keyboard.ts')]);
const reference = JSON.parse(fs.readFileSync(path.join(src, 'props.json'), 'utf8'));

const url = (name) => `${SITE}docs/${name}.md`;
const fence = (code, lang = 'tsx') => `\`\`\`${lang}\n${code}\n\`\`\``;
// A pipe inside a table cell would end the cell.
const cell = (text) => text.replace(/\|/g, '\\|');
const table = (head, rows) => [head, head.map(() => '---'), ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n');
// The same import line the site shows above an example: every component the code names.
const importLine = (code) => `import { ${[...new Set([...code.matchAll(/<([A-Z]\w*)/g)].map((m) => m[1]))].sort().join(', ')} } from '@creance-ui/react';`;

// ── Components ────────────────────────────────────────────────────────────────────────────────
function propsTable(props) {
  return table(
    ['Prop', 'Type', 'Default', 'Description'],
    props.map((p) => [`\`${p.name}\`${p.required ? ' (required)' : ''}${p.deprecated ? ' (deprecated)' : ''}`, `\`${cell(p.type)}\``, p.default ? `\`${cell(p.default)}\`` : '–', cell(p.doc)]),
  );
}

function componentPage(e) {
  const out = [`# ${e.name}`, `> ${e.about}`, `${e.group} / ${e.level.toLowerCase()}. Live example: ${SITE}#${e.name}`, fence(importLine(e.code)), '## Example', fence(e.code)];
  for (const m of e.more ?? []) out.push(`### ${m.title}`, ...(m.about ? [m.about] : []), fence(m.code));

  const parts = reference[e.name] ?? [];
  if (parts.length) out.push('## Props');
  for (const part of parts) {
    out.push(`### \`${part.kind === 'component' ? `<${part.name}>` : part.kind === 'function' ? `${part.name}()` : part.name}\`${part.kind === 'type' ? ' (data type)' : ''}`);
    if (part.kind === 'union') out.push(`\`${part.type}\``);
    if (part.kind === 'function') out.push(`\`${part.name}${part.signature}\`${part.doc ? ` ${part.doc}` : ''}`);
    if (part.props?.length) out.push(propsTable(part.props));
    else if (part.kind === 'component') out.push('No props of its own.');
    if (part.html) out.push('Also accepts the standard HTML attributes of the element it renders, such as className and event handlers.');
  }

  const keys = keyboard[e.name];
  if (keys) out.push('## Keyboard', table(['Key', 'What it does'], keys.keys.map(([k, does]) => [cell(k), cell(does)])), ...(keys.note ? [keys.note] : []));
  return out.join('\n\n');
}

// ── Guides ────────────────────────────────────────────────────────────────────────────────────
// Guides are JSX. This walks the elements they return and writes the markdown for each tag; the
// site's own components are recognised by their props.
function guidePage(g) {
  const text = (node) => {
    if (node == null || typeof node === 'boolean') return '';
    if (typeof node !== 'object') return String(node);
    if (Array.isArray(node)) return node.map(text).join('');
    const { type, props } = node;
    const inner = () => text(props.children);
    switch (type) {
      case 'p':
        return `\n\n${inner()}\n\n`;
      case 'h2':
        return `\n\n## ${inner()}\n\n`;
      case 'ul':
      case 'ol':
        return `\n\n${[props.children].flat(Infinity).filter(Boolean).map((li) => `${type === 'ul' ? '-' : '1.'} ${text(li.props.children).trim()}`).join('\n')}\n\n`;
      case 'strong':
      case 'b':
        return `**${inner()}**`;
      case 'small':
        return `: ${inner()}`;
      case 'code':
        return `\`${inner()}\``;
      case 'table': {
        const rows = [];
        const collect = (n) => [n].flat(Infinity).forEach((c) => c?.type === 'tr' ? rows.push([c.props.children].flat(Infinity).filter(Boolean).map((td) => cell(text(td.props.children)))) : c?.props && collect(c.props.children));
        collect(props.children);
        return `\n\n${table(rows[0], rows.slice(1))}\n\n`;
      }
    }
    if (typeof type === 'string' || typeof type === 'symbol') return inner();
    // Code blocks, Snippet, Alert and StatusDot; anything else is an interactive part of the page.
    if (typeof props.code === 'string') return `\n\n${fence(props.code.replace(/^\n/, ''), /^\s*[:.]/.test(props.code) ? 'css' : 'tsx')}\n\n`;
    if (props.commands) return `\n\n${fence([props.commands].flat().join('\n'), 'sh')}\n\n`;
    if (props.title) return `\n\n> **${props.title}.** ${inner()}\n\n`;
    if (props.status) return `${props.status === 'done' ? '[x]' : '[ ]'} ${inner()}`;
    if (props.children) return inner();
    return `\n\nThis part is interactive on the site: ${SITE}#${g.name}\n\n`;
  };
  return [`# ${g.name}`, `> ${g.about}`, `${g.group}. On the site: ${SITE}#${g.name}`, text(g.body()).replace(/\n{3,}/g, '\n\n').trim()].join('\n\n');
}

// ── Index ─────────────────────────────────────────────────────────────────────────────────────
const link = (e) => `- [${e.name}](${url(e.name)}): ${e.about}`;
const index = [
  '# Creance',
  '> An open-source React component library: 109 components in light, dark and solid themes, with a set built for supervising AI agents: approving what an agent wants to do, watching it work, reviewing its changes and taking back control. Under the MIT licence.',
  `Every page below is markdown. ${SITE}llms-full.txt has all of them in one file.`,
  '## Install and use',
  fence('npm install @creance-ui/react @creance-ui/tokens', 'sh'),
  'Import the tokens and the component styles once, at the root of the app, tokens first. Then import components by name.',
  fence(`import '@creance-ui/tokens/tokens.css';\nimport '@creance-ui/react/styles.css';\nimport { Button } from '@creance-ui/react';`),
  'React 18 or later is the only peer dependency. The examples are written for the live editor on the site: `log` stands for any event handler, and names such as `state`, `set` and the sample data are provided by that editor.',
  ...[...new Set(guides.map((g) => g.group))].flatMap((group) => [`## ${group}`, guides.filter((g) => g.group === group).map(link).join('\n')]),
  ...groups.flatMap((group) => [`## Components: ${group}`, examples.filter((e) => e.group === group).map(link).join('\n')]),
].join('\n\n');

const pages = [...guides.map((g) => [g.name, guidePage(g)]), ...examples.map((e) => [e.name, componentPage(e)])];
fs.mkdirSync(path.join(dist, 'docs'), { recursive: true });
for (const [name, md] of pages) fs.writeFileSync(path.join(dist, 'docs', `${name}.md`), `${md}\n`);
fs.writeFileSync(path.join(dist, 'llms.txt'), `${index}\n`);
fs.writeFileSync(path.join(dist, 'llms-full.txt'), `${[index, ...pages.map(([, md]) => md)].join('\n\n---\n\n')}\n`);
console.log(`llms: ${pages.length} pages`);
