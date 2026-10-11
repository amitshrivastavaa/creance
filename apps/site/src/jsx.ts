// A small reader for the JSX people edit in the playground. It parses to a tree and evaluates the
// tree against a fixed scope, so nothing is ever passed to eval or new Function.
// Supported: elements and fragments, string / number / boolean / null literals, arrays, objects,
// names from the scope, member access, calls, and arrow functions whose body is one expression.
import { createElement, Fragment } from 'react';

type Node =
  | { t: 'lit'; v: unknown }
  | { t: 'arr'; items: Node[] }
  | { t: 'obj'; props: [string, Node][] }
  | { t: 'name'; name: string; at: number }
  | { t: 'member'; obj: Node; name: string }
  | { t: 'call'; callee: Node; args: Node[] }
  | { t: 'arrow'; params: string[]; body: Node }
  | { t: 'jsx'; tag: string | null; props: [string, Node][]; children: Node[]; at: number };

const IDENT = /^[A-Za-z_$][\w$]*/;
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s: string) => s.replace(/&(\w+);/g, (m, n) => ENTITIES[n] ?? m);

class Parser {
  pos = 0;
  constructor(readonly src: string) {}

  fail(msg: string, at = this.pos): never {
    const line = this.src.slice(0, at).split('\n').length;
    throw new Error(`Line ${line}: ${msg}`);
  }
  ws() {
    while (/\s/.test(this.src[this.pos] ?? '')) this.pos++;
  }
  at(s: string) {
    return this.src.startsWith(s, this.pos);
  }
  eat(s: string) {
    if (!this.at(s)) this.fail(`expected ${s}`);
    this.pos += s.length;
  }
  match(re: RegExp) {
    const m = re.exec(this.src.slice(this.pos));
    if (m) this.pos += m[0].length;
    return m;
  }

  root(): Node {
    const children = this.children(null);
    if (children.length === 1) return children[0]!;
    return { t: 'jsx', tag: null, props: [], children, at: 0 };
  }

  jsx(): Node {
    const at = this.pos;
    this.eat('<');
    if (this.at('>')) {
      this.pos++;
      return { t: 'jsx', tag: null, props: [], children: this.children(''), at };
    }
    const tag = this.match(/^[A-Za-z][\w.]*/)?.[0] ?? this.fail('expected a tag name');
    const props: [string, Node][] = [];
    for (;;) {
      this.ws();
      if (this.at('/>')) {
        this.pos += 2;
        return { t: 'jsx', tag, props, children: [], at };
      }
      if (this.at('>')) {
        this.pos++;
        return { t: 'jsx', tag, props, children: this.children(tag), at };
      }
      const name = this.match(/^[A-Za-z_][\w:-]*/)?.[0] ?? this.fail(`expected a prop, "/>" or ">" in <${tag}>`);
      if (!this.at('=')) {
        props.push([name, { t: 'lit', v: true }]);
        continue;
      }
      this.pos++;
      const q = this.src[this.pos];
      if (q === '"' || q === "'") {
        const end = this.src.indexOf(q, this.pos + 1);
        if (end < 0) this.fail('this string is not closed');
        props.push([name, { t: 'lit', v: decode(this.src.slice(this.pos + 1, end)) }]);
        this.pos = end + 1;
      } else {
        this.eat('{');
        props.push([name, this.expr()]);
        this.ws();
        this.eat('}');
      }
    }
  }

