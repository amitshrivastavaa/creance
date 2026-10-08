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

### Atoms (18)

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
| **Separator**, **Skeleton** | A hairline and a loading placeholder, both hidden from screen readers by default. |

### Molecules (29)

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
| **DiffLine** | — | Same reasoning. One line of a diff has several coordinated parts (two line numbers, a sign, `<ins>`/`<del>`, screen-reader text) and only makes sense inside a diff. A strict reading would call it an atom; it's here because of what it means, not how it's built. |

### Organisms (6)

Each organism owns a whole interaction: its own structure, keyboard model, focus behaviour and live announcements.

| Component | Built from | What it owns |
|---|---|---|
| **ApprovalPrompt** | Button, Code, KeyboardHint, RiskLabel, Badge | The allow/deny decision: focus on arrival, scoped shortcuts, the resolved state. |
| **ToolCallCard** | ToolCallHeader, Code, Spinner, Button | One tool call's lifecycle, collapsible input and output, errors, retry. |
| **RunTimeline** | StatusBadge, Code, Button | The run's step tree, follow/pause/jump scrolling, and which transitions get announced. |
| **DiffReview** | DiffLine, Button, Badge, KeyboardHint, Code | Per-hunk decisions, J/K/Y/N review, the apply gate. |
| **NeedsYouInbox** | Avatar | Cross-agent prioritisation: sort order, counts, short accessible names. |
| **AgentHandoffBanner** | Avatar, Button | The end of the agent's turn: outcome, summary, next actions, focus. |

### Template (1)

**AgentRunLayout**: the run screen's layout. A header with agent, status and budget, timeline left, detail right, a banner slot, and the inbox in a Radix Dialog drawer. It takes organisms as slots (`timeline`, `detail`, `banner`, `inbox`) rather than data, so an app decides what goes in the detail panel. That is what keeps it a template rather than an organism.

### Page

**apps/demo** is the page: AgentRunLayout filled from `useAgentRun(events)` and wired to the simulator, deciding what the detail panel shows (an open approval, then an open diff, then the selected tool call).

## Rules this structure enforces

- **Imports point down.** Atoms never import molecules, molecules never import organisms, and no component imports the event model, reducer or simulator. Enforced by `no-restricted-imports` rules per level in `eslint.config.js`.
- **Domain meaning lives in molecules and up.** If an atom starts to know about agents, it has moved up a level.
- **Organisms own accessibility behaviour.** Focus management, shortcuts and live regions are organism concerns, so they are designed and tested in one place per interaction.
- **Templates take slots, not data.** If a layout starts fetching or deciding, it should become an organism or move into the page.
