import { forwardRef, type ReactNode } from 'react';
import { Kbd } from '../../atoms/Kbd';
import { Spinner } from '../../atoms/Spinner';
import { SearchIcon } from '../../internal/icons';
import { ClearableInput, type ClearableInputProps } from '../ClearableInput';

export interface SearchInputProps extends Omit<ClearableInputProps, 'leading' | 'trailing' | 'type'> {
  /** A shortcut hint shown while the field is empty, such as "⌘K". Display only: bind the key yourself. */
  shortcut?: ReactNode;
  /** Shows a spinner while results load. */
  loading?: boolean;
  /** Names the search landmark, so two on one page can be told apart. Defaults to the field's `aria-label`. */
  landmarkLabel?: string;
}

/** A pill-shaped search field inside `role="search"`: icon, optional shortcut hint, spinner and clear button. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { shortcut, loading, landmarkLabel, clearLabel = 'Clear search', className, ...props },
  ref,
) {
  return (
    <div role="search" aria-label={landmarkLabel ?? props['aria-label']} className={className}>
      <ClearableInput
        ref={ref}
        type="search"
        shape="pill"
        clearLabel={clearLabel}
        leading={<SearchIcon />}
        trailing={
          loading ? (
            <Spinner size="sm" label="Searching" />
          ) : shortcut ? (
            <Kbd className="cr-clearable__hint">{shortcut}</Kbd>
          ) : null
        }
        {...props}
      />
    </div>
  );
});
