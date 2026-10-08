#!/usr/bin/env node
// Renames the deprecated `onApprove` prop to `onAllow` on <ApprovalPrompt> elements.
// Usage: npx creance-codemod-on-allow <dir-or-file>... [--dry]
// Parses with the TypeScript compiler your project already has, so only real JSX attributes
// on ApprovalPrompt are touched: not strings, comments, or other components' onApprove props.
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

let ts;
try {
  ts = (await import('typescript')).default;
} catch {
  console.error('This codemod needs the "typescript" package. Install it, or run it from a project that has it.');
  process.exit(1);
}

const EXTENSIONS = new Set(['.tsx', '.jsx', '.ts', '.js']);

/** Returns the source with every `onApprove` attribute on ApprovalPrompt renamed, plus the count. */
export function transform(source, fileName = 'file.tsx') {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file);
      if (tag === 'ApprovalPrompt' || tag.endsWith('.ApprovalPrompt')) {
        for (const attr of node.attributes.properties) {
          if (ts.isJsxAttribute(attr) && attr.name.getText(file) === 'onApprove') {
            edits.push(attr.name.getStart(file));
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  let out = source;
  for (const start of edits.sort((a, b) => b - a)) {
    out = out.slice(0, start) + 'onAllow' + out.slice(start + 'onApprove'.length);
  }
  return { source: out, count: edits.length };
}

async function* files(path) {
  const info = await stat(path);
  if (info.isFile()) {
    if (EXTENSIONS.has(extname(path))) yield path;
    return;
  }
  for (const entry of await readdir(path)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    yield* files(join(path, entry));
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('on-approve-to-on-allow.mjs');
if (isMain) {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const targets = args.filter((a) => a !== '--dry');
  if (!targets.length) {
    console.error('Usage: npx creance-codemod-on-allow <dir-or-file>... [--dry]');
    process.exit(1);
  }
  let total = 0;
  for (const target of targets) {
    for await (const path of files(target)) {
      const source = await readFile(path, 'utf8');
      if (!source.includes('onApprove')) continue;
      const result = transform(source, path);
      if (!result.count) continue;
      total += result.count;
      console.log(`${dry ? 'would update' : 'updated'} ${path} (${result.count})`);
      if (!dry) await writeFile(path, result.source);
    }
  }
  console.log(`${total} onApprove prop${total === 1 ? '' : 's'} ${dry ? 'to rename' : 'renamed'}.`);
}