  /** Children up to the closing tag. `closing` is null at the top level and '' for a fragment. */
  children(closing: string | null): Node[] {
    const out: Node[] = [];
    for (;;) {
      if (this.pos >= this.src.length) {
        if (closing === null) return out;
        this.fail(closing ? `<${closing}> is not closed` : 'the fragment is not closed');
      }
      if (this.at('</')) {
        if (closing === null) this.fail('a closing tag with nothing open');
        this.pos += 2;
        const name = this.match(/^[A-Za-z][\w.]*/)?.[0] ?? '';
        if (name !== closing) this.fail(`expected </${closing}> but found </${name}>`);
        this.ws();
        this.eat('>');
        return out;
      }
      if (this.at('<')) {
        out.push(this.jsx());
      } else if (this.at('{')) {
        this.pos++;
        this.ws();
        if (this.at('/*')) {
          const end = this.src.indexOf('*/', this.pos);
          if (end < 0) this.fail('this comment is not closed');
          this.pos = end + 2;
          this.ws();
        } else if (!this.at('}')) {
          out.push(this.expr());
          this.ws();
        }
        this.eat('}');
      } else {
        const text = this.match(/^[^<{]+/)![0];
        // JSX whitespace: lines are trimmed and joined with single spaces.
        const lines = text.split('\n');
        const joined = lines
          .map((l, i) => {
            let s = l.replace(/\t/g, ' ');
            if (i > 0) s = s.replace(/^ +/, '');
            if (i < lines.length - 1) s = s.replace(/ +$/, '');
            return s;
          })
          .filter((s) => s.length)
          .join(' ');
        if (joined) out.push({ t: 'lit', v: decode(joined) });
      }
    }
  }

  expr(): Node {
    this.ws();
    const rest = this.src.slice(this.pos);
    const many = /^\(\s*((?:[A-Za-z_$][\w$]*\s*,?\s*)*)\)\s*=>/.exec(rest);
    const one = many ? null : /^([A-Za-z_$][\w$]*)\s*=>/.exec(rest);
    if (many || one) {
      this.pos += (many ?? one)![0].length;
      const params = (many ? many[1]! : one![1]!).split(',').map((p) => p.trim()).filter(Boolean);
      return { t: 'arrow', params, body: this.expr() };
    }
    let node = this.primary();
    for (;;) {
      if (this.at('.')) {
        this.pos++;
        const name = this.match(IDENT)?.[0] ?? this.fail('expected a name after "."');
        node = { t: 'member', obj: node, name };
      } else if (this.at('(')) {
        this.pos++;
        node = { t: 'call', callee: node, args: this.list(')') };
      } else {
        this.ws();
        const c = this.src[this.pos];
        if (c && '+-*/?&|=!'.includes(c) && !this.at('=>')) {
          this.fail(`"${c}" is not supported here. Use literal values, names from the sample data, and simple arrow functions.`);
        }
        return node;
      }
    }
  }

  list(close: string): Node[] {
    const items: Node[] = [];
    for (;;) {
      this.ws();
      if (this.at(close)) {
        this.pos++;
        return items;
      }
      items.push(this.expr());
      this.ws();
      if (this.at(',')) this.pos++;
      else if (!this.at(close)) this.fail(`expected "," or "${close}"`);
    }
  }

  primary(): Node {
    this.ws();
    const c = this.src[this.pos];
    if (c === undefined) this.fail('the code ends in the middle of a value');
    if (c === '<') return this.jsx();
    if (c === '(') {
      this.pos++;
      const inner = this.expr();
      this.ws();
      this.eat(')');
      return inner;
    }
    if (c === '[') {
      this.pos++;
      return { t: 'arr', items: this.list(']') };
    }
    if (c === '{') {
      this.pos++;
      const props: [string, Node][] = [];
      for (;;) {
        this.ws();
        if (this.at('}')) {
          this.pos++;
          return { t: 'obj', props };
        }
        const key = this.at('"') || this.at("'") ? String((this.string() as { v: unknown }).v) : (this.match(/^[\w$-]+/)?.[0] ?? this.fail('expected a key'));
        this.ws();
        this.eat(':');
        props.push([key, this.expr()]);
        this.ws();
        if (this.at(',')) this.pos++;
        else if (!this.at('}')) this.fail('expected "," or "}"');
      }
    }
    if (c === '"' || c === "'" || c === '`') return this.string();
    const num = this.match(/^-?\d[\d_]*(\.\d+)?/);
    if (num) return { t: 'lit', v: Number(num[0].replace(/_/g, '')) };
    const at = this.pos;
    const id = this.match(IDENT)?.[0];
    if (!id) this.fail(`unexpected "${c}"`);
    if (id === 'true') return { t: 'lit', v: true };
    if (id === 'false') return { t: 'lit', v: false };
    if (id === 'null') return { t: 'lit', v: null };
    if (id === 'undefined') return { t: 'lit', v: undefined };
    return { t: 'name', name: id!, at };
  }

  string(): Node {
    const q = this.src[this.pos]!;
    let out = '';
    this.pos++;
    for (;;) {
      const c = this.src[this.pos];
      if (c === undefined) this.fail('this string is not closed');
      this.pos++;
      if (c === q) return { t: 'lit', v: out };
      if (c === '\\') {
        const n = this.src[this.pos++];
        out += n === 'n' ? '\n' : n === 't' ? '\t' : (n ?? '');
      } else out += c;
    }
  }
}

export interface Runtime {
  /** Data and helper functions the code may name. */
  scope: Record<string, unknown>;
  /** Components the code may use as tags. */
  components: Record<string, unknown>;
  /** Called when a handler written as `log` fires. */
  report: (name: string, args: unknown[]) => void;
  /** Called when an arrow function in the code throws. */
  onError: (message: string) => void;
}

const BLOCKED_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'link', 'style', 'meta', 'base']);
const BLOCKED_PROPS = new Set(['dangerouslySetInnerHTML', 'ref', 'srcDoc']);
const own = (o: unknown, k: string) => Object.prototype.hasOwnProperty.call(o, k);

