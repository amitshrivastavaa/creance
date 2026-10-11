'use client';

import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Footer.css';

export interface FooterLink {
  label: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface FooterColumn {
  /** The column's heading, and the accessible name of its links. */
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  /** Logo and name. */
  brand?: ReactNode;
  /** A line about the product, under the brand. */
  description?: ReactNode;
  /** Groups of links. Leave out for a one-line footer. */
  columns?: FooterColumn[];
  /** Copyright and licence. */
  legal?: ReactNode;
  /** Links at the end of the bottom line. */
  links?: FooterLink[];
  /** Accessible name of the bottom links. Default "Footer". */
  linksLabel?: string;
  /** Anything else for the bottom line, such as a status. */
  children?: ReactNode;
  className?: string;
}

const link = (l: FooterLink, i: number) => (
  <li key={i}>
    <a className="cr-footer__link" href={l.href} onClick={l.onClick}>
      {l.label}
    </a>
  </li>
);

/** The end of a page: brand, groups of links, and a line for copyright. With only `legal` and `links` it is one line. */
export function Footer({ brand, description, columns, legal, links, linksLabel = 'Footer', children, className }: FooterProps) {
  const top = brand || description || columns?.length;
  return (
    <footer className={cx('cr-footer', className)}>
      {top && (
        <div className="cr-footer__top">
          {(brand || description) && (
            <div className="cr-footer__about">
              {brand && <div className="cr-footer__brand">{brand}</div>}
              {description && <p className="cr-footer__description">{description}</p>}
            </div>
          )}
          {columns?.map((column, c) => (
            <nav key={c} aria-label={column.title} className="cr-footer__column">
              <p className="cr-footer__title">{column.title}</p>
              <ul className="cr-footer__list">{column.links.map(link)}</ul>
            </nav>
          ))}
        </div>
      )}
      {(legal || links?.length || children) && (
        <div className="cr-footer__bottom" data-ruled={top ? '' : undefined}>
          {legal && <p className="cr-footer__legal">{legal}</p>}
          <div className="cr-footer__end">
            {children}
            {links && links.length > 0 && (
              <nav aria-label={linksLabel}>
                <ul className="cr-footer__inline">{links.map(link)}</ul>
              </nav>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
