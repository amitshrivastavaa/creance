'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { Sheet, SheetContent } from '../../molecules/Sheet/Sheet';
import { cx } from '../../internal/cx';
import { MenuIcon } from '../../internal/icons';
import './AppShell.css';

export interface AppShellProps {
  /** Down the left, usually a Sidebar. When the shell is narrow it moves into a sheet opened from the header. */
  sidebar?: ReactNode;
  /** Across the top of the content: breadcrumbs, search, actions. */
  header?: ReactNode;
  /** A second column beside the content. It moves below the content when the shell is narrow. */
  aside?: ReactNode;
  /** The page. Rendered in `<main>`. */
  children: ReactNode;
  /** Height of the shell. Default is the full viewport. */
  height?: number | string;
  /** Title of the sheet that holds the sidebar on a narrow shell. Default "Navigation". */
  sidebarLabel?: string;
  /** Accessible name of the button that opens it. Default "Open navigation". */
  menuLabel?: string;
  /** Accessible name of the aside. */
  asideLabel?: string;
  /** Text of the link that jumps past the sidebar and header. Default "Skip to content". */
  skipLabel?: string;
  className?: string;
}

/**
 * The frame of an app: sidebar, header, content and an optional aside. Layout only: it renders the slots it is given.
 * The first thing in it is a skip link to the content.
 */
export function AppShell({
  sidebar,
  header,
  aside,
  children,
  height,
  sidebarLabel = 'Navigation',
  menuLabel = 'Open navigation',
  asideLabel,
  skipLabel = 'Skip to content',
  className,
}: AppShellProps) {
  const [open, setOpen] = useState(false);
  const mainId = useId();
  const style = height === undefined ? undefined : ({ '--cr-app-shell-height': typeof height === 'number' ? `${height}px` : height } as CSSProperties);

  return (
    <div className={cx('cr-app-shell', className)} style={style}>
      <div className="cr-app-shell__frame">
        <a className="cr-app-shell__skip" href={`#${mainId}`}>
          {skipLabel}
        </a>
        {sidebar && <div className="cr-app-shell__sidebar">{sidebar}</div>}
        <div className="cr-app-shell__column">
          {(header || sidebar) && (
            <header className="cr-app-shell__header" data-empty={header ? undefined : ''}>
              {sidebar && (
                <span className="cr-app-shell__menu">
                  <IconButton size="sm" icon={<MenuIcon />} label={menuLabel} tooltip={false} onClick={() => setOpen(true)} />
                </span>
              )}
              {header && <div className="cr-app-shell__header-slot">{header}</div>}
            </header>
          )}
          <div className="cr-app-shell__content">
            <main id={mainId} tabIndex={-1} className="cr-app-shell__main">
              {children}
            </main>
            {aside && (
              <aside className="cr-app-shell__aside" aria-label={asideLabel}>
                {aside}
              </aside>
            )}
          </div>
        </div>
      </div>
      {sidebar && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            title={sidebarLabel}
            className="cr-app-shell__sheet"
            // Following a link in the sidebar closes the sheet.
            onClick={(e) => (e.target as Element).closest('a') && setOpen(false)}
          >
            {open && sidebar}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
