'use client';

import { useState } from 'react';
import { cx } from '../../internal/cx';
import { ChevronIcon } from '../../internal/icons';
import { CopyButton } from '../CopyButton';
import './JsonView.css';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface JsonViewProps {
  value: Json;
  /** Objects and arrays deeper than this start folded. Default 2. */
  expandDepth?: number;
  /** Show a copy button for the whole value. Default true. */
  copyable?: boolean;
  /** Names the region, such as "Tool result". */
  label?: string;
  className?: string;
}

/** JSON as a tree you can fold. Keys in ink, strings in grey; numbers and booleans stay ink. */
export function JsonView({ value, expandDepth = 2, copyable = true, label = 'JSON', className }: JsonViewProps) {
  return (
    <div className={cx('cr-json', className)}>
      {copyable && <CopyButton className="cr-json__copy" value={() => JSON.stringify(value, null, 2)} label={`Copy ${label}`} />}
      <div role="group" aria-label={label} className="cr-json__tree">
        <Node value={value} depth={0} expandDepth={expandDepth} last />
      </div>
    </div>
  );
}

function Node({ name, value, depth, expandDepth, last }: { name?: string; value: Json; depth: number; expandDepth: number; last: boolean }) {
  const branch = value !== null && typeof value === 'object';
  const [open, setOpen] = useState(depth < expandDepth);
  const comma = last ? '' : ',';
  const key = name !== undefined && (
    <>
      <span className="cr-json__key">&quot;{name}&quot;</span>
      <span className="cr-json__punct">: </span>
    </>
  );

  if (!branch) {
    return (
      <div className="cr-json__line">
        {key}
        <Leaf value={value} />
        <span className="cr-json__punct">{comma}</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries: [string, Json][] = isArray ? value.map((v, i) => [String(i), v]) : Object.entries(value);
  const [l, r] = isArray ? ['[', ']'] : ['{', '}'];
  const count = `${entries.length} ${isArray ? (entries.length === 1 ? 'item' : 'items') : entries.length === 1 ? 'key' : 'keys'}`;

  return (
    <div className="cr-json__branch">
      <div className="cr-json__line">
        <button type="button" className="cr-json__toggle" aria-expanded={open} aria-label={`${name ?? 'root'}, ${count}`} onClick={() => setOpen(!open)}>
          <ChevronIcon />
        </button>
        {key}
        <span className="cr-json__punct">{l}</span>
        {!open && (
          <>
            <span className="cr-json__count">{count}</span>
            <span className="cr-json__punct">
              {r}
              {comma}
            </span>
          </>
        )}
      </div>
      {open && (
        <>
          <div className="cr-json__children">
            {entries.map(([k, v], i) => (
              <Node key={k} name={isArray ? undefined : k} value={v} depth={depth + 1} expandDepth={expandDepth} last={i === entries.length - 1} />
            ))}
          </div>
          <div className="cr-json__line cr-json__close">
            <span className="cr-json__punct">
              {r}
              {comma}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function Leaf({ value }: { value: Json }) {
  if (typeof value === 'string') return <span className="cr-json__string">&quot;{value}&quot;</span>;
  return <span className="cr-json__literal">{String(value)}</span>;
}
