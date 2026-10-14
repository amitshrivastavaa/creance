# @creance-ui/react

## 0.6.0

### Patch Changes

- 5f1989a: StatusBadge, RelativeTimeCard, NeedsYouInbox and Calendar read the current time after they mount instead of while rendering, so they prerender in Next.js 16 with `cacheComponents` (its default for new apps) and no longer risk a hydration mismatch. Until mounted, an open-ended StatusBadge and the inbox's "waiting" time are left out, RelativeTimeCard shows the exact UTC time, and a Calendar with no value, `defaultMonth` or `today` waits to draw its month.
- 11a061f: StatusBadge keeps counting while waiting for a person, instead of showing the time it first appeared. ToolCallCard and AgentRunLayout keep a long input or output line inside the card, where it scrolls, instead of widening the page.

## 0.5.0

### Minor Changes

- e547c41: `Chat`, an organism that is a whole conversation in one component. Give it a list of messages and an `onSend`; it renders each turn with its reasoning and sources, starting suggestions, and the prompt input, follows new messages, turns Send into Stop while the agent works, and announces each finished reply once. Anything passed as children, such as an `ApprovalPrompt`, appears after the last message.

### Patch Changes

- 52c6645: AppShell's "Skip to content" link no longer shows above the shell when the shell is not at the top of the page. It was moved out of view rather than hidden, so it was only off-screen in a full-height app. It is now clipped until it has focus.

## 0.4.0

### Minor Changes

- 120ea54: App shell. Molecules: `Navbar` (a glass pill or flush bar; on a narrow bar the links move into a menu), `Sidebar` (grouped links with icons and counts, collapsing to icons that keep their names), `Steps` (horizontal or vertical, with done, current, upcoming and error states that are also spoken) and `Footer` (full, or one line). Template: `AppShell`, which arranges a sidebar, header, content and optional aside, starts with a skip link, and moves the sidebar into a sheet when it is narrow.
  
  All five respond to the width they are given, not the window, using container queries.
