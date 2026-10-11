'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ArrowDownIcon } from '../../internal/icons';
import './Table.css';

export type SortDirection = 'ascending' | 'descending';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Makes the column sortable by this value. */
  sortValue?: (row: T) => string | number;
  align?: 'start' | 'end';
  /** The column that names each row; its cell becomes a row header for screen readers. */
  rowHeader?: boolean;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Describes the table. Visually hidden unless `showCaption`. */
  caption: ReactNode;
  showCaption?: boolean;
  /** Starting sort, or a controlled one with `onSortChange`. */
  sort?: { key: string; direction: SortDirection } | null;
  defaultSort?: { key: string; direction: SortDirection } | null;
  onSortChange?: (sort: { key: string; direction: SortDirection }) => void;
  /** Adds a checkbox column. Shift-click selects a range. */
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (keys: string[]) => void;
  /** Shown in a bar above the table while rows are selected. */
  bulkActions?: (keys: string[]) => ReactNode;
  /** How a row is named in its checkbox label: "Select Run 41". Defaults to the row key. */
  rowLabel?: (row: T) => string;
  emptyMessage?: ReactNode;
  className?: string;
}

/** A real table: sortable headers announce their order, rows can be selected for bulk actions. */
export function Table<T>({
  columns,
  rows,
  rowKey,
  caption,
  showCaption,
  sort,
  defaultSort = null,
  onSortChange,
  selectable,
  selected,
  onSelectedChange,
  bulkActions,
  rowLabel,
  emptyMessage = 'Nothing here yet',
  className,
}: TableProps<T>) {
  const [ownSort, setOwnSort] = useState(defaultSort);
  const activeSort = sort === undefined ? ownSort : sort;
  const [ownSelected, setOwnSelected] = useState<string[]>([]);
  const picked = selected ?? ownSelected;
  const lastClicked = useRef<number | null>(null);
  const all = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === activeSort?.key);
    if (!col?.sortValue || !activeSort) return rows;
    const dir = activeSort.direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = col.sortValue!(a);
      const y = col.sortValue!(b);
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
  }, [rows, columns, activeSort]);

  const keys = sorted.map(rowKey);
  const allPicked = keys.length > 0 && keys.every((k) => picked.includes(k));
  const somePicked = !allPicked && keys.some((k) => picked.includes(k));
  useEffect(() => {
    if (all.current) all.current.indeterminate = somePicked;
  }, [somePicked]);

  const setPicked = (next: string[]) => {
    if (selected === undefined) setOwnSelected(next);
    onSelectedChange?.(next);
  };

  const toggleSort = (key: string) => {
    const next = {
      key,
      direction: (activeSort?.key === key && activeSort.direction === 'ascending' ? 'descending' : 'ascending') as SortDirection,
    };
    if (sort === undefined) setOwnSort(next);
    onSortChange?.(next);
  };

  const toggleRow = (index: number, shift: boolean) => {
    const key = keys[index]!;
    const on = !picked.includes(key);
    let range = [key];
    if (shift && lastClicked.current !== null) {
      const [a, b] = [lastClicked.current, index].sort((m, n) => m - n);
      range = keys.slice(a, b! + 1);
    }
    lastClicked.current = index;
    setPicked(on ? [...new Set([...picked, ...range])] : picked.filter((k) => !range.includes(k)));
  };

  return (
    <div className={cx('cr-table', className)}>
      {selectable && bulkActions && picked.length > 0 && (
        <div className="cr-table__bulk" role="region" aria-label="Bulk actions">
          <span>{picked.length} selected</span>
          {bulkActions(picked)}
        </div>
      )}
      <div className="cr-table__scroll cr-surface">
        <table className="cr-table__table">
          <caption className={showCaption ? 'cr-table__caption' : 'cr-visually-hidden'}>{caption}</caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="cr-table__check">
                  <input
                    ref={all}
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allPicked}
                    onChange={() => setPicked(allPicked ? picked.filter((k) => !keys.includes(k)) : [...new Set([...picked, ...keys])])}
                  />
                </th>
              )}
              {columns.map((c) => {
                const dir = activeSort?.key === c.key ? activeSort.direction : undefined;
                return (
                  <th key={c.key} scope="col" aria-sort={c.sortValue ? (dir ?? 'none') : undefined} data-align={c.align} style={{ width: c.width }}>
                    {c.sortValue ? (
                      <button type="button" className="cr-table__sort" data-active={dir ? '' : undefined} onClick={() => toggleSort(c.key)}>
                        {c.header}
                        <ArrowDownIcon data-direction={dir} />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td className="cr-table__empty" colSpan={columns.length + (selectable ? 1 : 0)}>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {sorted.map((row, i) => {
              const key = keys[i]!;
              const on = picked.includes(key);
              return (
                <tr key={key} data-selected={on || undefined}>
                  {selectable && (
                    <td className="cr-table__check">
                      <input
                        type="checkbox"
                        aria-label={`Select ${rowLabel ? rowLabel(row) : key}`}
                        checked={on}
                        onChange={() => {}}
                        onClick={(e) => toggleRow(i, e.shiftKey)}
                      />
                    </td>
                  )}
                  {columns.map((c) => {
                    const Cell = c.rowHeader ? 'th' : 'td';
                    return (
                      <Cell key={c.key} scope={c.rowHeader ? 'row' : undefined} data-align={c.align}>
                        {c.cell(row)}
                      </Cell>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
