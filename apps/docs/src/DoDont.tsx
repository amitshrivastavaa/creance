import type { ReactNode } from 'react';

/** A "do" and a "don't" example side by side, for usage guideline pages. */
export function DoDont({ doThis, dont, doText, dontText }: { doThis: ReactNode; dont: ReactNode; doText: string; dontText: string }) {
  return (
    <div className="dodont">
      <figure className="dodont__item" data-kind="do">
        <div className="dodont__example">{doThis}</div>
        <figcaption>
          <strong>Do.</strong> {doText}
        </figcaption>
      </figure>
      <figure className="dodont__item" data-kind="dont">
        <div className="dodont__example">{dont}</div>
        <figcaption>
          <strong>Don't.</strong> {dontText}
        </figcaption>
      </figure>
    </div>
  );
}
