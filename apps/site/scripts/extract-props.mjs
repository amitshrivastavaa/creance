// Reads the kit's TypeScript types and writes src/props.json: for every component folder, the props
// of each component it exports and the shape of each data type. Run from apps/site.
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../../packages/react');
const cfg = ts.getParsedCommandLineOfConfigFile(path.join(root, 'tsconfig.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} });
const entry = path.join(root, 'src/index.ts');
const program = ts.createProgram({ rootNames: [entry], options: cfg.options });
const checker = program.getTypeChecker();
const FLAGS = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

const fileOf = (sym) => sym.declarations?.[0]?.getSourceFile().fileName ?? '';
const isReactOrDom = (f) => f.includes('/@types/react') || f.includes('/typescript/lib/');
const isOwn = (f) => f.startsWith(path.join(root, 'src'));
const clean = (t) => {
  const text = t.replace(/ \| undefined$/, '').replace(/^undefined \| /, '').replace(/\s+/g, ' ');
  // TypeScript lists number choices in its own order; show them smallest first.
  const parts = text.split(' | ');
  return parts.length > 1 && parts.every((x) => /^\d+$/.test(x)) ? parts.sort((a, b) => a - b).join(' | ') : text;
};

/** Defaults written in the component's destructured parameter: `{ size = 'md' }`. */
function defaultsOf(decl) {
  let fn = decl;
  if (ts.isVariableDeclaration(decl) && decl.initializer && ts.isCallExpression(decl.initializer)) fn = decl.initializer.arguments[0];
  const pattern = fn?.parameters?.[0]?.name;
  const out = {};
  if (!pattern || !ts.isObjectBindingPattern(pattern)) return out;
  for (const el of pattern.elements) {
    if (!el.initializer || ts.isArrowFunction(el.initializer) || ts.isFunctionExpression(el.initializer)) continue;
    const text = el.initializer.getText();
    if (text.length <= 40) out[(el.propertyName ?? el.name).getText()] = text;
  }
  return out;
}

function propsOf(type, at, defaults = {}) {
  const members = type.isUnion() ? type.types : [type];
  const seen = new Map();
  let html = false;
  for (const member of members) {
    for (const p of checker.getPropertiesOfType(checker.getApparentType(member))) {
      const file = fileOf(p);
      if (isReactOrDom(file)) {
        html ||= p.name === 'onClick' || p.name === 'className';
        continue;
      }
      const typeText = clean(checker.typeToString(checker.getTypeOfSymbolAtLocation(p, at), at, FLAGS));
      const prev = seen.get(p.name);
      if (prev) {
        if (!prev.types.includes(typeText)) prev.types.push(typeText);
        continue;
      }
      seen.set(p.name, {
        name: p.name,
        types: [typeText],
        required: !(p.flags & ts.SymbolFlags.Optional),
        doc: ts.displayPartsToString(p.getDocumentationComment(checker)).replace(/\s+/g, ' ').trim(),
        deprecated: p.getJsDocTags().some((t) => t.name === 'deprecated'),
        own: isOwn(file),
      });
    }
  }
  const props = [...seen.values()]
    // A prop missing from one branch of a union is optional overall.
    .map((p) => ({ ...p, required: p.required && members.every((m) => checker.getPropertyOfType(checker.getApparentType(m), p.name)) }))
    .sort((a, b) => Number(b.own) - Number(a.own))
    .map(({ types, ...p }) => {
      delete p.own;
      let type = types.join(' | ');
      if (type.length > 160) type = `${type.slice(0, 157)}…`;
      return { ...p, type, ...(defaults[p.name] !== undefined ? { default: defaults[p.name] } : {}) };
    });
  return { props, html };
}

const pages = {};
const index = program.getSourceFile(entry);
for (const exported of checker.getExportsOfModule(checker.getSymbolAtLocation(index))) {
  const sym = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const decl = sym.valueDeclaration ?? sym.declarations?.[0];
  if (!decl) continue;
  const where = /\/src\/(?:atoms|molecules|organisms|templates)\/([^/]+)\//.exec(decl.getSourceFile().fileName);
  if (!where) continue;
  const page = (pages[where[1]] ??= []);
  const name = exported.name;

  if (sym.flags & ts.SymbolFlags.Value) {
    const sigs = checker.getTypeOfSymbolAtLocation(sym, decl).getCallSignatures();
    if (!sigs.length) continue;
    if (/^[A-Z]/.test(name)) {
      const param = sigs[0].parameters[0];
      const { props, html } = param ? propsOf(checker.getTypeOfSymbolAtLocation(param, decl), decl, defaultsOf(decl)) : { props: [], html: false };
      page.push({ kind: 'component', name, props, html, pos: decl.pos });
    } else {
      // A plain function such as toast(): show how it is called.
      page.push({ kind: 'function', name, signature: clean(checker.signatureToString(sigs[0], decl, FLAGS)), doc: ts.displayPartsToString(sym.getDocumentationComment(checker)).replace(/\s+/g, ' ').trim(), pos: decl.pos });
    }
  } else if (!name.endsWith('Props')) {
    const type = checker.getDeclaredTypeOfSymbol(sym);
    const literal = type.isUnion() && type.types.every((t) => t.isLiteral() || t.flags & (ts.TypeFlags.BooleanLiteral | ts.TypeFlags.Null | ts.TypeFlags.Undefined));
    if (literal) page.push({ kind: 'union', name, type: clean(checker.typeToString(type, decl, FLAGS | ts.TypeFormatFlags.InTypeAlias)), pos: decl.pos });
    else {
      const { props } = propsOf(type, decl);
      if (props.length) page.push({ kind: 'type', name, props, pos: decl.pos });
    }
  }
}

const rank = { component: 0, function: 1, type: 2, union: 3 };
for (const [name, parts] of Object.entries(pages)) {
  parts.sort((a, b) => Number(b.name === name) - Number(a.name === name) || rank[a.kind] - rank[b.kind] || a.pos - b.pos);
  parts.forEach((p) => delete p.pos);
}
fs.writeFileSync(path.join(import.meta.dirname, '../src/props.json'), JSON.stringify(pages));
const count = Object.values(pages).flat();
console.log(`props: ${Object.keys(pages).length} pages, ${count.filter((p) => p.kind === 'component').length} components, ${count.reduce((n, p) => n + (p.props?.length ?? 0), 0)} props`);
