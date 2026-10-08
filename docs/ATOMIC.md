# Atomic Design in Creance

Creance organises its components with Atomic Design: the source folders (`packages/react/src/atoms`, `molecules`, `organisms`, `templates`) and the Storybook sidebar follow the same levels. The levels are a way to find things and to keep dependencies pointing one way (a level only builds on levels below it), not a rulebook. Where the taxonomy and common sense disagree, common sense wins and this page says so.

## The levels

| Level | Definition here | Can depend on |
|---|---|---|
| **Atom** | One element or control with no product meaning of its own. Usable in any app. | Tokens, other atoms (rarely) |
| **Molecule** | A small group with one job and some domain meaning: a status with its elapsed time, a risk level, a line of a diff. | Atoms |
| **Organism** | A complete, self-contained piece of the product's job: approving an action, reviewing a diff. Owns its keyboard model, focus handling and announcements. | Atoms, molecules |
| **Template** | Page layout with slots. Renders what it is given; no data or behaviour of its own beyond the layout. | Anything below |
| **Page** | A template filled with real data and wired to behaviour. Lives in an app, not in the kit. | Everything |

Outside the levels: the event model (`events.ts`), the reducer and selectors (`run/`), the simulator (`simulator/`) and internal helpers (`internal/`: `LiveRegion`, `VisuallyHidden`, icons, `cx`). They are logic or plumbing, not components, and components never import the event model or the reducer.

## Where each component sits, and why

### Atoms (23)

| Component | Why it is an atom |
|---|---|
| **Button** | A styled `<button>`. Variants are visual weight only. |
| **IconButton** | A Button with an icon and a required accessible name. It wraps **Tooltip** to show that name, which is atom-on-atom composition, but it is still one control with no domain meaning, so it stays an atom. |
| **Badge** | Status as colour, icon and text. Knows the five statuses (running, waiting, blocked, done, failed), but not what they are attached to. |
| **Spinner** | An indeterminate indicator, optionally announced. |
| **Kbd** | A `<kbd>`. |
| **Code** | `<code>`, or a focusable, scrollable `<pre>` block. |
| **ProgressBar** | A native `<progress>` with tones. |
| **Avatar** | Agent or person identity. Agents are square and people round, so the difference doesn't rely on colour. |
| **Tooltip** | Radix Tooltip with the kit's styling. Built on Radix because positioning, dismissal and hover/focus timing are the hard parts. |
| **Input**, **Textarea**, **Select** | Native text controls, styled. `Select` is the native `<select>`, so the operating system draws its menu and it works on phones. |
| **Checkbox**, **Radio**, **Switch** | Native inputs with their label. `Switch` is a checkbox with `role="switch"`, so it still submits with forms. Each carries its own label because a check without one is never correct. |
| **Toggle** | A button that stays on or off (`aria-pressed`). |
| **StatusDot**, **LoadingDots** | A status as shape, tone and word; three pulsing dots beside what is happening. |
| **Gauge**, **MiddleTruncate** | A ring meter that turns red only past a set limit; a path or ID shortened in the middle, whole for screen readers. |
| **ErrorMessage** | One line of red text: what went wrong and what to do; announced only when asked. |
| **Separator**, **Skeleton** | A hairline and a loading placeholder, both hidden from screen readers by default. |

### Molecules (54)