- 02e72b8: Charts. An atom, `Sparkline` (line, area or bars), and five molecules: `StatCard` (a number, a trend chip whose direction is also read out, and room for a sparkline), `LineChart` (a solid main series with a soft fill and dashed comparisons; point at it or use the arrow keys to read each point), `BarChart` (single with one bar picked out, or stacked), `DonutChart` (with each slice's value and share in the legend) and `BarList` (a ranking).
  
  They are hand-built in SVG and HTML with no charting dependency. Series are ink and grey, differing in lightness and line style, with red for failure. Every chart carries its data as a visually hidden table. The set is meant for two or three series or five slices; beyond that, use a charting library.
- 730a9ee: Conversation. Seven molecules for talking with an agent: `Message` (yours in a tile on the right, the agent's as plain text under its name, with pending and streaming states), `MessageList` (follows new messages until you scroll up, then offers "Jump to latest"), `PromptInput` (Enter sends, Shift+Enter starts a new line, Send becomes Stop while the agent works, files attach as chips), `Reasoning` (the thinking, folded behind how long it took), `Sources` with `Citation` markers, `Suggestions` and `ModelPicker`.
  
  `Message` takes whatever you render, so markdown is yours to parse. Existing components such as `ApprovalPrompt` and `ToolCallHeader` can sit inside a conversation.

## 0.3.0

### Minor Changes

- 73fbadb: Agent controls. Organisms: `KillSwitch` (hold to stop, by pointer or keyboard; `compact` for headers), `QuestionCard`, `PlanEditor` (reorder with Alt+arrows, edit, remove, add, announced), `CheckpointRewind` (see what a rewind undoes before confirming) and `PermissionLedger` (standing grants, revoke with undo). Molecule: `ConfidenceMeter`, a range in words with reasons, full or compact.
- bffccc4: Core controls. Atoms: `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Separator`, `Skeleton`, all native elements styled as glass. Molecules: `Field` (label, hint and error wired to any control), `RadioGroup`, `Tabs`, `Menu`, `Dialog`, `Toast` with `toast()` and `<Toaster />`, `Alert` and `Card`. Tabs, Menu, Dialog and Toast are built on Radix.
  
  The package now ships one module per source file, so bundlers drop components an app does not import. Importing only `ApprovalPrompt` costs 1.87 kB of Creance code, minified and brotlied.
  
  Fix: under `prefers-reduced-motion`, `FleetSky` drew once and could be left blank after its first resize; it also ignored agent status changes and theme switches. It now redraws on resize, on theme change and when agents change.
- 4e7c3b7: Overlays and data display. Atoms: `StatusDot`, `LoadingDots`, `Gauge`, `MiddleTruncate`. Molecules: `Sheet`, `DestructiveActionModal`, `ContextCard`, `RelativeTimeCard`, `Table` (sorting, selection with Shift-click ranges, bulk actions), `FileTree`, `JsonView`, `Snippet`, `Entity`, `Description` and `EmptyState`. Sheet, DestructiveActionModal and ContextCard use Radix Dialog and Popover; Table and FileTree are hand-built.
- 62b9417: Feedback and media. Atom: `ErrorMessage`. Molecules: `Banner` (neutral, ink or danger, dismissals remembered with `storageKey`), `ProjectBanner`, `ErrorCard`, `BrowserFrame`, `PhoneFrame` and `Video` (glass controls, starts muted, captions on, never autoplays).
- 30bf3e5: New visual language: frosted glass, neutral greys and one blue, in light and dark themes. Blue is for the one action that answers a request; ink (near-black in light, off-white in dark) marks what needs you and what is selected; red is only for failure and refusal. Titles and the interface use the system face (SF Pro on Apple devices, Inter elsewhere), commands SF Mono or JetBrains Mono. Buttons are glass capsules, 44px by default.
  
  Four public glass layers: `.cr-window`, `.cr-surface` (tile), `.cr-glass` (sheet) and `.cr-popover`. All turn solid with no blur under `prefers-reduced-transparency`, `prefers-contrast: more` or `data-transparency="reduce"`.
  
  New `FleetSky` organism and `skyAgent(run)` selector: your agents as birds on lines back to you; an agent that needs you flies back on a taut line. Name tags are real buttons, arrivals are announced, and nothing moves under `prefers-reduced-motion`.
  
  Token changes in `creance-tokens` (breaking for anyone reading these variables directly):
  
  - The `slate` primitive palette is now `gray`; new `blue` primitives; `red` gains `300`, `400` and `500`.
  - `--cr-glass-opacity` and `--cr-glass-filter` are replaced by per-layer tokens: `--cr-glass-opacity-{window,tile,sheet,popover,control}` and `--cr-glass-filter-{window,sheet}`.
  - `--cr-color-accent-*` is now blue (the primary action). The previous ink accent is `--cr-color-ink-*`.
  - New: `--cr-color-glass-{window,tile,sheet,popover,control,edge,highlight}`, `--cr-color-text-secondary`, `--cr-color-danger-text`, `--cr-control-height-{md,sm}`, `--cr-radius-2xl`, `--cr-shadow-sheet`, `--cr-shadow-accent`, `--cr-font-size-4xl`, `--cr-font-weight-bold`.
- e415e17: Inputs. Atom: `Toggle`. Molecules: `ClearableInput`, `SearchInput`, `Combobox`, `MultiSelect`, `Calendar` (single or range), `Slider` (single, range or stepped), `ToggleGroup`, `Choicebox`, `CopyButton`, `TextWithCopy`, `SplitButton`, `LoadMoreButton`, `ShowMore`, `Feedback` and `ThemeSwitcher`. Combobox, MultiSelect and Calendar are hand-built to the ARIA patterns; Slider and ToggleGroup use Radix.
- 807a54a: Navigation. Molecules: `Breadcrumbs`, `Pagination` (numbered or compact), `CommandMenu` (⌘K or Ctrl+K, grouped, filtered by label and keywords), `ContextMenu`, `DotsMenu`, `Scroller` and `Collapse`. ContextMenu and Collapse use Radix; CommandMenu uses Radix Dialog with the Combobox keyboard model.
- 3c40f9b: Next.js App Router support. The 51 modules that use state, effects, Radix or their own event handlers now start with `"use client"`, so they can be imported directly into a server component; the other 54, including Button, Input, Badge, Alert and the event reducer, stay free of client-only code. A new `apps/next` app renders all 90 components with Next.js 16, and a Playwright suite checks that the server sends them, that they hydrate without errors and that they respond.
  
  The unit tests now also run on React 18 in CI, the oldest version the peer dependency allows.

### Patch Changes

- 11455a9: SearchInput no longer shows two clear buttons in Chrome and Safari. The browser's own clear button for search fields is hidden inside ClearableInput, which already has one.

## 0.2.0

### Minor Changes

- `ApprovalPrompt`: new `onAllow` prop replaces `onApprove`, matching the **Allow once** / **Always allow** buttons. `onApprove` is deprecated: it keeps working, logs a one-time warning in development, and will be removed in 1.0. Migrate by renaming the prop, or run `npx creance-codemod-on-allow src`. See [docs/MIGRATIONS.md](../../docs/MIGRATIONS.md#020-approvalprompt-onapprove--onallow).
  
  `ToolCallCard`: new `previousAttempts` prop, so a call that succeeded on retry still shows why earlier attempts failed.

## 0.1.0

### Minor Changes

- First release. `creance-tokens` ships the colour, spacing, type, radius and motion tokens as CSS custom properties (light and dark) and a typed JS export. `creance` ships 9 atoms, 6 molecules, 6 organisms (ApprovalPrompt, ToolCallCard, RunTimeline, DiffReview, NeedsYouInbox, AgentHandoffBanner) and the AgentRunLayout template, plus the typed event model, `useAgentRun`, selectors, and `creance/simulator`.