function line(src: string, at: number) {
  return src.slice(0, at).split('\n').length;
}

export function run(src: string, rt: Runtime) {
  const root = new Parser(src.trim()).root();
  const text = src.trim();

  const ev = (n: Node, locals: Record<string, unknown>, label?: string): unknown => {
    switch (n.t) {
      case 'lit':
        return n.v;
      case 'arr':
        return n.items.map((i) => ev(i, locals));
      case 'obj':
        return Object.fromEntries(n.props.map(([k, v]) => [k, ev(v, locals, k)]));
      case 'name':
        if (own(locals, n.name)) return locals[n.name];
        // `log` becomes a handler that reports its own prop name and arguments.
        if (n.name === 'log') return (...args: unknown[]) => rt.report(label ?? 'log', args);
        if (own(rt.scope, n.name)) return rt.scope[n.name];
        throw new Error(`Line ${line(text, n.at)}: "${n.name}" is not defined. Sample data: ${Object.keys(rt.scope).sort().join(', ')}.`);
      case 'member': {
        const o = ev(n.obj, locals) as Record<string, unknown> | null | undefined;
        if (o == null) throw new Error(`Can't read "${n.name}" of ${o}.`);
        if (n.name === 'length' && (Array.isArray(o) || typeof o === 'string')) return o.length;
        return own(o, n.name) ? o[n.name] : undefined;
      }
      case 'call': {
        const f = ev(n.callee, locals);
        if (typeof f !== 'function') throw new Error('That value is not a function, so it cannot be called.');
        return f(...n.args.map((a) => ev(a, locals)));
      }
      case 'arrow':
        return (...args: unknown[]) => {
          try {
            return ev(n.body, { ...locals, ...Object.fromEntries(n.params.map((p, i) => [p, args[i]])) });
          } catch (e) {
            rt.onError((e as Error).message);
            return undefined;
          }
        };
      case 'jsx': {
        let type: unknown = Fragment;
        if (n.tag !== null) {
          if (/^[a-z]/.test(n.tag)) {
            if (BLOCKED_TAGS.has(n.tag)) throw new Error(`Line ${line(text, n.at)}: <${n.tag}> is not allowed in the playground.`);
            type = n.tag;
          } else {
            type = rt.components[n.tag];
            if (!own(rt.components, n.tag) || !type) throw new Error(`Line ${line(text, n.at)}: <${n.tag}> is not a Creance component.`);
          }
        }
        const props: Record<string, unknown> = {};
        for (const [k, v] of n.props) {
          if (BLOCKED_PROPS.has(k)) throw new Error(`The "${k}" prop is not allowed in the playground.`);
          props[k] = ev(v, locals, k);
        }
        return createElement(type as never, props, ...n.children.map((c) => ev(c, locals) as never));
      }
    }
  };
  return ev(root, {});
}
