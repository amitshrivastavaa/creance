import * as RadixAccordion from '@radix-ui/react-accordion';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ChevronIcon } from '../../internal/icons';
import './Collapse.css';

/**
 * A stack of sections that open and close. `type="multiple"` lets several stay open; `"single"`
 * keeps one. Radix Accordion: arrow keys move between headings.
 */
export const Collapse = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixAccordion.Root>>(function Collapse(
  { className, ...props },
  ref,
) {
  return <RadixAccordion.Root ref={ref} className={cx('cr-collapse', className)} {...props} />;
});

export interface CollapseItemProps extends Omit<ComponentPropsWithoutRef<typeof RadixAccordion.Item>, 'title'> {
  title: ReactNode;
  /** The heading level of the title in your page outline. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export const CollapseItem = forwardRef<HTMLDivElement, CollapseItemProps>(function CollapseItem(
  { title, headingLevel = 3, className, children, ...props },
  ref,
) {
  const H = `h${headingLevel}` as const;
  return (
    <RadixAccordion.Item ref={ref} className={cx('cr-collapse__item', className)} {...props}>
      <RadixAccordion.Header asChild>
        <H className="cr-collapse__heading">
          <RadixAccordion.Trigger className="cr-collapse__trigger">
            <ChevronIcon />
            {title}
          </RadixAccordion.Trigger>
        </H>
      </RadixAccordion.Header>
      <RadixAccordion.Content className="cr-collapse__content">
        <div className="cr-collapse__body">{children}</div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
});
