'use client';

import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Sources.css';

export interface CitationProps {
  /** The number shown, matching the source's place in the list. */
  index: number;
  /** With an `href` it is a link; without, a button. */
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  /** Accessible name. Default "Source {index}". Add the title when you have it: "Source 1, Build 482 log". */
  label?: string;
  className?: string;
}

/** A numbered marker in the text that leads to a source. */
export function Citation({ index, href, onClick, label = `Source ${index}`, className }: CitationProps) {
  const props = { className: cx('cr-citation', className), 'aria-label': label, onClick };
  return href ? (
    <a href={href} {...props}>
      {index}
    </a>
  ) : (
    <button type="button" {...props}>
      {index}
    </button>
  );
}

export interface Source {
  title: ReactNode;
  /** Where it came from: a path, a site, a date. */
  detail?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface SourcesProps {
  /** In the order they are cited. Each is numbered from 1. */
  items: Source[];
  /** Accessible name of the list. Default "Sources". */
  label?: string;
  className?: string;
}

/** What an answer is based on: a numbered list with a title and where each one came from. */
export function Sources({ items, label = 'Sources', className }: SourcesProps) {
  return (
    <ol className={cx('cr-sources', className)} aria-label={label}>
      {items.map((source, i) => (
        <li key={i}>
          <a className="cr-sources__item cr-surface" href={source.href} onClick={source.onClick}>
            <span className="cr-sources__number" aria-hidden="true">
              {i + 1}
            </span>
            <span className="cr-sources__text">
              <span className="cr-sources__title">{source.title}</span>
              {source.detail && <span className="cr-sources__detail">{source.detail}</span>}
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}
