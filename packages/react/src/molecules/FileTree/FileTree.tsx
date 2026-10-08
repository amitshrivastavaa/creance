import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ChevronIcon } from '../../internal/icons';
import './FileTree.css';

export interface FileNode {
  id: string;
  name: string;
  /** Present for folders, even when empty. */
  children?: FileNode[];
  /** A short change marker: M modified, A added, D deleted. */
  status?: 'M' | 'A' | 'D';
}

export interface FileTreeProps {
  nodes: FileNode[];
  /** Names the tree, such as "Changed files". */
  label: string;
  defaultExpanded?: string[];
  selected?: string | null;
  onSelect?: (node: FileNode) => void;
  className?: string;
}

const statusWords = { M: 'modified', A: 'added', D: 'deleted' };

interface Row {
  node: FileNode;
  level: number;
  parent: string | null;
}

/**
 * Files and folders as an ARIA tree. Up and Down move, Right opens a folder or steps in, Left closes
 * it or steps out, Home and End jump, Enter selects. One stop in the tab order.
 */
export function FileTree({ nodes, label, defaultExpanded = [], selected, onSelect, className }: FileTreeProps) {
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded));
  const [ownSelected, setOwnSelected] = useState<string | null>(null);
  const current = selected === undefined ? ownSelected : selected;
  const [focused, setFocused] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLLIElement>());

  // The rows a person can see, in order: what the arrow keys walk.
  const rows = useMemo(() => {
    const out: Row[] = [];
    const walk = (list: FileNode[], level: number, parent: string | null) =>
      list.forEach((node) => {
        out.push({ node, level, parent });
        if (node.children && expanded.has(node.id)) walk(node.children, level + 1, node.id);
      });
    walk(nodes, 1, null);
    return out;
  }, [nodes, expanded]);

  const active = focused ?? current ?? rows[0]?.node.id ?? null;
  const focus = (id: string) => {
    setFocused(id);
    refs.current.get(id)?.focus();
  };
  const toggle = (id: string, open?: boolean) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (open ?? !next.has(id)) next.add(id);
      else next.delete(id);
      return next;
    });
  const select = (node: FileNode) => {
    if (selected === undefined) setOwnSelected(node.id);
    onSelect?.(node);
  };

  const onKeyDown = (e: KeyboardEvent, row: Row, index: number) => {
    const { node } = row;
    const folder = !!node.children;
    const open = expanded.has(node.id);
    const go: Record<string, () => void> = {
      ArrowDown: () => rows[index + 1] && focus(rows[index + 1]!.node.id),
      ArrowUp: () => rows[index - 1] && focus(rows[index - 1]!.node.id),
      Home: () => focus(rows[0]!.node.id),
      End: () => focus(rows[rows.length - 1]!.node.id),
      ArrowRight: () => (folder && !open ? toggle(node.id, true) : folder && node.children!.length ? focus(node.children![0]!.id) : undefined),
      ArrowLeft: () => (folder && open ? toggle(node.id, false) : row.parent ? focus(row.parent) : undefined),
      Enter: () => (folder ? toggle(node.id) : select(node)),
      ' ': () => (folder ? toggle(node.id) : select(node)),
    };
    if (go[e.key]) {
      e.preventDefault();
      e.stopPropagation();
      go[e.key]!();
    }
  };

  const render = (list: FileNode[]): ReactNode =>
    list.map((node) => {
      const index = rows.findIndex((r) => r.node.id === node.id);
      const row = rows[index]!;
      const folder = !!node.children;
      const open = expanded.has(node.id);
      return (
        <li
          key={node.id}
          ref={(el) => {
            if (el) refs.current.set(node.id, el);
            else refs.current.delete(node.id);
          }}
          role="treeitem"
          aria-level={row.level}
          aria-expanded={folder ? open : undefined}
          aria-selected={folder ? undefined : node.id === current}
          tabIndex={node.id === active ? 0 : -1}
          className="cr-tree__item"
          onKeyDown={(e) => onKeyDown(e, row, index)}
          onFocus={(e) => e.target === e.currentTarget && setFocused(node.id)}
        >
          {/* The row is drawn by this div; the li carries the tree semantics and focus. */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="cr-tree__row"
            style={{ paddingInlineStart: `${(row.level - 1) * 20 + 10}px` }}
            onClick={() => {
              focus(node.id);
              if (folder) toggle(node.id);
              else select(node);
            }}
          >
            <span className="cr-tree__twist" aria-hidden="true">
              {folder && <ChevronIcon />}
            </span>
            <span className="cr-tree__icon" aria-hidden="true" data-kind={folder ? 'folder' : 'file'} />
            <span className="cr-tree__name">{node.name}</span>
            {node.status && (
              <>
                <span className="cr-tree__status" aria-hidden="true" data-status={node.status}>
                  {node.status}
                </span>
                <span className="cr-visually-hidden">, {statusWords[node.status]}</span>
              </>
            )}
          </div>
          {folder && open && node.children!.length > 0 && <ul role="group">{render(node.children!)}</ul>}
        </li>
      );
    });

  return (
    <ul role="tree" aria-label={label} className={cx('cr-tree cr-surface', className)}>
      {render(nodes)}
    </ul>
  );
}
