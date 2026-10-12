import type { ThemeChoice } from '@creance-ui/react';

/** The theme this page opened with. The head script has already restored the saved choice, so a switcher that starts here never resets it. */
export const savedTheme: ThemeChoice = (document.documentElement.dataset.theme as 'light' | 'dark' | undefined) ?? 'system';
