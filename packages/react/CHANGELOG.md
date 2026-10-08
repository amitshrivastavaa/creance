# creance

## 0.2.0

### Minor Changes

- `ApprovalPrompt`: new `onAllow` prop replaces `onApprove`, matching the **Allow once** / **Always allow** buttons. `onApprove` is deprecated: it keeps working, logs a one-time warning in development, and will be removed in 1.0. Migrate by renaming the prop, or run `npx creance-codemod-on-allow src`. See [docs/MIGRATIONS.md](../../docs/MIGRATIONS.md#020-approvalprompt-onapprove--onallow).
  
  `ToolCallCard`: new `previousAttempts` prop, so a call that succeeded on retry still shows why earlier attempts failed.

## 0.1.0

### Minor Changes

- First release. `creance-tokens` ships the colour, spacing, type, radius and motion tokens as CSS custom properties (light and dark) and a typed JS export. `creance` ships 9 atoms, 6 molecules, 6 organisms (ApprovalPrompt, ToolCallCard, RunTimeline, DiffReview, NeedsYouInbox, AgentHandoffBanner) and the AgentRunLayout template, plus the typed event model, `useAgentRun`, selectors, and `creance/simulator`.
