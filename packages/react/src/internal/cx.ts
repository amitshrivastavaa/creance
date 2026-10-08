// Shared base styles (.cr-visually-hidden, .cr-icon). Imported here because every component imports cx;
// an import in index.ts alone gets tree-shaken, since index.ts only re-exports.
import './base.css';

/** Joins class names, skipping falsy values. */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}