| Component | Built from | Why it is a molecule |
|---|---|---|
| **StatusBadge** | Badge + elapsed time | Adds time and ticking behaviour: "Running · 12s". |
| **ToolCallHeader** | Code + StatusBadge | Names a tool call, maps its lifecycle (pending, running, success, error) onto badge statuses, shows the attempt. |
| **BudgetMeter** | ProgressBar + labels | Turns a number into "18.2K / 50K tokens", with warning and over-limit thresholds. |
| **KeyboardHint** | Kbd group + label | A shortcut and what it does. |
| **RiskLabel** | — | Structurally it is as simple as an atom. It is a molecule because it encodes product policy: the risk vocabulary (low, medium, high) and how each level is presented. Keeping it next to the other domain pieces makes it easier to find than putting it among generic atoms. |
| **Field** | Label + any control + hint or error | Wires `id`, `aria-describedby` and `aria-invalid` onto the control it wraps. |
| **RadioGroup** | Radio + fieldset | The question as a legend and one choice from a list. |
| **Tabs** | Radix Tabs | A segmented control and its panels; arrow keys move between tabs. |
| **Menu** | Radix DropdownMenu | Items, separators, shortcuts, a danger tone for destructive items. |
| **Dialog** | Radix Dialog | Title, description and actions in a sheet over a dimmed page; traps and returns focus. |
| **Toast** | Radix Toast + a small queue | `toast()` from anywhere, rendered by one `<Toaster />`; announced politely, kept while hovered. |
| **Alert**, **Card** | — | A message in the page, and a glass tile. Generic, but they combine an icon, title and text (Alert) or set the tile's rhythm (Card), so they sit with the other composed pieces. |
| **ClearableInput**, **SearchInput** | Input + clear button (+ icon, shortcut, spinner) | Clearing returns focus to the field; search sits in a named `search` landmark. |
| **Combobox**, **MultiSelect** | Input + listbox | Hand-built ARIA 1.2 comboboxes: focus stays in the field, `aria-activedescendant` moves, matches are bolded, an optional create option. MultiSelect adds chips. No Radix equivalent exists. |
| **Calendar** | Buttons in a grid | Day, week, month and year keys, single or range, `Intl` names. Hand-built. |
| **Slider**, **ToggleGroup** | Radix Slider, Radix ToggleGroup | Value formatting for screen readers, range thumbs, marks; a segmented control. |
| **Choicebox** | Native radios or checkboxes in cards | A choice that needs a sentence each. |
| **CopyButton**, **TextWithCopy** | IconButton + live region | Copies, confirms with a check, announces "Copied". |
| **SplitButton** | Button + Menu | A main action with alternatives. |
| **LoadMoreButton**, **ShowMore** | Button + Spinner; a fade and a toggle | Keep the person's place in long lists and long text. |
| **Feedback**, **ThemeSwitcher** | Toggle buttons + Textarea; native radios | A rating with an optional comment; light, dark or system, applied to `<html>`. |
| **Breadcrumbs**, **Pagination** | Links; buttons | Where you are, folding long trails; page numbers with gaps folded. |
| **CommandMenu** | Radix Dialog + the Combobox keyboard model | ⌘K search across agents, runs and actions, grouped. |
| **ContextMenu**, **DotsMenu** | Radix ContextMenu; IconButton + Menu | Secondary actions on right-click or a "…" button, sharing Menu's styles. |
| **Scroller**, **Collapse** | A focusable region; Radix Accordion | A horizontal strip with edge fades; sections that open and close, at a chosen heading level. |
| **Sheet**, **DestructiveActionModal** | Radix Dialog | A panel from an edge; an alert dialog that starts on Cancel and can require typing a name. |
| **ContextCard**, **RelativeTimeCard** | Radix Popover, anchored | A preview on hover or focus that never takes focus; "2 hours ago" with exact local and UTC times. |
| **Table**, **FileTree** | A real `<table>`; an ARIA tree | Sorting announced through `aria-sort`, Shift-click ranges and bulk actions; tree keyboard model with one tab stop. |
| **JsonView**, **Snippet** | Buttons; CopyButton | Foldable JSON in ink and grey; commands whose prompt sign is never copied. |
| **Entity**, **Description**, **EmptyState** | Avatar; `<dl>`; a heading and an action | Small compositions that set the kit's rhythm for identity rows, term lists and empty pages. |
| **Banner**, **ProjectBanner** | Icon + text + action + dismiss | Page-wide notices in three tones; dismissals can be remembered per browser. |
| **ErrorCard** | Heading + raw error + actions | A failure that needs a decision. |
| **BrowserFrame**, **PhoneFrame**, **Video** | Figures | Frames named by their captions; a player with glass controls that never autoplays and shows captions. |
| **ConfidenceMeter** | A band on a five-word scale + reasons | How sure the agent is, as a range in words, never a percentage. Rounds down when the range straddles two words. |
| **DiffLine** | — | Same reasoning. One line of a diff has several coordinated parts (two line numbers, a sign, `<ins>`/`<del>`, screen-reader text) and only makes sense inside a diff. A strict reading would call it an atom; it's here because of what it means, not how it's built. |

### Organisms (12)

Each organism owns a whole interaction: its own structure, keyboard model, focus behaviour and live announcements.

| Component | Built from | What it owns |
|---|---|---|
| **ApprovalPrompt** | Button, Code, KeyboardHint, RiskLabel, Badge | The allow/deny decision: focus on arrival, scoped shortcuts, the resolved state. |
| **ToolCallCard** | ToolCallHeader, Code, Spinner, Button | One tool call's lifecycle, collapsible input and output, errors, retry. |
| **RunTimeline** | StatusBadge, Code, Button | The run's step tree, follow/pause/jump scrolling, and which transitions get announced. |
| **DiffReview** | DiffLine, Button, Badge, KeyboardHint, Code | Per-hunk decisions, J/K/Y/N review, the apply gate. |
| **NeedsYouInbox** | Avatar | Cross-agent prioritisation: sort order, counts, short accessible names. |
| **AgentHandoffBanner** | Avatar, Button | The end of the agent's turn: outcome, summary, next actions, focus. |
| **KillSwitch** | Button + a timed hold | Stopping an agent on purpose: hold for a second by pointer or keyboard; letting go early does nothing. |
| **QuestionCard** | Radios + Textarea + Button | When the agent needs information, not permission: options, free text, its default shown openly. |
| **PlanEditor** | Input, IconButton, Button, live region | Reordering (Alt+arrows, announced), editing, removing and adding steps before anything runs. |
| **CheckpointRewind** | Radios + Button | Choosing a point to roll back to and seeing what it undoes before confirming. |
| **PermissionLedger** | Table, Button | Standing "Always allow" grants, their use since, revoking with undo. |
| **FleetSky** | Canvas + buttons | Many agents at once as birds on lines back to you; arrivals that need you are announced. |

### Template (1)

**AgentRunLayout**: the run screen's layout. A header with agent, status and budget, timeline left, detail right, a banner slot, and the inbox in a Radix Dialog drawer. It takes organisms as slots (`timeline`, `detail`, `banner`, `inbox`) rather than data, so an app decides what goes in the detail panel. That is what keeps it a template rather than an organism.

### Page

**apps/demo** is the page: AgentRunLayout filled from `useAgentRun(events)` and wired to the simulator, deciding what the detail panel shows (an open approval, then an open diff, then the selected tool call).

## Rules this structure enforces

- **Imports point down.** Atoms never import molecules, molecules never import organisms, and no component imports the event model, reducer or simulator. Enforced by `no-restricted-imports` rules per level in `eslint.config.js`.
- **Domain meaning lives in molecules and up.** If an atom starts to know about agents, it has moved up a level.
- **Organisms own accessibility behaviour.** Focus management, shortcuts and live regions are organism concerns, so they are designed and tested in one place per interaction.
- **Templates take slots, not data.** If a layout starts fetching or deciding, it should become an organism or move into the page.
