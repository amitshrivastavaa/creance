// Small inline icons. Decorative only: every use sits next to visible text.
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      className="cr-icon"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const CheckIcon = (p: IconProps) => <Icon {...p}><path d="M3 8.5l3 3 7-7" /></Icon>;
export const CrossIcon = (p: IconProps) => <Icon {...p}><path d="M4 4l8 8M12 4l-8 8" /></Icon>;
export const PauseIcon = (p: IconProps) => <Icon {...p}><circle cx="8" cy="8" r="6" /><path d="M8 5v3.5l2 1.5" /></Icon>;
export const BlockedIcon = (p: IconProps) => <Icon {...p}><circle cx="8" cy="8" r="6" /><path d="M4 12l8-8" /></Icon>;
export const AlertIcon = (p: IconProps) => <Icon {...p}><path d="M8 2l6.5 11.5h-13z" /><path d="M8 6.5v3M8 11.5v.01" /></Icon>;
export const DotIcon = (p: IconProps) => <Icon {...p}><circle cx="8" cy="8" r="3.5" fill="currentColor" stroke="none" /></Icon>;
export const ChevronIcon = (p: IconProps) => <Icon {...p}><path d="M6 4l4 4-4 4" /></Icon>;
export const RetryIcon = (p: IconProps) => <Icon {...p}><path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5v3h-3" /></Icon>;
export const ShieldIcon = (p: IconProps) => <Icon {...p}><path d="M8 1.5l5 2v4c0 3.3-2.2 5.8-5 7-2.8-1.2-5-3.7-5-7v-4z" /></Icon>;
export const ArrowDownIcon = (p: IconProps) => <Icon {...p}><path d="M8 3v10M4 9l4 4 4-4" /></Icon>;
export const ChevronDownIcon = (p: IconProps) => <Icon {...p}><path d="M4 6l4 4 4-4" /></Icon>;
export const InfoIcon = (p: IconProps) => <Icon {...p}><circle cx="8" cy="8" r="6.5" /><path d="M8 7.5v4M8 4.8v.01" /></Icon>;
