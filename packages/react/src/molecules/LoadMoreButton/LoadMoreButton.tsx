'use client';

import { forwardRef } from 'react';
import { Button, type ButtonProps } from '../../atoms/Button';
import { Spinner } from '../../atoms/Spinner';
import { cx } from '../../internal/cx';
import './LoadMoreButton.css';

export interface LoadMoreButtonProps extends ButtonProps {
  loading?: boolean;
  /** Shown while loading. Default "Loading". */
  loadingLabel?: string;
}

/**
 * A full-width button under a list. While loading it stays focused and says so, so keyboard users
 * keep their place; move focus to the first new item yourself if that suits the list better.
 */
export const LoadMoreButton = forwardRef<HTMLButtonElement, LoadMoreButtonProps>(function LoadMoreButton(
  { loading, loadingLabel = 'Loading', children = 'Load more', className, onClick, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      className={cx('cr-load-more', className)}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={(e) => !loading && onClick?.(e)}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
});
